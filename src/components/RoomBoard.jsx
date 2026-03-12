import { CheckCircle2, FileText } from 'lucide-react'
import { useGuests } from '../hooks/useGuests'
import { useRoomHousekeeping } from '../hooks/useRoomHousekeeping'
import { balanceDue, formatDate, formatRupees } from '../utils/business'
import { generateSlip } from '../utils/pdf'
import { useToast } from './ui/Toast'
import { Badge } from './ui/Badge'
import { Skeleton } from './ui/Skeleton'

const ROOMS = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6']

const HK_OPTIONS = [
  { value: 'clean',        label: 'Clean',        dot: 'bg-emerald-500' },
  { value: 'dirty',        label: 'Dirty',        dot: 'bg-red-500' },
  { value: 'inspecting',   label: 'Inspecting',   dot: 'bg-yellow-400' },
  { value: 'out_of_order', label: 'Out of Order', dot: 'bg-gray-400' },
]

function HKBadge({ status, room, onChange }) {
  const opt = HK_OPTIONS.find(o => o.value === status) ?? HK_OPTIONS[0]
  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        onChange={e => onChange(room, e.target.value)}
        title="Housekeeping status"
        className="appearance-none text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-pointer hover:border-slate-300 focus:outline-none focus:border-[#065F46] focus:ring-1 focus:ring-emerald-500/20 transition-colors"
        style={{ paddingLeft: '22px', paddingRight: '8px', paddingTop: '4px', paddingBottom: '4px' }}
      >
        {HK_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className={`absolute left-2.5 w-2 h-2 rounded-full ${opt.dot} pointer-events-none flex-shrink-0`} />
    </div>
  )
}

export function RoomBoard({ onCheckIn }) {
  const { guests, loading: guestsLoading, settleBalance } = useGuests()
  const { statuses, loading: hkLoading, updateStatus } = useRoomHousekeeping()
  const { addToast } = useToast()

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

  if (guestsLoading || hkLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROOMS.map(r => (
          <div key={r} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
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
        const hkStatus = statuses[room] ?? 'clean'

        if (guest) {
          const balance = balanceDue(guest)
          return (
            <div key={room} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{room}</span>
                <Badge variant={balance > 0 ? 'danger' : 'success'}>
                  {balance > 0 ? 'Balance Due' : 'Settled'}
                </Badge>
              </div>
              <div className="p-4">
                <div className="font-bold text-slate-900 mb-0.5">{guest.name}</div>
                <div className="text-sm text-slate-500 mb-2">
                  Check-out: <span className="font-medium text-slate-700">{formatDate(guest.check_out)}</span>
                </div>
                {balance > 0 && (
                  <div className="text-sm text-red-600 font-bold mb-2">{formatRupees(balance)} due</div>
                )}
                <div className="mb-4">
                  <HKBadge status={hkStatus} room={room} onChange={updateStatus} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateSlip(guest)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <FileText size={13} /> Slip
                  </button>
                  {balance > 0 && (
                    <button
                      onClick={() => handleSettle(guest)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#047857] rounded-lg transition-colors"
                    >
                      <CheckCircle2 size={13} /> Settle
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        }

        // Available room
        return (
          <div key={room} className="bg-white rounded-xl border-2 border-dashed border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{room}</span>
              <Badge variant="success">Available</Badge>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <HKBadge status={hkStatus} room={room} onChange={updateStatus} />
              </div>
              <div className="text-sm text-slate-400 mb-4">No guest currently assigned</div>
              <button
                onClick={() => onCheckIn(room)}
                className="w-full py-2 text-sm font-semibold text-[#065F46] border border-[#065F46] rounded-lg hover:bg-emerald-50 transition-colors"
              >
                + Check In
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
