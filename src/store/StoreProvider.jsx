import { createContext, useContext, useEffect, useState } from 'react'
import { loadData, saveData, clearData } from './seed'
import { generateOrderNumber } from '../utils/orderNumber'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  // Products
  const addProduct = (product) =>
    setData((d) => ({ ...d, products: [...d.products, product] }))
  const updateProduct = (id, patch) =>
    setData((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  const deleteProduct = (id) =>
    setData((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) }))

  // Users
  const addUser = (user) => {
    setData((d) => ({ ...d, users: [...d.users, user] }))
    return user
  }
  const updateUser = (id, patch) =>
    setData((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }))
  const setDefaultAddress = (userId, address) => {
    setData((d) => ({
      ...d,
      users: d.users.map((u) =>
        u.id === userId
          ? { ...u, addresses: [...u.addresses, address], defaultAddressId: address.id }
          : u,
      ),
    }))
    return address
  }

  // Orders
  const createOrder = (orderInput) => {
    const order = {
      ...orderInput,
      id: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: orderInput.status, at: new Date().toISOString() }],
    }
    setData((d) => ({ ...d, orders: [order, ...d.orders] }))
    return order
  }
  const updateOrderStatus = (id, status, extra = {}) =>
    setData((d) => ({
      ...d,
      orders: d.orders.map((o) =>
        o.id === id
          ? { ...o, ...extra, status, statusHistory: [...o.statusHistory, { status, at: new Date().toISOString() }] }
          : o,
      ),
    }))

  // Homepage
  const updateHomepage = (patch) =>
    setData((d) => ({ ...d, homepage: { ...d.homepage, ...patch } }))

  const resetStore = () => setData(clearData())

  const value = {
    data,
    products: data.products,
    categories: data.categories,
    users: data.users,
    orders: data.orders,
    promos: data.promos,
    shipping: data.shipping,
    homepage: data.homepage,
    addProduct,
    updateProduct,
    deleteProduct,
    addUser,
    updateUser,
    setDefaultAddress,
    createOrder,
    updateOrderStatus,
    updateHomepage,
    resetStore,
  }

  // Dev convenience: allow resetting the demo store from the browser console.
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__dmbReset = resetStore
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
