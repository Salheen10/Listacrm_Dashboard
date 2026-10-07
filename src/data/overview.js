// Executive Overview read model.
// Stock metrics (MRR, tenants, plan mix, add-on attach, revenue at risk) are derived from the workspace records.
// Period comparisons and flow counts are mock ratios until the aggregation API exists — the UI must not own formulas.
import { PLANS, ADDONS } from './catalog'
import { money } from '../utils/format'

export const PERIODS = {
  mtd: { label: 'Current month (MTD)', f: 4 / 31, sf: 0.15, range: 'May 1 – May 4, 2026', cmp: 'compared with Apr 1 – Apr 4', prev: 'same days last month' },
  d30: { label: 'Last 30 days', f: 1, sf: 1, range: 'Apr 5 – May 4, 2026', cmp: 'compared with the previous 30 days', prev: 'previous 30 days' },
  d90: { label: 'Last 90 days', f: 3, sf: 2.9, range: 'Feb 4 – May 4, 2026', cmp: 'compared with the previous 90 days', prev: 'previous 90 days' },
  ytd: { label: 'Year to date', f: 4.1, sf: 3.9, range: 'Jan 1 – May 4, 2026', cmp: 'compared with the same period in 2025', prev: 'same period last year' }
}

export const TENANT_TYPES = [
  { id: 'all', label: 'All types' },
  { id: 'agent', label: 'Individual agent' },
  { id: 'team', label: 'Team' },
  { id: 'brokerage', label: 'Brokerage' }
]

const tenantType = w => (w.users <= 1 ? 'agent' : w.users <= 10 ? 'team' : 'brokerage')

// Mock monthly flow counts per plan (lost paid tenants, trial outcomes, workspace movement).
const FLOWS = {
  Solo: { lost: 1, conv: 5, ended: 12, newWs: 3, lostWs: 1, archived: 4, trials: 2 },
  Growth: { lost: 1, conv: 4, ended: 8, newWs: 2, lostWs: 1, archived: 3, trials: 1 },
  Brokerage: { lost: 0, conv: 1, ended: 2, newWs: 1, lostWs: 0, archived: 1, trials: 0 },
  Enterprise: { lost: 0, conv: 0, ended: 0, newWs: 0, lostWs: 0, archived: 0, trials: 0 }
}

// Monthly MRR movement as % of MRR, 12 months ending May 2026.
const MOVE = {
  n: [1.9, 2.1, 1.7, 2.4, 2.0, 1.8, 2.2, 2.6, 2.3, 2.1, 2.5, 2.2],
  e: [0.9, 1.0, 0.8, 1.1, 1.2, 0.9, 1.0, 1.3, 1.1, 1.2, 1.4, 1.1],
  c: [0.4, 0.3, 0.5, 0.4, 0.3, 0.6, 0.4, 0.3, 0.4, 0.5, 0.3, 0.4],
  h: [0.9, 0.8, 1.1, 0.7, 0.9, 1.0, 0.8, 0.7, 0.9, 0.8, 0.7, 1.1]
}
const MONTHS = ['Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026']

const GOOD = 'up', BAD = 'down', FLAT = 'flat'

const pctDelta = (cur, prev, inverse = false) => {
  if (!prev && !cur) return { text: '—', tone: FLAT }
  if (!prev) return { text: 'New', tone: GOOD }
  const d = (cur - prev) / Math.abs(prev) * 100, up = d >= 0
  if (Math.abs(d) < 0.05) return { text: 'No change', tone: FLAT }
  return { text: `${up ? '↑' : '↓'} ${Math.abs(d).toFixed(1)}%`, tone: (inverse ? !up : up) ? GOOD : BAD }
}
// Rate metrics change in percentage points, never relative percent.
const ppDelta = (cur, prev, inverse = false) => {
  const d = cur - prev, up = d >= 0
  return { text: `${up ? '↑' : '↓'} ${Math.abs(d).toFixed(1)} pp`, tone: Math.abs(d) < 0.05 ? FLAT : ((inverse ? !up : up) ? GOOD : BAD) }
}
const NONE = { text: '—', tone: FLAT }

