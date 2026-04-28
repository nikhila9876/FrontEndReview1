import { createContext, useContext, useMemo, useState } from 'react'
import { clearSession, getToken, getUser, saveSession } from '../utils/authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken())
  const [user, setUser] = useState(getUser())

  const login = (authPayload) => {
    // Persist session so protected routes survive page refresh.
    saveSession(authPayload)
    setToken(authPayload.token)
    setUser(authPayload.user)
  }

  const logout = () => {
    clearSession()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
