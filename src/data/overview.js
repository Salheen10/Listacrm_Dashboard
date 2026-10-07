// Executive Overview read model.
// Mirrors the approved design: every figure is computed from one plan-level snapshot so cards, charts and
// tables reconcile. The snapshot and comparison ratios are mock until the aggregation API exists.
import { PLANS, ADDONS } from './catalog'
import { money } from '../utils/format'

export const PERIODS = {
  mtd: { label: 'Current month (MTD)', f: 7 / 31, sf: 0.25, range: 'Oct 1 – Oct 7, 2026', cmp: 'compared with Sep 1 – Sep 7', prev: 'same days last month' },
  d30: { label: 'Last 30 days', f: 1, sf: 1, range: 'Sep 8 – Oct 7, 2026', cmp: 'compared with the previous 30 days', prev: 'previous 30 days' },
  d90: { label: 'Last 90 days', f: 3, sf: 2.9, range: 'Jul 10 – Oct 7, 2026', cmp: 'compared with the previous 90 days', prev: 'previous 90 days' },
  ytd: { label: 'Year to date', f: 9.2, sf: 8.4, range: 'Jan 1 – Oct 7, 2026', cmp: 'compared with the same period in 2025', prev: 'same period last year' }
}

export const TENANT_TYPES = [
  { id: 'all', label: 'All types' },
  { id: 'agent', label: 'Individual agent' },
  { id: 'team', label: 'Team' },
  { id: 'brokerage', label: 'Brokerage' }
]

// Plan-level snapshot the aggregation API will return (mock).
// t: active paid tenants, wa: tenants with at least one add-on, ts: tenant-type shares,
// ad: [tenants, units] per add-on, then monthly flow and alert counts.
const SNAPSHOT = {
  Solo: { t: 96, wa: 22, lost: 4, conv: 21, ended: 52, newWs: 14, lostWs: 5, totalWs: 148, inv: 98, pd: 9, tr: 3, mls: 4, ms: 2, big: 0, rt: 3, ts: { agent: 1, team: 0, brokerage: 0 }, ad: { 'IDX Core': [6, 6], 'IDX Pro': [0, 0], 'Extra Seat': [0, 0], 'Extra Microsite': [18, 18] } },
  Growth: { t: 168, wa: 104, lost: 4, conv: 19, ended: 36, newWs: 11, lostWs: 4, totalWs: 201, inv: 176, pd: 7, tr: 2, mls: 5, ms: 4, big: 0, rt: 2, ts: { agent: 0.12, team: 0.74, brokerage: 0.14 }, ad: { 'IDX Core': [41, 41], 'IDX Pro': [22, 22], 'Extra Seat': [52, 148], 'Extra Microsite': [37, 74] } },
  Brokerage: { t: 58, wa: 44, lost: 1, conv: 6, ended: 10, newWs: 3, lostWs: 1, totalWs: 66, inv: 63, pd: 3, tr: 0, mls: 3, ms: 2, big: 2, rt: 1, ts: { agent: 0, team: 0.1, brokerage: 0.9 }, ad: { 'IDX Core': [12, 12], 'IDX Pro': [27, 27], 'Extra Seat': [31, 264], 'Extra Microsite': [22, 131] } },
  Enterprise: { t: 13, wa: 12, lost: 0, conv: 0, ended: 0, newWs: 0, lostWs: 0, totalWs: 14, inv: 14, pd: 0, tr: 0, mls: 0, ms: 0, big: 1, rt: 0, ts: { agent: 0, team: 0, brokerage: 1 }, ad: { 'IDX Core': [1, 1], 'IDX Pro': [11, 11], 'Extra Seat': [9, 410], 'Extra Microsite': [8, 240] } }
}

// Monthly MRR movement as % of MRR, 12 months ending Oct 2026.
const MOVE = {
  n: [1.9, 2.1, 1.7, 2.4, 2.0, 1.8, 2.2, 2.6, 2.3, 2.1, 2.5, 2.2],
  e: [0.9, 1.0, 0.8, 1.1, 1.2, 0.9, 1.0, 1.3, 1.1, 1.2, 1.4, 1.1],
  c: [0.4, 0.3, 0.5, 0.4, 0.3, 0.6, 0.4, 0.3, 0.4, 0.5, 0.3, 0.4],
  h: [0.9, 0.8, 1.1, 0.7, 0.9, 1.0, 0.8, 0.7, 0.9, 0.8, 0.7, 1.1]
}
const MONTHS = ['Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026']

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
  if (Math.abs(d) < 0.05) return { text: 'No change', tone: FLAT }
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

