import { LayoutDashboard, Users, DoorOpen, Bell, Settings, X, CalendarRange } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { GUESTHOUSE } from '../../config'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Guest Registry', icon: Users, page: 'registry' },
  { label: 'Room Status', icon: DoorOpen, page: 'rooms' },
  { label: 'Timeline', icon: CalendarRange, page: 'timeline' },
  { label: 'Reminders', icon: Bell, page: 'reminders' },
]

export function Sidebar({ currentPage, onNavigate, mobileOpen, onClose }) {
  const { role } = useAuth()

  const items = role === 'admin'
    ? [...navItems, { label: 'Settings', icon: Settings, page: 'settings' }]
    : navItems

  const content = (
    <div className="flex flex-col h-full bg-[#0F172A]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#065F46] flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <DoorOpen size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight tracking-tight">{GUESTHOUSE.name}</div>
            <div className="text-xs text-slate-500">{GUESTHOUSE.tagline}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map(({ label, icon: Icon, page }) => {
          const active = currentPage === page
          return (
            <button
              key={page}
              onClick={() => { onNavigate(page); onClose?.() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#065F46] text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/5">
        <div className="text-xs text-slate-700">HK Flats CRM v2</div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-60 shadow-2xl z-50">
            <button onClick={onClose} className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
