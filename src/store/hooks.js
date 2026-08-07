import { useState, useEffect } from 'react'
import { fetchProducts, fetchProduct, fetchCategories } from '../lib/api.js'
import { useStore } from './StoreProvider'

export function useProducts(params) {
  const [state, setState] = useState({ products: [], loading: true, error: null })
  const key = JSON.stringify(params || {})
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fetchProducts(params)
      .then((products) => alive && setState({ products, loading: false, error: null }))
      .catch((error) => alive && setState({ products: [], loading: false, error }))
    return () => { alive = false }
  }, [key])
  return state
}

export function useProduct(id) {
  const [state, setState] = useState({ product: null, loading: true, error: null })
  useEffect(() => {
    let alive = true
    setState({ product: null, loading: true, error: null })
    fetchProduct(id)
      .then((product) => alive && setState({ product, loading: false, error: null }))
      .catch((error) => alive && setState({ product: null, loading: false, error }))
    return () => { alive = false }
  }, [id])
  return state
}

export function useCategories() {
  const [state, setState] = useState({ categories: [], loading: true, error: null })
  useEffect(() => {
    let alive = true
    fetchCategories()
      .then((categories) => alive && setState({ categories, loading: false, error: null }))
      .catch((error) => alive && setState({ categories: [], loading: false, error }))
    return () => { alive = false }
  }, [])
  return state
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
