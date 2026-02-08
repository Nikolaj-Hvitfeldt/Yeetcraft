import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setBearerTokenGetter } from '../api/api'
import { getSupabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Me {
  sub: string
  email: string | null
  playerId: number | null
  isAdmin: boolean
}

interface AuthState {
  user: User | null
  session: { access_token: string } | null
  me: Me | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<{ access_token: string } | null>(null)
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async (accessToken: string) => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    try {
      const res = await fetch(`${base}/api/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMe(data)
      } else {
        setMe(null)
      }
    } catch {
      setMe(null)
    }
  }, [])

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s ? { access_token: s.access_token } : null)
      setUser(s?.user ?? null)
      if (s?.access_token) fetchMe(s.access_token)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? { access_token: s.access_token } : null)
      setUser(s?.user ?? null)
      if (s?.access_token) fetchMe(s.access_token)
      else setMe(null)
    })
    return () => subscription.unsubscribe()
  }, [fetchMe])

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase()
    if (!supabase) return { error: new Error('Supabase not configured') }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ?? null }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase()
    if (!supabase) return { error: new Error('Supabase not configured') }
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ?? null }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    if (supabase) await supabase.auth.signOut()
    setMe(null)
  }, [])

  const getAccessToken = useCallback(() => session?.access_token ?? null, [session])

  useEffect(() => {
    setBearerTokenGetter(getAccessToken)
    return () => setBearerTokenGetter(null)
  }, [getAccessToken])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      me,
      loading,
      signIn,
      signUp,
      signOut,
      getAccessToken,
    }),
    [user, session, me, loading, signIn, signUp, signOut, getAccessToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue | null {
  return useContext(AuthContext)
}
