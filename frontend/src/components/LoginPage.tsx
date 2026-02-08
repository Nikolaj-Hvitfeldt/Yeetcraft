import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { signIn, signUp } = useAuth() ?? {}
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !signUp) {
      setError('Auth not configured')
      return
    }
    setError(null)
    setLoading(true)
    const { error: err } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-warcraft-bg">
      <div className="wc-panel-gold w-full max-w-md p-8">
        <h1 className="text-2xl font-warcraft font-bold text-warcraft-gold text-center mb-6">
          {isSignUp ? 'Create account' : 'Log in'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-warcraft-text mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded border border-warcraft-border bg-warcraft-bg text-warcraft-text"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-warcraft-text mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded border border-warcraft-border bg-warcraft-bg text-warcraft-text"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded font-medium bg-warcraft-gold text-warcraft-bg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '…' : isSignUp ? 'Sign up' : 'Log in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-warcraft-text-muted">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
            className="text-warcraft-gold hover:underline"
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
