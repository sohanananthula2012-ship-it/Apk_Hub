import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api, User } from '../lib/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const restore = useCallback(async () => {
    const t = localStorage.getItem('apkhub_token')
    if (!t) { setLoading(false); return }
    try {
      const { user } = await api.me()
      setUser(user)
    } catch {
      localStorage.removeItem('apkhub_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { restore() }, [restore])

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password)
    localStorage.setItem('apkhub_token', token)
    setUser(user)
  }

  const signup = async (name: string, email: string, password: string) => {
    const { token, user } = await api.signup(name, email, password)
    localStorage.setItem('apkhub_token', token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('apkhub_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
