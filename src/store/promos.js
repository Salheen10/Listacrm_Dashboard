import { defineStore } from 'pinia'
import { NOW, PLANS, ADDONS, planById, addonById } from '../data/catalog'
import { usd, fmtDateTime } from '../utils/format'

const ACTOR = 'mina magdy'

// Catalogue items a promo of this target type can be scoped to (prices in cents).
export const scopeItems = target =>
  (target === 'ADD_ON' ? ADDONS : PLANS).map(i => ({ id: i.id, price: i.price * 100 }))

export const itemPrice = id => ((planById(id) || addonById(id) || { price: 0 }).price) * 100

export const TARGET_LABEL = { PLAN: 'Plan', ADD_ON: 'Add-on', RENEWAL: 'Renewal' }
// What the discount is calculated on, per target type.
export const APPLIES_TO = {
  PLAN: 'Base plan line only',
  ADD_ON: 'Selected add-on line only',
  RENEWAL: 'Total renewal invoice: plan + add-ons + extra seats'
}
export const MODE_LABEL = { PERCENTAGE: 'Percentage', FIXED_AMOUNT: 'Fixed amount', FULL_DISCOUNT: 'Full discount' }

// Status is derived from draft flag, provider sync, manual deactivation and the validity window.
export const statusOf = (p, now = NOW) => {
  if (p.draft) return 'Draft'
  if (p.sync === 'Failed' || p.sync === 'Pending') return p.sync === 'Failed' ? 'Sync failed' : 'Syncing'
  if (p.manual) return 'Inactive'
  if (now < p.start) return 'Scheduled'
  if (now > p.end) return 'Expired'
  return 'Active'
}

// Discount on an eligible subtotal, in cents. Never exceeds the subtotal.
export const discountOf = (p, cents) => {
  if (p.mode === 'FULL_DISCOUNT') return cents
  if (p.mode === 'PERCENTAGE') return Math.min(cents, Math.max(0, Math.round(cents * (Number(p.value) || 0) / 100)))
  return Math.min(cents, Math.max(0, Math.round((Number(p.value) || 0) * 100)))
}

export const discountLabel = p => {
  if (p.mode === 'FULL_DISCOUNT') return '100% off'
  if (!(Number(p.value) > 0)) return '—'
  return p.mode === 'PERCENTAGE' ? `${Number(p.value)}% off` : `${usd(Math.round(p.value * 100))} off`
}

export const totalsOf = p => {
  const original = p.reds.reduce((s, r) => s + r.orig, 0)
  const discount = p.reds.reduce((s, r) => s + discountOf(p, r.orig), 0)
  return { uses: p.reds.length, original, discount, final: original - discount }
}

// Workspace plan and the billing admin who redeemed, by workspace id (mock directory).
const WORKSPACES = {
  'WS-10008': ['Solo', 'Nour Fathy', 'nour.fathy@lighthouse-realty.example'],
  'WS-10009': ['Solo', 'Amr Samir', 'amr.samir@cedar-homes.example'],
  'WS-10011': ['Solo', 'Rana Hany', 'rana.hany@sahara-estates.example'],
  'WS-10012': ['Solo', 'Hany Lotfy', 'hany.lotfy@coralbay-realty.example'],
  'WS-20001': ['Growth', 'Omar Farouk', 'omar.farouk@greenvalley-homes.example'],
  'WS-20002': ['Growth', 'Sara Mansour', 'sara.mansour@elite-hometeam.example'],
  'WS-20003': ['Growth', 'Mona Adel', 'mona.adel@trust-brokers.example'],
  'WS-20009': ['Growth', 'Tarek Salem', 'tarek.salem@capital-brokers.example'],
  'WS-20013': ['Growth', 'Youssef Karim', 'youssef.karim@amber-properties.example'],
  'WS-20014': ['Growth', 'Heba Mostafa', 'heba.mostafa@silverkey-homes.example'],
  'WS-30003': ['Brokerage', 'Khaled Nabil', 'khaled.nabil@summit-brokers.example'],
  'WS-30007': ['Brokerage', 'Dina Aziz', 'dina.aziz@crown-realty.example'],
  'WS-30009': ['Brokerage', 'Salma Reda', 'salma.reda@vista-properties.example']
}
const red = (ws, wsId, inv, item, at, kind = 'Plan purchase') => {
  const [plan, admin, adminEmail] = WORKSPACES[wsId] || []
  return { ws, wsId, plan, admin, adminEmail, inv, item, orig: itemPrice(item), at, kind }
}
const log = (at, what, who = ACTOR) => ({ at, who, what })

