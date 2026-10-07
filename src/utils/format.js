const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Whole-dollar amounts (dashboard KPIs)
export const money = n => '$' + Math.round(n).toLocaleString('en-US')

// Integer cents (billing amounts) — money is never held as a float
export const usd = cents =>
  '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// 'YYYY-MM-DDTHH:MM' -> 'May 4, 2026'
export const fmtDate = iso => {
  if (!iso || iso.length < 10) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

// 'YYYY-MM-DDTHH:MM' -> 'May 4, 2026, 12:00 PM'
export const fmtDateTime = iso => {
  if (!iso || iso.length < 16) return fmtDate(iso)
  const [h, min] = iso.slice(11, 16).split(':').map(Number)
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${fmtDate(iso)}, ${h12}:${String(min).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
