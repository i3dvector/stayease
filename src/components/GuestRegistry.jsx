import { useState } from 'react'
import { Search, FileText, MessageCircle, CheckCircle2, LogOut, Pencil } from 'lucide-react'
import { useGuests } from '../hooks/useGuests'
import { balanceDue, formatDate, formatRupees } from '../utils/business'
import { generateSlip } from '../utils/pdf'
import { sendWhatsAppReminder } from '../utils/whatsapp'
import { useToast } from './ui/Toast'
import { Badge } from './ui/Badge'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { SkeletonRow } from './ui/Skeleton'

export function GuestRegistry({ onEdit }) {
  const { guests, loading, settleBalance, checkOutGuest } = useGuests()
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [confirmCheckOut, setConfirmCheckOut] = useState(null)

  const filtered = guests.filter(g => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && g.status === 'checked-in') ||
      (filter === 'out' && g.status === 'checked-out')

    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.room.toLowerCase().includes(q)

    return matchesFilter && matchesSearch
  })

  async function handleSettle(guest) {
    try {
      await settleBalance(guest)
      addToast(`Balance settled for ${guest.name}`)
    } catch {
      addToast('Failed to settle balance', 'error')
    }
  }

  async function handleCheckOut(guest) {
    try {
      await checkOutGuest(guest.id)
      addToast(`${guest.name} checked out`)
    } catch {
      addToast('Failed to check out guest', 'error')
    }
    setConfirmCheckOut(null)
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
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or room…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
          {[['all', 'All'], ['active', 'Active'], ['out', 'Checked Out']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${filter === val ? 'bg-[#065F46] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <table className="w-full"><tbody>{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No guests found.</div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <Th>Name</Th>
                    <Th>Phone</Th>
                    <Th>Room</Th>
                    <Th>Check-Out</Th>
                    <Th right>Monthly Rent</Th>
                    <Th right>Balance Due</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(guest => {
                    const balance = balanceDue(guest)
                    const isActive = guest.status === 'checked-in'
                    return (
                      <tr key={guest.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{guest.name}</td>
                        <td className="px-4 py-3 text-slate-500">{guest.phone}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">{guest.room}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(guest.check_out)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{formatRupees(guest.monthly_rent)}</td>
                        <td className="px-4 py-3 text-right">
                          {balance > 0
                            ? <span className="text-red-600 font-semibold">{formatRupees(balance)}</span>
                            : <span className="text-emerald-600 font-medium">Settled</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={isActive ? 'success' : 'neutral'}>
                            {isActive ? 'Checked In' : 'Checked Out'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-0.5">
                            <IconBtn icon={Pencil} onClick={() => onEdit(guest)} title="Edit" />
                            <IconBtn icon={FileText} onClick={() => generateSlip(guest)} title="Download Slip" />
                            {isActive && balance > 0 && (
                              <IconBtn icon={MessageCircle} onClick={() => handleWhatsApp(guest)} title="Send WA" green />
                            )}
                            {isActive && balance > 0 && (
                              <IconBtn icon={CheckCircle2} onClick={() => handleSettle(guest)} title="Settle Balance" brand />
                            )}
                            {isActive && (
                              <IconBtn icon={LogOut} onClick={() => setConfirmCheckOut(guest)} title="Check Out" danger />
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map(guest => {
                const balance = balanceDue(guest)
                const isActive = guest.status === 'checked-in'
                return (
                  <div key={guest.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{guest.name}</div>
                        <div className="text-xs text-slate-500">{guest.room} · {guest.phone}</div>
                      </div>
                      <Badge variant={isActive ? 'success' : 'neutral'}>
                        {isActive ? 'Active' : 'Out'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Out: {formatDate(guest.check_out)}</span>
                      <span className={balance > 0 ? 'text-red-600 font-semibold' : 'text-emerald-600 font-medium'}>
                        {balance > 0 ? formatRupees(balance) : 'Settled'}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <MobileBtn label="Edit" onClick={() => onEdit(guest)} />
                      <MobileBtn label="PDF" onClick={() => generateSlip(guest)} />
                      {isActive && balance > 0 && <MobileBtn label="Send WA" onClick={() => handleWhatsApp(guest)} green />}
                      {isActive && balance > 0 && <MobileBtn label="Settle" onClick={() => handleSettle(guest)} brand />}
                      {isActive && <MobileBtn label="Check Out" onClick={() => setConfirmCheckOut(guest)} danger />}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmCheckOut}
        title="Check Out Guest"
        message={`Mark ${confirmCheckOut?.name} as checked out? This cannot be undone.`}
        confirmLabel="Check Out"
        danger
        onConfirm={() => handleCheckOut(confirmCheckOut)}
        onCancel={() => setConfirmCheckOut(null)}
      />
    </div>
  )
}

function Th({ children, right }) {
  return (
    <th className={`px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function IconBtn({ icon: Icon, onClick, title, green, brand, danger }) {
  const color = danger ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
    : brand ? 'text-[#065F46] hover:bg-emerald-50'
    : green ? 'text-emerald-500 hover:bg-emerald-50'
    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
  return (
    <button onClick={onClick} title={title} className={`p-1.5 rounded-lg transition-colors ${color}`}>
      <Icon size={14} />
    </button>
  )
}

function MobileBtn({ label, onClick, green, brand, danger }) {
  const cls = danger ? 'border-red-200 text-red-600 hover:bg-red-50'
    : brand ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
    : green ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
  return (
    <button onClick={onClick} className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${cls}`}>
      {label}
    </button>
  )
}
