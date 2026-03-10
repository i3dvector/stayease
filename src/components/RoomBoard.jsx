import { CheckCircle2, FileText } from 'lucide-react'
import { useGuests } from '../hooks/useGuests'
import { balanceDue, formatDate, formatRupees } from '../utils/business'
import { generateSlip } from '../utils/pdf'
import { useToast } from './ui/Toast'
import { Badge } from './ui/Badge'
import { Skeleton } from './ui/Skeleton'

const ROOMS = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6']

export function RoomBoard({ onCheckIn }) {
  const { guests, loading, settleBalance } = useGuests()
  const { addToast } = useToast()

  // Map room name → current active guest
  const occupiedMap = {}
  guests.forEach(g => {
    if (g.status === 'checked-in') occupiedMap[g.room] = g
  })

  async function handleSettle(guest) {
    try {
      await settleBalance(guest)
      addToast(`Balance settled for ${guest.name}`)
    } catch {
      addToast('Failed to settle balance', 'error')
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROOMS.map(r => (
          <div key={r} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ROOMS.map(room => {
        const guest = occupiedMap[room]
        if (guest) {
          const balance = balanceDue(guest)
          return (
            <div key={room} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{room}</span>
                <Badge variant={balance > 0 ? 'danger' : 'success'}>
                  {balance > 0 ? 'Balance Due' : 'Settled'}
                </Badge>
              </div>
              <div className="font-semibold text-gray-900 mb-0.5">{guest.name}</div>
              <div className="text-sm text-gray-500 mb-1">
                Check-out: {formatDate(guest.check_out)}
              </div>
              {balance > 0 && (
                <div className="text-sm text-red-600 font-medium mb-3">
                  Balance: {formatRupees(balance)}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => generateSlip(guest)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <FileText size={13} /> Download Slip
                </button>
                {balance > 0 && (
                  <button
                    onClick={() => handleSettle(guest)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-white bg-[#065F46] hover:bg-[#047857] rounded transition-colors"
                  >
                    <CheckCircle2 size={13} /> Settle
                  </button>
                )}
              </div>
            </div>
          )
        }

        // Available room
        return (
          <div key={room} className="bg-white rounded-lg border border-dashed border-gray-300 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{room}</span>
              <Badge variant="success">Available</Badge>
            </div>
            <div className="text-sm text-gray-400 mb-4">No guest currently assigned</div>
            <button
              onClick={() => onCheckIn(room)}
              className="w-full py-2 text-sm font-medium text-[#065F46] border border-[#065F46] rounded hover:bg-emerald-50 transition-colors"
            >
              + Check In
            </button>
          </div>
        )
      })}
    </div>
  )
}
