import { getSql } from '../../_lib/db.js'
import { listProducts, createProduct, validateProductInput } from '../../_lib/products.js'
import { json, requireAdmin } from '../../_lib/http.js'

async function readBody(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  return JSON.parse(Buffer.concat(chunks).toString() || '{}')
}

export default async function handler(req, res) {
  const auth = requireAdmin(req)
  if (!auth.ok) return json(res, auth.status, { error: auth.error })
  try {
    if (req.method === 'GET') {
      const products = await listProducts(getSql(), { publishedOnly: false })
      return json(res, 200, { products })
    }
    if (req.method === 'POST') {
      const v = validateProductInput(await readBody(req))
      if (!v.ok) return json(res, 400, { error: v.error })
      const product = await createProduct(getSql(), v.value)
      return json(res, 201, { product })
    }
    json(res, 405, { error: 'Method not allowed' })
  } catch (e) {
    json(res, 500, { error: String(e.message || e) })
  }
}
