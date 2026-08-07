async function getJson(url) {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Request gagal (${res.status})`)
  return body
}

export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const body = await getJson(`/api/products${qs ? `?${qs}` : ''}`)
  return body.products
}

export async function fetchProduct(id) {
  const body = await getJson(`/api/products/${id}`)
  return body.product
}

export async function fetchCategories() {
  const body = await getJson('/api/categories')
  return body.categories
}
