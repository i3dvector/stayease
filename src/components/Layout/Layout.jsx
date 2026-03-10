import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout({ currentPage, onNavigate, children }) {
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
        <Header currentPage={currentPage} onMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