export function buildOverview({ plan, type, period }, promoSyncFailures = []) {
  const PD = PERIODS[period]
  const rows = PLANS.filter(p => plan === 'all' || p.id === plan).map(p => {
    const d = SNAPSHOT[p.id], k = type === 'all' ? 1 : d.ts[type], n = v => Math.round(v * k)
    const t = n(d.t), wa = Math.min(t, n(d.wa))
    let addMrr = 0
    const ad = {}
    ADDONS.forEach(a => {
      const mrr = n(d.ad[a.id][1]) * a.price
      ad[a.id] = { t: Math.min(wa, n(d.ad[a.id][0])), mrr }
      addMrr += mrr
    })
    return {
      plan: p, t, wa, wo: t - wa, addMrr, mrr: t * p.price + addMrr, withMrr: wa * p.price + addMrr, woMrr: (t - wa) * p.price, ad,
      pd: n(d.pd), pdMrr: n(d.pd) * p.price, big: n(d.big), mls: n(d.mls), ms: n(d.ms), rt: n(d.rt), trials: n(d.tr),
      lost: n(d.lost), conv: n(d.conv), ended: n(d.ended), newWs: n(d.newWs), lostWs: n(d.lostWs), totalWs: n(d.totalWs), inv: n(d.inv)
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
  const invoices = Math.round(sum(r => r.inv) * f), collected = gross * 0.94
  const paidTenants = f < 1 ? Math.round(T * 0.3) : Math.round(T * 0.96 + (f > 1 ? lost * f : 0))
  const mini = (label, cur, prev, value, inverse, sub) => ({ label, value, delta: pctDelta(cur, prev, inverse), sub })
  const minis = [
    mini('New workspaces', newWs, Math.round(newWs / 1.12), String(newWs), false, vs(Math.round(newWs / 1.12))),
    mini('Lost workspaces', lostWs, Math.round(lostWs * 1.22), String(lostWs), true, vs(Math.round(lostWs * 1.22))),
    { label: 'Total workspaces', value: sum(r => r.totalWs).toLocaleString('en-US'), delta: { text: '', tone: FLAT }, sub: `+${newWs} in this period` },
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
  const pd = sum(r => r.pd), trials = sum(r => r.trials), big = sum(r => r.big), mls = sum(r => r.mls), ms = sum(r => r.ms), rt = sum(r => r.rt)
  const alerts = [
    { sev: 'Critical', n: pd, title: `${pd} tenants past due`, detail: `${money(sum(r => r.pdMrr))} revenue at risk (past-due and grace MRR)`, age: '2h ago', to: 'billing', cta: 'Open financials' },
    { sev: 'Warning', n: trials, title: `${trials} trials end within 7 days`, detail: 'The window is a configurable rule, not a fixed value', age: '3h ago', to: 'onboarding', cta: 'Open onboarding' },
    { sev: 'Warning', n: big, title: `${big} large invoices overdue`, detail: 'Outstanding $1,000 or more and past the due date', age: '1d ago', to: 'billing', cta: 'Open financials' },
    ...promoSyncFailures.map(p => ({ sev: 'Warning', n: 1, title: '1 promo code failed Stripe sync', detail: `${p.code} is not redeemable until the sync is retried`, age: '1d ago', to: { name: 'promo-detail', params: { id: p.id } }, cta: 'Open promo code' })),
    { sev: 'Info', n: mls, title: `${mls} MLS verifications pending`, detail: 'Monitor only. Verification is agent and provider driven', age: '5h ago', to: 'compliance', cta: 'View status' },
    { sev: 'Info', n: ms, title: `${ms} microsites ready to publish`, detail: 'Customers self-publish once IDX is verified', age: '6h ago', to: 'compliance', cta: 'View status' },
    { sev: 'Info', n: rt, title: `${rt} payment retries scheduled today`, detail: 'Dunning retries run automatically', age: '8h ago', to: 'billing', cta: 'Open financials' }
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
  { cat: 'Billing', plan: 'Growth', title: 'Promo code AUTUMN26 redeemed', detail: 'Green Valley Homes · Growth · saved $35.80', age: '10m ago' },
  { cat: 'Workspace', plan: 'Solo', title: 'New workspace created', detail: 'Lighthouse Realty · Solo', age: '14m ago' },
  { cat: 'Billing', plan: 'Brokerage', title: 'Subscription upgraded', detail: 'Capital Brokers · Growth → Brokerage', age: '21m ago' },
  { cat: 'Billing', plan: 'Brokerage', title: 'Invoice paid', detail: 'Summit Brokers · Brokerage · $598.00', age: '34m ago' },
  { cat: 'Verification', plan: 'Growth', title: 'MLS verification confirmed by provider', detail: 'Pearl Real Estate · Growth', age: '52m ago' },
  { cat: 'Operator', title: 'Operator signed in', detail: 'mina magdy', age: '1h ago' },
  { cat: 'Billing', plan: 'Growth', title: 'Payment failed, retry scheduled', detail: 'Skyline Realty · Growth', age: '2h ago' },
  { cat: 'Workspace', plan: 'Enterprise', title: 'Add-on activated: IDX Pro', detail: 'Dar Al Arkan · Enterprise', age: '3h ago' }
]
