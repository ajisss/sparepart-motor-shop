import { useStore } from './StoreProvider'

export function useProducts() {
  return useStore().products
}

export function useProduct(id) {
  return useStore().products.find((p) => p.id === id) || null
}

export function useCategories() {
  return useStore().categories
}

export function useOrders() {
  return useStore().orders
}

export function useOrder(id) {
  return useStore().orders.find((o) => o.id === id) || null
}

export function usePromos() {
  return useStore().promos
}

export function useShipping() {
  return useStore().shipping
}

export function useHomepage() {
  return useStore().homepage
}
