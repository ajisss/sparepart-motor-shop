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

// The admin/owner account is provisioned from env vars set ONLY on the
// protected admin deployment — its credentials never ship in the public
// storefront bundle. The dev-only fallback keeps `npm run dev:admin` working
// locally and is compiled out of production builds (import.meta.env.DEV is
// false there, so the string literals are dead-code eliminated).
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || (import.meta.env.DEV ? 'admin@dmb.com' : '')
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || (import.meta.env.DEV ? 'admin123' : '')
const ADMIN_USER =
  ADMIN_EMAIL && ADMIN_PASSWORD
    ? {
        id: 'u-admin',
        name: 'Admin DMB',
        email: ADMIN_EMAIL,
        phone: '',
        password: ADMIN_PASSWORD,
        provider: 'password',
        role: 'admin',
        addresses: [],
        defaultAddressId: null,
      }
    : null

export function AuthProvider({ children }) {
  const { users: storeUsers, addUser } = useStore()
  // Admin lives only in the auth layer (never persisted to the store), and
  // only when provisioned — so the public build's user list has no admin.
  const users =
    ADMIN_USER && !storeUsers.some((u) => u.id === ADMIN_USER.id)
      ? [...storeUsers, ADMIN_USER]
      : storeUsers

  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('dmb:auth') || null)

  useEffect(() => {
    if (currentUserId) localStorage.setItem('dmb:auth', currentUserId)
    else localStorage.removeItem('dmb:auth')
  }, [currentUserId])

  const currentUser = users.find((u) => u.id === currentUserId) || null

  const login = (email, password) => {
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (!user) return { ok: false, error: 'Email tidak ditemukan.' }
    if (!user.password || String(password) !== String(user.password)) {
      return { ok: false, error: 'Password salah.' }
    }
    setCurrentUserId(user.id)
    return { ok: true, user }
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

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner'

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoggedIn: !!currentUser, isAdmin, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
