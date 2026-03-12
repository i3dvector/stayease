import { useState } from 'react'
import { DoorOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { GUESTHOUSE } from '../config'

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message ?? 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#065F46] via-[#059669] to-[#10B981]" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-[#065F46] flex items-center justify-center shadow-md shadow-emerald-900/30">
                <DoorOpen size={20} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">{GUESTHOUSE.name}</div>
                <div className="text-xs font-medium text-slate-400">{GUESTHOUSE.tagline}</div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500 mb-6">Sign in to manage your property</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 bg-[#065F46] hover:bg-[#047857] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm shadow-emerald-900/20"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">HK Flats Guesthouse · Chennai, Tamil Nadu</p>
      </div>
    </div>
  )
}
