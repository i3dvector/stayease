import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../ui/Badge'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  registry: 'Guest Registry',
  rooms: 'Room Status',
  reminders: 'Reminders',
  settings: 'Settings',
}

export function Header({ currentPage, onMenuOpen }) {
  const { user, role, signOut } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-gray-900">
          {PAGE_TITLES[currentPage] ?? 'StayEase'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <Badge variant={role === 'admin' ? 'success' : 'neutral'}>
            {role === 'admin' ? 'Admin' : 'Staff'}
          </Badge>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  )
}
