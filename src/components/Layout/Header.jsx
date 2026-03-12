import { Menu, LogOut, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../ui/Badge'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  registry: 'Guest Registry',
  rooms: 'Room Status',
  timeline: 'Room Timeline',
  reminders: 'Reminders',
  settings: 'Settings',
}

export function Header({ currentPage, onMenuOpen, onQuickCheckIn }) {
  const { user, role, signOut } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
          {PAGE_TITLES[currentPage] ?? 'HK Flats'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onQuickCheckIn}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#065F46] hover:bg-[#047857] rounded-lg transition-colors shadow-sm"
        >
          <Plus size={15} />
          New Arrival
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 ml-1">
          <span className="text-xs text-slate-500 truncate max-w-[160px]">{user?.email}</span>
          <Badge variant={role === 'admin' ? 'success' : 'neutral'}>
            {role === 'admin' ? 'Admin' : 'Staff'}
          </Badge>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
