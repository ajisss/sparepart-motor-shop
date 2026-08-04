import { PRODUCTS } from '../data/products.js'
import { CATEGORIES } from '../data/categories.js'
import { USERS } from '../data/users.js'
import { PROMOS } from '../data/promos.js'
import { SHIPPING } from '../data/shipping.js'
import { HOMEPAGE } from '../data/homepage.js'
import { ORDERS } from '../data/orders.js'

export const VERSION = 5
const STORAGE_KEY = 'dmb:data'

export function buildSeed() {
  return structuredClone({
    version: VERSION,
    products: PRODUCTS,
    categories: CATEGORIES,
    users: USERS,
    orders: ORDERS,
    promos: PROMOS,
    shipping: SHIPPING,
    homepage: HOMEPAGE,
  })
}

export function shouldReseed(raw) {
  if (!raw) return true
  try {
    const parsed = JSON.parse(raw)
    return parsed?.version !== VERSION
  } catch {
    return true
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (shouldReseed(raw)) {
    const seed = buildSeed()
    saveData(seed)
    return seed
  }
  return JSON.parse(raw)
}

export function clearData() {
  const seed = buildSeed()
  saveData(seed)
  return seed
}
