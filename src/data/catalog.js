// Commercial catalogue used by the backoffice mock.
// In production these come from the versioned plan/add-on catalogue API, never from the dashboard bundle.

export const NOW = '2026-05-04T12:00'

export const PLANS = [
  { id: 'Solo', price: 79, freeSeats: 1, color: '#f0a23a' },
  { id: 'Growth', price: 179, freeSeats: 3, color: '#1a66f0' },
  { id: 'Brokerage', price: 399, freeSeats: 5, color: '#17a08c' },
  { id: 'Enterprise', price: 1200, freeSeats: 20, color: '#3d2a9e' }
]

const ALL_PLANS = PLANS.map(p => p.id)

export const ADDONS = [
  { id: 'IDX Core', price: 199, plans: ALL_PLANS },
  { id: 'IDX Pro', price: 349, plans: ALL_PLANS },
  { id: 'Extra Seat', price: 35, plans: ['Growth', 'Brokerage', 'Enterprise'] },
  { id: 'Extra Microsite', price: 29, plans: ALL_PLANS }
]

export const planById = id => PLANS.find(p => p.id === id)
export const addonById = id => ADDONS.find(a => a.id === id)