const series = (cur, prev, seed) => {
  // Trend line toward the current value; a small wobble keeps it from looking ruled.
  const span = Math.max(Math.abs(cur - prev), Math.abs(cur) * 0.03) * (cur >= prev ? 1 : -1)
  const start = cur - span
  return Array.from({ length: 12 }, (_, i) => start + span * i / 11 + (i === 11 ? 0 : Math.sin(i * 1.3 + seed) * Math.abs(span) * 0.12))
}

// Points for an SVG polyline in a 100 x 40 box.
export const sparkPoints = vals => {
  const mn = Math.min(...vals), rg = (Math.max(...vals) - mn) || 1
  return vals.map((v, i) => `${(i / (vals.length - 1) * 100).toFixed(1)},${(35 - (v - mn) / rg * 30).toFixed(1)}`).join(' ')
}

export function buildOverview(workspaces, { plan, type, period }, promoSyncFailures = []) {
  const PD = PERIODS[period]
  // Enterprise accounts still in contract are pipeline, not recurring revenue.
  const billable = workspaces.filter(w => w.status !== 'Contract Required')
  const inScope = w => (plan === 'all' || w.plan === plan) && (type === 'all' || tenantType(w) === type)

  const rows = PLANS.filter(p => plan === 'all' || p.id === plan).map(p => {
    const all = billable.filter(w => w.plan === p.id)
    const ws = all.filter(inScope)
    const k = all.length ? ws.length / all.length : 0
    const ad = Object.fromEntries(ADDONS.map(a => [a.id, { t: 0, mrr: 0 }]))
    let wa = 0, mrr = 0, addMrr = 0, withMrr = 0, pd = 0, pdMrr = 0, big = 0, idxPending = 0
    ws.forEach(w => {
      const seats = Math.max(0, w.users - p.freeSeats)
      const parts = {
        'IDX Core': w.idx === 'IDX Core' ? 199 : 0,
        'IDX Pro': w.idx === 'IDX Pro' ? 349 : 0,
        'Extra Seat': seats * 35,
        'Extra Microsite': w.microsites * 29
      }
      const add = Object.values(parts).reduce((x, v) => x + v, 0)
      Object.entries(parts).forEach(([id, v]) => { if (v > 0) { ad[id].t += 1; ad[id].mrr += v } })
      mrr += w.mrr; addMrr += add
      if (add > 0) { wa += 1; withMrr += w.mrr }
      if (w.status === 'Payment Failed') { pd += 1; pdMrr += w.mrr; if (w.mrr >= 1000) big += 1 }
      if (w.idx !== 'Not Purchased' && w.onboarding !== 'First Value') idxPending += 1
    })
    const fl = FLOWS[p.id], n = v => Math.round(v * k)
    return {
      plan: p, t: ws.length, wa, wo: ws.length - wa, mrr, addMrr, withMrr, woMrr: mrr - withMrr, ad,
      pd, pdMrr, big, idxPending,
      lost: n(fl.lost), conv: n(fl.conv), ended: n(fl.ended), newWs: n(fl.newWs), lostWs: n(fl.lostWs), totalWs: ws.length + n(fl.archived), trials: n(fl.trials)
    }
  })
  const sum = f => rows.reduce((x, r) => x + f(r), 0)
  const M = sum(r => r.mrr), T = sum(r => r.t), f = PD.f, sf = PD.sf

  // MRR movement, walked back from current MRR.
  const mv = []
  let tot = M
  for (let i = 11; i >= 0; i--) {
    const n = Math.round(M * MOVE.n[i] / 100), e = Math.round(M * MOVE.e[i] / 100), c = Math.round(M * MOVE.c[i] / 100), h = Math.round(M * MOVE.h[i] / 100)
    mv[i] = { label: MONTHS[i], short: MONTHS[i].slice(0, 3), n, e, c, h, net: n + e - c - h, total: tot }
    tot -= n + e - c - h
  }
  const g30 = mv[10].total ? mv[11].net / mv[10].total : 0
  const maxPos = Math.max(...mv.map(m => m.n + m.e)) || 1
  const maxNeg = Math.max(...mv.map(m => m.c + m.h))
  const totals = mv.map(m => m.total), tMin = Math.min(...totals), tRange = (Math.max(...totals) - tMin) || 1
  mv.forEach(m => { m.y = 86 - (m.total - tMin) / tRange * 72 })

  // Primary KPIs
  const prevM = M / (1 + g30 * sf), prevT = Math.round(T / (1 + 0.012 * sf))
  const arpu = T ? M / T : 0, prevArpu = prevT ? prevM / prevT : 0
  const lost = sum(r => r.lost), mChurn = prevT ? lost / prevT : 0
  const churn = mChurn * f * 100, prevChurn = churn * 1.1
  const ltv = mChurn ? arpu / mChurn : 0, prevLtv = mChurn ? prevArpu / (mChurn * 1.1) : 0
  const conv = sum(r => r.conv), ended = sum(r => r.ended), t2p = ended ? conv / ended * 100 : 0
  const gross = M * f * 1.03, prevGross = gross / 1.029
  const kpi = (id, label, cur, prev, value, delta, color, seed, help, sub) =>
    ({ id, label, value, delta, color, help, sub, points: sparkPoints(series(cur, prev, seed)) })
  const vs = v => `${v} ${PD.prev}`
  const kpis = [
    kpi('mrr', 'MRR', M, prevM, money(M), pctDelta(M, prevM), '#15703a', 1, 'Sum of monthly-normalized recurring amounts for base plans, active add-ons and extra seats as of period end. Excludes trials, tax, one-time charges and proration.', vs(money(prevM))),
    kpi('arr', 'ARR', M * 12, prevM * 12, money(M * 12), pctDelta(M, prevM), '#1a66f0', 2, 'MRR × 12. Derived only from MRR, never summed from annual invoices.', vs(money(prevM * 12))),
    kpi('apt', 'Active paid tenants', T, prevT, T.toLocaleString('en-US'), pctDelta(T, prevT), '#3d2a9e', 3, 'Distinct tenants with recurring MRR above zero and a billable, non-terminal subscription as of period end. Excludes trials and internal workspaces.', vs(prevT)),
    kpi('gross', 'Gross revenue', gross, prevGross, money(gross), pctDelta(gross, prevGross), '#b3600b', 4, 'Finalized invoice subtotals after discounts, excluding tax, issued in the selected period. Includes proration and one-time items.', vs(money(prevGross))),
    kpi('arpu', 'ARPU', arpu, prevArpu, T ? money(arpu) : '—', T ? pctDelta(arpu, prevArpu) : NONE, '#1a66f0', 5, 'MRR ÷ active paid tenants.', T ? vs(money(prevArpu)) : 'No paid tenants in scope'),
    kpi('ltv', 'LTV', ltv, prevLtv, mChurn ? money(ltv) : '—', mChurn ? pctDelta(ltv, prevLtv) : NONE, '#15703a', 6, 'ARPU ÷ monthly logo churn rate.', mChurn ? vs(money(prevLtv)) : 'Insufficient churn denominator'),
    kpi('churn', 'Logo churn', churn, prevChurn, T ? churn.toFixed(1) + '%' : '—', T ? ppDelta(churn, prevChurn, true) : NONE, '#b42318', 7, 'Paid tenants lost in the period ÷ active paid tenants at period start. Trial expiry is excluded.', T ? vs(prevChurn.toFixed(1) + '%') : 'No paid tenants in scope'),
    kpi('t2p', 'Trial → paid', t2p, t2p - 2.1, ended ? t2p.toFixed(1) + '%' : '—', ended ? ppDelta(t2p, t2p - 2.1) : NONE, '#1a66f0', 8, 'Converted trials ÷ all trials that reached a terminal outcome in the period. Open trials are excluded.', ended ? vs((t2p - 2.1).toFixed(1) + '%') : 'No trial outcomes in scope')
  ]

  // Secondary KPIs
  const newWs = Math.round(sum(r => r.newWs) * f), lostWs = Math.round(sum(r => r.lostWs) * f)
  const invoices = Math.round(T * f), collected = gross * 0.94
  const paidTenants = Math.min(T, Math.max(invoices - sum(r => r.pd), 0))
  const miniBars = (cur, prev, seed) => {
    const v = series(cur, prev, seed).slice(-6), mx = Math.max(...v, 1)
    return v.map(x => Math.max(18, Math.round(x / mx * 100)))
  }
  const mini = (label, cur, prev, value, inverse, sub) => ({ label, value, delta: pctDelta(cur, prev, inverse), sub, bars: miniBars(cur, prev, label.length) })
  const minis = [
    mini('New workspaces', newWs, Math.round(newWs / 1.12), String(newWs), false, vs(Math.round(newWs / 1.12))),
    mini('Lost workspaces', lostWs, Math.round(lostWs * 1.22), String(lostWs), true, vs(Math.round(lostWs * 1.22))),
    { label: 'Total workspaces', value: sum(r => r.totalWs).toLocaleString('en-US'), delta: { text: '—', tone: FLAT }, sub: `+${newWs} in this period`, bars: miniBars(sum(r => r.totalWs), sum(r => r.totalWs) - newWs * 6, 3) },
    mini('Invoices', invoices, Math.round(invoices / 1.06), String(invoices), false, vs(Math.round(invoices / 1.06))),
    mini('Collected', collected, collected / 1.084, money(collected), false, vs(money(collected / 1.084))),
    mini('Paid tenants', paidTenants, Math.round(paidTenants / 1.037), String(paidTenants), false, vs(Math.round(paidTenants / 1.037)))
  ]

  // Add-on attach among entitled plans
  const addons = ADDONS.map(a => {
    const el = rows.filter(r => a.plans.includes(r.plan.id))
    const attached = el.reduce((x, r) => x + r.ad[a.id].t, 0), base = el.reduce((x, r) => x + r.t, 0), mrr = el.reduce((x, r) => x + r.ad[a.id].mrr, 0)
    const rate = base ? attached / base * 100 : 0
    return { name: a.id, rate: base ? rate.toFixed(0) + '%' : '—', width: Math.min(100, rate), count: `${attached} of ${base} eligible`, mrr: money(mrr), eligible: a.plans.length === PLANS.length ? 'All plans' : a.plans.join(', ') }
  })

  // Alerts — monitoring surfaces only; none of these approve or publish anything.
  const pd = sum(r => r.pd), trials = sum(r => r.trials), big = sum(r => r.big), idxPending = sum(r => r.idxPending)
  const alerts = [
    { sev: 'Critical', n: pd, title: `${pd} tenant${pd === 1 ? '' : 's'} past due`, detail: `${money(sum(r => r.pdMrr))} revenue at risk (past-due and grace MRR)`, age: '2h ago', to: 'billing', cta: 'Open billing' },
    { sev: 'Warning', n: trials, title: `${trials} trial${trials === 1 ? '' : 's'} end within 7 days`, detail: 'The window is a configurable rule, not a fixed value', age: '3h ago', to: 'onboarding', cta: 'Open onboarding' },
    { sev: 'Warning', n: big, title: `${big} large invoice${big === 1 ? '' : 's'} overdue`, detail: 'Outstanding $1,000 or more and past the due date', age: '1d ago', to: 'billing', cta: 'Open billing' },
    ...promoSyncFailures.map(p => ({ sev: 'Warning', n: 1, title: 'Promo code failed Stripe sync', detail: `${p.code} is not redeemable until the sync is retried`, age: '1d ago', to: { name: 'promo-detail', params: { id: p.id } }, cta: 'Open promo code' })),
    { sev: 'Info', n: idxPending, title: `${idxPending} IDX / MLS verification${idxPending === 1 ? '' : 's'} pending`, detail: 'Monitor only. Verification is agent and provider driven', age: '5h ago', to: 'compliance', cta: 'View status' }
  ].filter(a => a.n > 0)

  return { period: PD, rows, total: { mrr: M, tenants: T }, empty: T === 0, kpis, minis, months: mv, chart: { unit: 150 / maxPos, negHeight: maxNeg * (150 / maxPos) + 2, linePoints: mv.map((m, i) => `${((i + 0.5) / 12 * 100).toFixed(2)},${m.y.toFixed(2)}`).join(' ') }, addons, alerts }
}

