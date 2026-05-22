"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getMe, AuthUser } from "@/lib/api"

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  setToken: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null, token: null, loading: true,
  setToken: () => {}, logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("dclaw_token")
    if (stored) {
      getMe(stored)
        .then(u => { setUser(u); setTokenState(stored) })
        .catch(() => localStorage.removeItem("dclaw_token"))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function setToken(t: string) {
    localStorage.setItem("dclaw_token", t)
    setTokenState(t)
    getMe(t).then(setUser).catch(() => {})
  }

  function logout() {
    localStorage.removeItem("dclaw_token")
    setTokenState(null)
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
