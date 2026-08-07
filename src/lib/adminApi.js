const SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

async function send(url, method, data) {
  const res = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json', 'x-admin-secret': SECRET },
    body: data ? JSON.stringify(data) : undefined,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Request gagal (${res.status})`)
  return body
}

export async function adminListProducts() {
  return (await send('/api/admin/products', 'GET')).products
}
export async function adminCreateProduct(data) {
  return (await send('/api/admin/products', 'POST', data)).product
}
export async function adminUpdateProduct(id, data) {
  return (await send(`/api/admin/products/${id}`, 'PUT', data)).product
}
export async function adminDeleteProduct(id) {
  return (await send(`/api/admin/products/${id}`, 'DELETE')).ok
}