const MIX_NOTE = {
  all: 'All active paid tenants. MRR includes base plan, add-ons and extra seats.',
  with: 'Tenants with at least one active add-on. MRR is their base plan plus add-ons.',
  without: 'Tenants on the base plan only. MRR is base plan revenue.',
  addons: 'Add-on and extra-seat revenue only, attributed to the tenant’s plan.'
}

export function buildMix(rows, mode, by) {
  const raw = rows.map(r => ({
    name: r.plan.id, color: r.plan.color, base: r.t,
    tenants: mode === 'all' ? r.t : mode === 'without' ? r.wo : r.wa,
    mrr: mode === 'all' ? r.mrr : mode === 'with' ? r.withMrr : mode === 'without' ? r.woMrr : r.addMrr
  }))
  const tenants = raw.reduce((x, r) => x + r.tenants, 0), mrr = raw.reduce((x, r) => x + r.mrr, 0), allTenants = rows.reduce((x, r) => x + r.t, 0)
  const basis = by === 'tenants' ? tenants : mrr
  const share = (a, b) => (b ? (a / b * 100).toFixed(1) + '%' : '—')
  let acc = 0
  const stops = []
  raw.forEach(r => {
    const v = by === 'tenants' ? r.tenants : r.mrr
    if (basis && v) { stops.push(`${r.color} ${(acc / basis * 100).toFixed(2)}% ${((acc + v) / basis * 100).toFixed(2)}%`); acc += v }
  })
  return {
    rows: raw.map(r => ({ name: r.name, color: r.color, tenants: r.tenants, pct: mode === 'all' ? share(r.tenants, tenants) : share(r.tenants, r.base), mrr: money(r.mrr) })),
    total: { tenants, pct: mode === 'all' ? (tenants ? '100%' : '—') : share(tenants, allTenants), mrr: money(mrr) },
    donut: stops.length ? `conic-gradient(${stops.join(', ')})` : '#e9edf4',
    center: by === 'tenants' ? tenants.toLocaleString('en-US') : money(mrr), centerLabel: by === 'tenants' ? 'tenants' : 'MRR',
    pctHead: mode === 'all' ? '% of total' : '% of plan', mrrHead: mode === 'addons' ? 'Add-on MRR' : 'MRR',
    summary: `${tenants.toLocaleString('en-US')} tenants · ${money(mrr)}${mode === 'addons' ? ' add-on MRR' : ' MRR'}`, note: MIX_NOTE[mode]
  }
}

