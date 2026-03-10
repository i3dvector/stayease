import { AlertCircle, Home, CheckCircle2, TrendingUp, FileText, MessageCircle } from 'lucide-react'
import { useGuests } from '../hooks/useGuests'
import { balanceDue, daysUntilCheckout, isUrgent, formatDate, formatRupees } from '../utils/business'
import { generateSlip } from '../utils/pdf'
import { sendWhatsAppReminder } from '../utils/whatsapp'
import { useToast } from './ui/Toast'
import { SkeletonCard, SkeletonRow } from './ui/Skeleton'
import { Badge } from './ui/Badge'

const TOTAL_ROOMS = 6

export function Dashboard({ onCheckIn, onEdit }) {
  const { guests, loading, settleBalance } = useGuests()
  const { addToast } = useToast()

  const active = guests.filter(g => g.status === 'checked-in')
  const occupied = active.length
  const available = TOTAL_ROOMS - occupied
  const pendingCount = active.filter(g => balanceDue(g) > 0).length
  const totalRevenue = guests.reduce((sum, g) => sum + (g.advance_paid ?? 0), 0)
  const urgentGuests = active.filter(isUrgent)

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

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Occupied Rooms"
              value={`${occupied} / ${TOTAL_ROOMS}`}
              icon={Home}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <StatCard
              label="Available Rooms"
              value={available}
              icon={CheckCircle2}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <StatCard
              label="Pending Payments"
              value={pendingCount}
              icon={AlertCircle}
              color={pendingCount > 0 ? 'text-red-600' : 'text-gray-400'}
              bg={pendingCount > 0 ? 'bg-red-50' : 'bg-gray-50'}
            />
            <StatCard
              label="Total Revenue"
              value={formatRupees(totalRevenue)}
              icon={TrendingUp}
              color="text-[#065F46]"
              bg="bg-emerald-50"
              small
            />
          </>
        )}
      </div>

      {/* Urgent Alerts */}
      {!loading && urgentGuests.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border-b border-red-200">
            <AlertCircle size={16} className="text-red-600" />
            <h2 className="text-sm font-semibold text-red-800">
              Urgent — {urgentGuests.length} guest{urgentGuests.length > 1 ? 's' : ''} need attention
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {urgentGuests.map(guest => {
              const days = daysUntilCheckout(guest)
              return (
                <div key={guest.id} className="flex items-center justify-between px-5 py-3 flex-wrap gap-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{guest.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{guest.room}</span>
                    <div className="text-xs text-red-600 mt-0.5">
                      {days < 0 ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}` : `Checks out in ${days} day${days !== 1 ? 's' : ''}`}
                      {' · '} Balance: {formatRupees(balanceDue(guest))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWhatsApp(guest)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#065F46] bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                    >
                      <MessageCircle size={13} /> Send WA
                    </button>
                    <button
                      onClick={() => handleSettle(guest)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#065F46] hover:bg-[#047857] rounded-md transition-colors"
                    >
                      <CheckCircle2 size={13} /> Settle
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Current Guests table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Current Guests</h2>
          <button
            onClick={onCheckIn}
            className="px-4 py-2 text-sm font-medium text-white bg-[#065F46] hover:bg-[#047857] rounded-md transition-colors"
          >
            + Check In
          </button>
        </div>

        {loading ? (
          <table className="w-full">
            <tbody>{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        ) : active.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">No guests currently checked in.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <Th>Name</Th>
                    <Th>Room</Th>
                    <Th>Check-Out</Th>
                    <Th>Monthly Rent</Th>
                    <Th right>Balance Due</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {active.map(guest => {
                    const balance = balanceDue(guest)
                    return (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{guest.name}</td>
                        <td className="px-4 py-3 text-gray-600">{guest.room}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(guest.check_out)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatRupees(guest.monthly_rent)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={balance > 0 ? 'text-red-600 font-medium' : 'text-emerald-600'}>
                            {balance > 0 ? formatRupees(balance) : 'Settled'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <ActionBtn icon={FileText} onClick={() => generateSlip(guest)} title="Download Slip" />
                            <ActionBtn icon={MessageCircle} onClick={() => handleWhatsApp(guest)} title="Send WA" green />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {active.map(guest => {
                const balance = balanceDue(guest)
                return (
                  <div key={guest.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{guest.name}</div>
                        <div className="text-xs text-gray-500">{guest.room} · Out: {formatDate(guest.check_out)}</div>
                      </div>
                      <span className={`text-sm font-semibold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {balance > 0 ? formatRupees(balance) : 'Settled'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => generateSlip(guest)} className="flex-1 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50">PDF Slip</button>
                      <button onClick={() => handleWhatsApp(guest)} className="flex-1 py-1.5 text-xs border border-emerald-300 rounded text-emerald-700 hover:bg-emerald-50">Send WA</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, bg, small }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <div className={`font-bold text-gray-900 ${small ? 'text-lg' : 'text-2xl'}`}>{value}</div>
    </div>
  )
}

function Th({ children, right }) {
  return (
    <th className={`px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function ActionBtn({ icon: Icon, onClick, title, green }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${green ? 'text-[#10B981] hover:bg-emerald-50' : 'text-gray-500'}`}
    >
      <Icon size={15} />
    </button>
  )
}