const seed = () => [
  {
    id: 'promo-autumn26', code: 'AUTUMN26', name: 'Autumn 2026 Campaign', label: 'Autumn Special – 20% Off',
    desc: 'Seasonal promotion for new workspaces. 20% off the first invoice.',
    target: 'PLAN', mode: 'PERCENTAGE', value: 20, currency: 'USD', scope: ['Growth', 'Brokerage'], cap: null,
    start: '2026-09-01T00:00', end: '2026-11-30T23:59', tz: 'UTC', manual: null, sync: 'Synced', draft: false,
    stripe: { coupon: 'co_autumn26', promotion: 'promo_autumn26' }, createdBy: ACTOR, createdAt: '2026-08-25T10:12',
    reds: [
      red('Green Valley Homes', 'WS-20001', 'INV-26-0412', 'Growth', '2026-10-04T09:12'),
      red('Elite Home Team', 'WS-20002', 'INV-26-0397', 'Growth', '2026-09-28T14:40'),
      red('Summit Brokers', 'WS-30003', 'INV-26-0371', 'Brokerage', '2026-09-21T11:05'),
      red('Crown Realty Group', 'WS-30007', 'INV-26-0349', 'Brokerage', '2026-09-14T16:22'),
      red('Amber Properties', 'WS-20013', 'INV-26-0318', 'Growth', '2026-09-06T08:51')
    ],
    failed: [
      { ws: 'Skyline Realty', wsId: 'WS-20004', reason: 'Payment failed — promo not consumed', at: '2026-09-30T13:02' },
      { ws: 'Atlas Realty', wsId: 'WS-20011', reason: 'Checkout abandoned — reservation released', at: '2026-09-17T19:44' }
    ],
    audit: [log('2026-08-25T10:12', 'Promo code created'), log('2026-08-25T10:12', 'Stripe coupon and promotion code synced', 'System')]
  },
  {
    id: 'promo-idxlaunch', code: 'IDXLAUNCH', name: 'IDX Core launch offer', label: '$50 off IDX Core',
    desc: 'Launch incentive for the first IDX Core invoice.',
    target: 'ADD_ON', mode: 'FIXED_AMOUNT', value: 50, currency: 'USD', scope: ['IDX Core'], cap: 200,
    start: '2026-08-01T00:00', end: '2026-10-31T23:59', tz: 'UTC', manual: null, sync: 'Synced', draft: false,
    stripe: { coupon: 'co_idxlaunch', promotion: 'promo_idxlaunch' }, createdBy: ACTOR, createdAt: '2026-07-24T09:30',
    reds: [
      red('Trust Brokers', 'WS-20003', 'INV-26-0366', 'IDX Core', '2026-09-20T10:18', 'Add-on purchase'),
      red('Capital Brokers', 'WS-20009', 'INV-26-0301', 'IDX Core', '2026-09-02T15:07', 'Add-on purchase'),
      red('Silver Key Homes', 'WS-20014', 'INV-26-0244', 'IDX Core', '2026-08-12T12:33', 'Add-on purchase')
    ],
    failed: [],
    audit: [log('2026-07-24T09:30', 'Promo code created'), log('2026-07-24T09:30', 'Stripe coupon and promotion code synced', 'System')]
  },
  {
    id: 'promo-renew15', code: 'RENEW15', name: 'Winter renewal retention', label: '15% off your next renewal',
    desc: 'Retention offer applied at the next renewal charge.',
    target: 'RENEWAL', mode: 'PERCENTAGE', value: 15, currency: 'USD', scope: ['Solo', 'Growth'], cap: null,
    start: '2026-11-01T00:00', end: '2027-01-31T23:59', tz: 'UTC', manual: null, sync: 'Synced', draft: false,
    stripe: { coupon: 'co_renew15', promotion: 'promo_renew15' }, createdBy: ACTOR, createdAt: '2026-09-29T17:02',
    reds: [], failed: [],
    audit: [log('2026-09-29T17:02', 'Promo code created (scheduled)'), log('2026-09-29T17:02', 'Stripe coupon and promotion code synced', 'System')]
  },
  {
    id: 'promo-welcome100', code: 'WELCOME100', name: 'Solo launch — first month free', label: 'First month free',
    desc: 'Full discount on the first Solo invoice.',
    target: 'PLAN', mode: 'FULL_DISCOUNT', value: 0, currency: 'USD', scope: ['Solo'], cap: null,
    start: '2026-04-01T00:00', end: '2026-06-30T23:59', tz: 'UTC', manual: null, sync: 'Synced', draft: false,
    stripe: { coupon: 'co_welcome100', promotion: 'promo_welcome100' }, createdBy: ACTOR, createdAt: '2026-03-27T11:45',
    reds: [
      red('Lighthouse Realty', 'WS-10008', 'INV-26-0058', 'Solo', '2026-06-22T10:10'),
      red('Cedar Homes', 'WS-10009', 'INV-26-0031', 'Solo', '2026-06-09T13:26'),
      red('Sahara Estates', 'WS-10011', 'INV-25-0988', 'Solo', '2026-05-15T09:02'),
      red('Coral Bay Realty', 'WS-10012', 'INV-25-0941', 'Solo', '2026-04-28T16:48')
    ],
    failed: [],
    audit: [log('2026-03-27T11:45', 'Promo code created'), log('2026-06-30T23:59', 'Promo code expired', 'System')]
  },
  {
    id: 'promo-broker10', code: 'BROKER10', name: 'Brokerage partner referral', label: '10% off Brokerage',
    desc: 'Partner referral offer.',
    target: 'PLAN', mode: 'PERCENTAGE', value: 10, currency: 'USD', scope: ['Brokerage'], cap: null,
    start: '2026-07-01T00:00', end: '2026-12-31T23:59', tz: 'UTC', manual: { at: '2026-09-12T15:30', by: ACTOR, reason: 'Campaign ended early' }, sync: 'Synced', draft: false,
    stripe: { coupon: 'co_broker10', promotion: 'promo_broker10' }, createdBy: ACTOR, createdAt: '2026-06-28T08:20',
    reds: [red('Vista Properties', 'WS-30009', 'INV-26-0199', 'Brokerage', '2026-07-26T14:14')],
    failed: [],
    audit: [log('2026-06-28T08:20', 'Promo code created'), log('2026-09-12T15:30', 'Deactivated — Campaign ended early')]
  },
  {
    id: 'promo-seats20', code: 'SEATS20', name: 'Extra seats expansion push', label: '$20 off extra seats',
    desc: 'Expansion incentive for growing teams.',
    target: 'ADD_ON', mode: 'FIXED_AMOUNT', value: 20, currency: 'USD', scope: ['Extra Seat'], cap: null,
    start: '2026-10-01T00:00', end: '2026-12-31T23:59', tz: 'UTC', manual: null, sync: 'Failed', draft: false,
    stripe: null, createdBy: ACTOR, createdAt: '2026-10-03T16:05',
    reds: [], failed: [],
    audit: [log('2026-10-03T16:05', 'Promo code created'), log('2026-10-03T16:05', 'Stripe sync failed — provider temporarily unavailable', 'System')]
  }
]

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export const usePromoStore = defineStore('promos', {
  state: () => ({ promos: seed(), flash: null }),
  getters: {
    byId: state => id => state.promos.find(p => p.id === id),
    syncFailures: state => state.promos.filter(p => statusOf(p) === 'Sync failed')
  },
  actions: {
    isCodeTaken(code, exceptId) {
      const norm = String(code).trim().toUpperCase()
      return this.promos.some(p => p.code.toUpperCase() === norm && p.id !== exceptId)
    },
    setFlash(tone, text) { this.flash = { tone, text } },
    clearFlash() { this.flash = null },

    fromForm(form, extra) {
      return {
        id: form.id || 'promo-' + form.code.toLowerCase() + '-' + Date.now().toString(36),
        code: form.code, name: form.name, label: form.label, desc: form.desc,
        target: form.target, mode: form.mode, value: form.mode === 'FULL_DISCOUNT' ? 0 : Number(form.value) || 0,
        currency: form.currency, scope: [...form.scope], cap: form.capMode === 'cap' ? Number(form.cap) : null,
        start: `${form.startDate}T${form.startTime}`, end: `${form.endDate}T${form.endTime}`, tz: form.tz,
        manual: null, reds: [], failed: [], createdBy: ACTOR, createdAt: NOW,
        ...extra
      }
    },
    upsert(promo) {
      this.promos = [promo, ...this.promos.filter(p => p.id !== promo.id)]
    },

    saveDraft(form) {
      const promo = this.fromForm(form, { draft: true, sync: 'Disabled', stripe: null, form: { ...form, scope: [...form.scope] }, audit: [log(NOW, 'Draft saved')] })
      promo.form.id = promo.id
      this.upsert(promo)
      this.setFlash('ok', `Draft ${promo.code} saved. It is not redeemable until it is created and synced with Stripe.`)
      return promo
    },

    // Creates the ListaCRM record, then syncs the Stripe coupon/promotion (idempotent on promo id in the real API).
    async create(form) {
      await wait(1200)
      const ref = form.code.toLowerCase()
      const promo = this.fromForm(form, {
        draft: false, sync: 'Synced', stripe: { coupon: 'co_' + ref, promotion: 'promo_' + ref },
        audit: [log(NOW, 'Promo code created'), log(NOW, 'Stripe coupon and promotion code synced', 'System')]
      })
      this.upsert(promo)
      this.setFlash('ok', statusOf(promo) === 'Scheduled'
        ? `Promo code ${promo.code} is scheduled to become active on ${fmtDateTime(promo.start)}.`
        : `Promo code ${promo.code} was created successfully.`)
      return promo
    },

    deactivate(id, reason) {
      const p = this.byId(id)
      if (!p) return
      p.manual = { at: NOW, by: ACTOR, reason }
      p.audit.push(log(NOW, `Deactivated — ${reason}`))
      this.setFlash('ok', `Promo code ${p.code} is now inactive. New redemptions are blocked.`)
    },
    reactivate(id) {
      const p = this.byId(id)
      if (!p) return
      p.manual = null
      p.audit.push(log(NOW, 'Reactivated within validity window'))
      this.setFlash('ok', `Promo code ${p.code} is active again.`)
    },
    async retrySync(id) {
      const p = this.byId(id)
      if (!p) return
      p.sync = 'Pending'
      p.audit.push(log(NOW, 'Stripe sync retried'))
      await wait(1200)
      const ref = p.code.toLowerCase()
      p.sync = 'Synced'
      p.stripe = { coupon: 'co_' + ref, promotion: 'promo_' + ref }
      p.audit.push(log(NOW, 'Stripe coupon and promotion code synced', 'System'))
      this.setFlash('ok', `Stripe sync completed. Promo code ${p.code} is now ${statusOf(p).toLowerCase()}.`)
    }
  }
})
