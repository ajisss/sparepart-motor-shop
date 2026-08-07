import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toCategorySeed } from '../api/_lib/categories.js'

test('toCategorySeed adds slug + position', () => {
  const out = toCategorySeed([{ id: 'mesin', name: 'Mesin' }, { id: 'ban-velg', name: 'Ban & Velg' }])
  assert.deepEqual(out[0], { id: 'mesin', slug: 'mesin', name: 'Mesin', position: 0 })
  assert.equal(out[1].position, 1)
})
