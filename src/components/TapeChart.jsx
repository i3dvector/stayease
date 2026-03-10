import { useGuests } from '../hooks/useGuests'
import { formatDate } from '../utils/business'

const ROOMS = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6']
const DAYS = 14
const CELL_W = 54   // px per day column
const ROOM_COL = 96  // px for room label column
const ROW_H = 44     // px per room row

// Guest block colours by balance
const BLOCK_COLORS = ['bg-[#065F46]', 'bg-[#0369a1]', 'bg-[#7c3aed]', 'bg-[#b45309]', 'bg-[#be185d]', 'bg-[#0f766e]']

export function TapeChart({ onCheckIn, onEdit }) {
  const { guests, loading } = useGuests()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return d
  })

  // Assign a stable colour index per guest id
  const colorMap = {}
  guests.forEach((g, i) => { colorMap[g.id] = BLOCK_COLORS[i % BLOCK_COLORS.length] })

  function guestForRoomDay(room, day) {
    const dayStr = day.toISOString().slice(0, 10)
    return guests.find(g =>
      g.room === room &&
      g.status === 'checked-in' &&
      g.check_in <= dayStr &&
      dayStr < g.check_out
    ) ?? null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-sm text-gray-400">
        Loading timeline…
      </div>
    )
  }

  const totalW = ROOM_COL + CELL_W * DAYS

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Room Timeline — Next 14 Days</h2>
        <p className="text-xs text-gray-400 mt-0.5">Click an empty cell to check in · click a block to view guest</p>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: totalW + 'px' }}>

          {/* Date header row */}
          <div className="flex border-b border-gray-200 bg-gray-50" style={{ minWidth: totalW + 'px' }}>
            <div style={{ width: ROOM_COL, flexShrink: 0 }} className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide flex items-end">
              Room
            </div>
            {days.map((d, i) => {
              const isToday = i === 0
              const dayOfWeek = d.toLocaleDateString('en-IN', { weekday: 'short' })
              const isWeekend = d.getDay() === 0 || d.getDay() === 6
              return (
                <div
                  key={i}
                  style={{ width: CELL_W, flexShrink: 0 }}
                  className={`text-center py-2 border-l border-gray-200 ${isToday ? 'bg-emerald-50' : ''}`}
                >
                  <div className={`text-xs font-bold ${isToday ? 'text-[#065F46]' : isWeekend ? 'text-gray-500' : 'text-gray-700'}`}>
                    {d.getDate()}
                  </div>
                  <div className={`text-xs leading-none ${isToday ? 'text-[#065F46]' : 'text-gray-400'}`}>
                    {dayOfWeek}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Room rows */}
          {ROOMS.map(room => (
            <div
              key={room}
              className="flex border-b border-gray-100 last:border-0"
              style={{ minWidth: totalW + 'px', height: ROW_H + 'px' }}
            >
              {/* Room label */}
              <div
                style={{ width: ROOM_COL, flexShrink: 0 }}
                className="px-4 flex items-center text-xs font-medium text-gray-600 bg-gray-50 border-r border-gray-200"
              >
                {room}
              </div>

              {/* Day cells */}
              {days.map((day, di) => {
                const dayStr = day.toISOString().slice(0, 10)
                const guest = guestForRoomDay(room, day)
                const prevGuest = di > 0 ? guestForRoomDay(room, days[di - 1]) : null
                const nextGuest = di < DAYS - 1 ? guestForRoomDay(room, days[di + 1]) : null
                const isToday = di === 0

                if (guest) {
                  const isStart = !prevGuest || prevGuest.id !== guest.id
                  const isEnd = !nextGuest || nextGuest.id !== guest.id
                  const color = colorMap[guest.id]
                  return (
                    <button
                      key={dayStr}
                      onClick={() => onEdit(guest)}
                      title={`${guest.name} · ${formatDate(guest.check_in)} → ${formatDate(guest.check_out)}`}
                      style={{ width: CELL_W, flexShrink: 0, height: ROW_H + 'px' }}
                      className={`relative border-l border-white/20 ${color} hover:brightness-110 active:brightness-90 transition-all overflow-hidden
                        ${isStart ? 'rounded-l ml-0.5' : ''}
                        ${isEnd ? 'rounded-r mr-0.5' : ''}
                      `}
                    >
                      {isStart && (
                        <span className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium truncate pointer-events-none">
                          {guest.name.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  )
                }

                return (
                  <button
                    key={dayStr}
                    onClick={() => onCheckIn(room, dayStr)}
                    title={`Check in to ${room} on ${dayStr}`}
                    style={{ width: CELL_W, flexShrink: 0, height: ROW_H + 'px' }}
                    className={`border-l border-gray-200 transition-colors hover:bg-emerald-50 ${isToday ? 'bg-emerald-50/40' : ''}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#065F46]" />
          <span>Occupied — click to view guest details</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border border-dashed border-gray-300" />
          <span>Available — click to open check-in form</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200" />
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}
