import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useGuests } from '../hooks/useGuests'
import { useToast } from './ui/Toast'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { Badge } from './ui/Badge'
import { UserPlus, Trash2, RefreshCw, Download } from 'lucide-react'

export function Settings() {
  const { guests } = useGuests()
  const { addToast } = useToast()

  const [staffList, setStaffList] = useState([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')

  const [confirmReset, setConfirmReset] = useState(false)

  // Supabase config (display only — actual values come from .env)
  const [supabaseUrl, setSupabaseUrl] = useState(
    () => localStorage.getItem('se_supabase_url') || import.meta.env.VITE_SUPABASE_URL || ''
  )
  const [supabaseKey, setSupabaseKey] = useState(
    () => localStorage.getItem('se_supabase_key') || ''
  )

  useEffect(() => {
    loadStaff()
  }, [])

  async function loadStaff() {
    setStaffLoading(true)
    const { data } = await supabase.from('user_roles').select('*').order('email')
    setStaffList(data ?? [])
    setStaffLoading(false)
  }

  async function handleInvite(e) {
    e.preventDefault()
    // Adding staff requires the Supabase service-role key which must not be in the browser.
    // Workflow: Supabase Dashboard → Authentication → Users → Invite user,
    // then run: INSERT INTO user_roles (id, email, role) VALUES ('<uuid>', '<email>', 'staff');
    addToast("To add staff: invite them in Supabase Dashboard, then insert their UUID into user_roles with role='staff'", 'warning')
    setInviteEmail('')
  }

  async function handleRevoke(member) {
    if (!window.confirm(`Revoke access for ${member.email}?`)) return
    try {
      await supabase.from('user_roles').delete().eq('id', member.id)
      addToast(`Access revoked for ${member.email}`)
      loadStaff()
    } catch {
      addToast('Failed to revoke access', 'error')
    }
  }

  function handleExportBackup() {
    const json = JSON.stringify(guests, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stayease-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Backup downloaded')
  }

  function saveSupabaseConfig() {
    localStorage.setItem('se_supabase_url', supabaseUrl)
    localStorage.setItem('se_supabase_key', supabaseKey)
    addToast('Config saved (reload to apply)')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Staff Management */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Staff Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Invite employees. Staff can manage guests but cannot access settings or delete records.</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Invite form */}
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="employee@email.com"
              className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#065F46] hover:bg-[#047857] rounded-lg transition-colors"
            >
              <UserPlus size={15} />
              Show Instructions
            </button>
          </form>
          <p className="text-xs text-gray-400">
            Note: inviting staff requires Supabase service-role access. For now, create users in the Supabase dashboard and add their UUID to the user_roles table with role = 'staff'.
          </p>

          {/* Staff list */}
          {staffLoading ? (
            <div className="text-sm text-gray-400">Loading staff…</div>
          ) : staffList.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">No staff members yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {staffList.map(member => (
                <div key={member.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{member.email}</div>
                    <Badge variant={member.role === 'admin' ? 'success' : 'neutral'}>{member.role}</Badge>
                  </div>
                  {member.role !== 'admin' && (
                    <button
                      onClick={() => handleRevoke(member)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Revoke access"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Supabase Configuration */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Supabase Configuration</h2>
          <p className="text-sm text-slate-500 mt-0.5">These values are saved locally for reference. Set them as Vercel environment variables for production.</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Project URL</label>
            <input
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#065F46]"
              placeholder="https://xyz.supabase.co"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Anon Public Key</label>
            <input
              value={supabaseKey}
              onChange={e => setSupabaseKey(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#065F46]"
              placeholder="eyJ…"
              type="password"
            />
          </div>
          <button
            onClick={saveSupabaseConfig}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#065F46] hover:bg-[#047857] rounded-lg transition-colors"
          >
            Save Config
          </button>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Data Management</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Total Guest Records</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{guests.length}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download size={15} /> Export Backup (JSON)
            </button>
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <RefreshCw size={15} /> Reset All Data
            </button>
          </div>
          <p className="text-xs text-gray-400">Export creates a date-stamped JSON file of all guest records. Reset deletes ALL guest data permanently — use only when starting fresh.</p>
        </div>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Reset All Data"
        message="This will permanently delete ALL guest records from the database. This cannot be undone. Export a backup first."
        confirmLabel="Delete Everything"
        danger
        onConfirm={async () => {
          try {
            await supabase.from('guests').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            addToast('All guest data deleted', 'warning')
          } catch {
            addToast('Failed to reset data', 'error')
          }
          setConfirmReset(false)
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
