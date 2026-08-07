import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchProducts } from '../src/lib/api.js'

test('fetchProducts returns products array on 200', async () => {
  global.fetch = async () => ({ ok: true, json: async () => ({ products: [{ id: 'p1' }] }) })
  const out = await fetchProducts()
  assert.deepEqual(out, [{ id: 'p1' }])
})

test('fetchProducts throws on non-2xx', async () => {
  global.fetch = async () => ({ ok: false, status: 500, json: async () => ({ error: 'x' }) })
  await assert.rejects(() => fetchProducts())
})
