/**
 * Calculate total rent for a stay.
 * Billing is per month: each partial month counts as a full month.
 */
export function totalRent(guest) {
  const checkIn = new Date(guest.check_in)
  const checkOut = new Date(guest.check_out)
  const daysStayed = Math.max(1, Math.ceil((checkOut - checkIn) / 86400000))
  const monthsStayed = Math.ceil(daysStayed / 30)
  return guest.monthly_rent * monthsStayed
}

/**
 * Balance still owed by guest.
 */
export function balanceDue(guest) {
  return totalRent(guest) - (guest.advance_paid ?? 0)
}

/**
 * Days until checkout from today. Negative means overdue.
 */
export function daysUntilCheckout(guest) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkOut = new Date(guest.check_out)
  return Math.ceil((checkOut - today) / 86400000)
}

/**
 * True if guest needs urgent attention (balance due AND checkout ≤ 3 days away).
 */
export function isUrgent(guest) {
  return (
    guest.status === 'checked-in' &&
    balanceDue(guest) > 0 &&
    daysUntilCheckout(guest) <= 3
  )
}

/**
 * Format a date string as "09 Mar 2026".
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Format rupees as "Rs. 8,000".
 */
export function formatRupees(amount) {
  if (amount == null) return '—'
  return `Rs. ${Number(amount).toLocaleString('en-IN')}`
}

/**
 * Duration of stay label.
 */
export function stayDuration(guest) {
  const checkIn = new Date(guest.check_in)
  const checkOut = new Date(guest.check_out)
  const days = Math.max(1, Math.ceil((checkOut - checkIn) / 86400000))
  return `${days} day${days !== 1 ? 's' : ''}`
}
