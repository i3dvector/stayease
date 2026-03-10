import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout({ currentPage, onNavigate, onQuickCheckIn, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Header currentPage={currentPage} onMenuOpen={() => setMobileOpen(true)} onQuickCheckIn={onQuickCheckIn} />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={onQuickCheckIn}
        className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-[#065F46] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#047857] active:scale-95 transition-all"
        aria-label="New Arrival"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
