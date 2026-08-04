import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PRODUCTS } from '../src/data/products.js'
import { VERSION } from '../src/store/seed.js'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))

test('all seeded products use unique generated PNG assets', () => {
  assert.equal(PRODUCTS.length, 15)
  const paths = PRODUCTS.map((product) => product.images[0])
  assert.equal(new Set(paths).size, 15)

  for (const path of paths) {
    assert.match(path, /^\/products\/generated\/[a-z0-9-]+\.png$/)
    assert.equal(existsSync(`${projectRoot}public${path}`), true, `${path} is missing`)
  }
})

test('the store reseeds existing browsers after image mappings change', () => {
  assert.equal(VERSION, 5)
})
