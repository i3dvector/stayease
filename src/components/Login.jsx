import { useState } from 'react'
import { DoorOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#065F46] flex items-center justify-center">
            <DoorOpen size={20} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">StayEase</div>
            <div className="text-xs text-gray-400">Guesthouse CRM</div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign in</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-emerald-500/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-emerald-500/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#065F46] hover:bg-[#047857] text-white text-sm font-medium rounded transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
