import { CheckCircle2, MessageCircle, FileText, LogOut } from 'lucide-react'
import { useGuests } from '../hooks/useGuests'
import { balanceDue, daysUntilCheckout, formatDate, formatRupees } from '../utils/business'
import { generateSlip } from '../utils/pdf'
import { sendWhatsAppReminder } from '../utils/whatsapp'
import { useToast } from './ui/Toast'
import { SkeletonRow } from './ui/Skeleton'

export function Reminders() {
  const { guests, loading, settleBalance, checkOutGuest } = useGuests()
  const { addToast } = useToast()

  const active = guests.filter(g => g.status === 'checked-in')
  const pendingPayments = active.filter(g => balanceDue(g) > 0)
  const upcomingCheckouts = active
    .filter(g => {
      const d = daysUntilCheckout(g)
      return d <= 7
    })
    .sort((a, b) => daysUntilCheckout(a) - daysUntilCheckout(b))

  function urgencyStyle(days) {
    if (days <= 3) return 'text-red-600 bg-red-50'
    if (days <= 7) return 'text-amber-700 bg-amber-50'
    return 'text-gray-600 bg-gray-50'
  }

  function countdownLabel(days) {
    if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
    if (days === 0) return 'Today!'
    return `${days} day${days !== 1 ? 's' : ''} left`
  }

  async function handleSettle(guest) {
    try {
      await settleBalance(guest)
      addToast(`Balance settled for ${guest.name}`)
    } catch {
      addToast('Failed to settle balance', 'error')
    }
  }

  async function handleWhatsApp(guest) {
    try {
      await sendWhatsAppReminder(guest)
      addToast(`WhatsApp reminder sent to ${guest.name}`)
    } catch (err) {
      addToast(err.message ?? 'Failed to send reminder', 'error')
    }
  }

  async function handleCheckOut(guest) {
    if (!window.confirm(`Check out ${guest.name}?`)) return
    try {
      await checkOutGuest(guest.id)
      addToast(`${guest.name} checked out`)
    } catch {
      addToast('Failed to check out guest', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Pending Payments */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Pending Payments</h2>
          {pendingPayments.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              {pendingPayments.length}
            </span>
          )}
        </div>

        {loading ? (
          <table className="w-full"><tbody>{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
        ) : pendingPayments.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No pending payments. All caught up!</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingPayments.map(guest => {
              const days = daysUntilCheckout(guest)
              const balance = balanceDue(guest)
              const style = urgencyStyle(days)
              return (
                <div key={guest.id} className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex-shrink-0 px-2 py-1 rounded text-xs font-semibold ${style}`}>
                      {countdownLabel(days)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">{guest.name}</div>
                      <div className="text-xs text-gray-500">{guest.room} · {guest.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-red-600">{formatRupees(balance)}</span>
                    <button
                      onClick={() => handleWhatsApp(guest)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#065F46] bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle size={13} /> Send WA
                    </button>
                    <button
                      onClick={() => handleSettle(guest)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#065F46] hover:bg-[#047857] rounded transition-colors"
                    >
                      <CheckCircle2 size={13} /> Settle
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Upcoming Checkouts */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Upcoming Check-Outs <span className="text-sm text-gray-400 font-normal">(next 7 days)</span></h2>
        </div>

        {loading ? (
          <table className="w-full"><tbody>{[...Array(2)].map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
        ) : upcomingCheckouts.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No check-outs in the next 7 days.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingCheckouts.map(guest => {
              const days = daysUntilCheckout(guest)
              return (
                <div key={guest.id} className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 px-2 py-1 rounded text-xs font-semibold ${urgencyStyle(days)}`}>
                      {countdownLabel(days)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{guest.name}</div>
                      <div className="text-xs text-gray-500">{guest.room} · Out: {formatDate(guest.check_out)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateSlip(guest)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      <FileText size={13} /> Slip
                    </button>
                    <button
                      onClick={() => handleCheckOut(guest)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      <LogOut size={13} /> Check Out
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
