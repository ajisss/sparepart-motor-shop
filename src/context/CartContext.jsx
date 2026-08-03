import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/StoreProvider'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { products } = useStore()

  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem('dmb:cart')
    return raw ? JSON.parse(raw) : []
  })

  useEffect(() => {
    localStorage.setItem('dmb:cart', JSON.stringify(items))
  }, [items])

  const addItem = (productId, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { productId, qty }]
    })
  }

  const updateQty = (productId, qty) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty } : i)))
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => {
      const product = products.find((p) => p.id === i.productId)
      return product ? sum + product.price * i.qty : sum
    }, 0)
  }, [items, products])

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
