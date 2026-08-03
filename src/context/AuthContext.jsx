import { createContext, useContext, useEffect, useState } from 'react'
import { useStore } from '../store/StoreProvider'

const AuthContext = createContext(null)

const GOOGLE_USER = {
  id: 'u-google',
  name: 'Google User',
  email: 'google.user@gmail.com',
  phone: '',
  password: '',
  provider: 'google',
  addresses: [],
  defaultAddressId: null,
}

export function AuthProvider({ children }) {
  const { users, addUser } = useStore()

  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('dmb:auth') || null)

  useEffect(() => {
    if (currentUserId) localStorage.setItem('dmb:auth', currentUserId)
    else localStorage.removeItem('dmb:auth')
  }, [currentUserId])

  const currentUser = users.find((u) => u.id === currentUserId) || null

  const login = (email, password) => {
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (!user) return { ok: false, error: 'Email tidak ditemukan.' }
    // POC: any password is accepted.
    setCurrentUserId(user.id)
    return { ok: true }
  }

  const loginWithGoogle = () => {
    const existing = users.find((u) => u.id === GOOGLE_USER.id)
    if (!existing) addUser(GOOGLE_USER)
    setCurrentUserId(GOOGLE_USER.id)
    return { ok: true }
  }

  const register = ({ name, email, phone, password }) => {
    if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      return { ok: false, error: 'Email sudah terdaftar.' }
    }
    const user = {
      id: 'u' + (users.length + 1) + '-' + email.split('@')[0],
      name,
      email,
      phone: phone || '',
      password: password || '',
      provider: 'password',
      addresses: [],
      defaultAddressId: null,
    }
    addUser(user)
    setCurrentUserId(user.id)
    return { ok: true }
  }

  const logout = () => setCurrentUserId(null)

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoggedIn: !!currentUser, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
