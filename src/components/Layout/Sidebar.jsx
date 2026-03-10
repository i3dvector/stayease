import { LayoutDashboard, Users, DoorOpen, Bell, Settings, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Guest Registry', icon: Users, page: 'registry' },
  { label: 'Room Status', icon: DoorOpen, page: 'rooms' },
  { label: 'Reminders', icon: Bell, page: 'reminders' },
]

export function Sidebar({ currentPage, onNavigate, mobileOpen, onClose }) {
  const { role } = useAuth()

  const items = role === 'admin'
    ? [...navItems, { label: 'Settings', icon: Settings, page: 'settings' }]
    : navItems

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#065F46] flex items-center justify-center">
            <DoorOpen size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 leading-tight">StayEase</div>
            <div className="text-xs text-gray-400">Guesthouse CRM</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map(({ label, icon: Icon, page }) => {
          const active = currentPage === page
          return (
            <button
              key={page}
              onClick={() => { onNavigate(page); onClose?.() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#065F46] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 h-screen sticky top-0 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-white shadow-xl z-50">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