export const ACTIVITY = [
  { cat: 'Billing', plan: 'Growth', title: 'Promo code SPRING26 redeemed', detail: 'Green Valley Homes · Growth · saved $35.80', age: '10m ago' },
  { cat: 'Workspace', plan: 'Solo', title: 'New workspace created', detail: 'Lighthouse Realty · Solo', age: '14m ago' },
  { cat: 'Billing', plan: 'Brokerage', title: 'Subscription upgraded', detail: 'Capital Brokers · Growth → Brokerage', age: '21m ago' },
  { cat: 'Billing', plan: 'Brokerage', title: 'Invoice paid', detail: 'Summit Brokers · Brokerage', age: '34m ago' },
  { cat: 'Verification', plan: 'Growth', title: 'MLS verification confirmed by provider', detail: 'Pearl Real Estate · Growth', age: '52m ago' },
  { cat: 'Operator', title: 'Operator signed in', detail: 'mina magdy', age: '1h ago' },
  { cat: 'Billing', plan: 'Growth', title: 'Payment failed, retry scheduled', detail: 'Skyline Realty · Growth', age: '2h ago' },
  { cat: 'Workspace', plan: 'Enterprise', title: 'Add-on activated: IDX Pro', detail: 'Dar Al Arkan · Enterprise', age: '3h ago' }
]
