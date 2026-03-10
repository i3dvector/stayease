import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import { Layout } from './components/Layout/Layout'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { GuestRegistry } from './components/GuestRegistry'
import { RoomBoard } from './components/RoomBoard'
import { Reminders } from './components/Reminders'
import { Settings } from './components/Settings'
import { CheckInForm } from './components/CheckInForm'

function AppInner() {
  const { user, role, loading } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [formOpen, setFormOpen] = useState(false)
  const [editGuest, setEditGuest] = useState(null)
  const [prefilledRoom, setPrefilledRoom] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    )
  }

  if (!user) return <Login />

  function openCheckIn(room = null) {
    setEditGuest(null)
    setPrefilledRoom(room)
    setFormOpen(true)
  }

  function openEdit(guest) {
    setEditGuest(guest)
    setPrefilledRoom(null)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditGuest(null)
    setPrefilledRoom(null)
  }

  const safePage = page === 'settings' && role !== 'admin' ? 'dashboard' : page

  return (
    <Layout currentPage={safePage} onNavigate={setPage}>
      {safePage === 'dashboard' && (
        <Dashboard onCheckIn={() => openCheckIn()} onEdit={openEdit} />
      )}
      {safePage === 'registry' && (
        <GuestRegistry onEdit={openEdit} />
      )}
      {safePage === 'rooms' && (
        <RoomBoard onCheckIn={openCheckIn} />
      )}
      {safePage === 'reminders' && (
        <Reminders />
      )}
      {safePage === 'settings' && role === 'admin' && (
        <Settings />
      )}

      <CheckInForm
        open={formOpen}
        onClose={closeForm}
        editGuest={editGuest}
        prefilledRoom={prefilledRoom}
      />
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  )
}
