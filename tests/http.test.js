import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requireAdmin } from '../api/_lib/http.js'

test('requireAdmin fails when APP_TARGET is not admin', () => {
  delete process.env.APP_TARGET
  const r = requireAdmin({ headers: {} })
  assert.equal(r.ok, false)
  assert.equal(r.status, 404)
})

test('requireAdmin fails on bad secret', () => {
  process.env.APP_TARGET = 'admin'
  process.env.ADMIN_API_SECRET = 'right'
  const r = requireAdmin({ headers: { 'x-admin-secret': 'wrong' } })
  assert.equal(r.ok, false)
  assert.equal(r.status, 401)
})

test('requireAdmin passes with correct target + secret', () => {
  process.env.APP_TARGET = 'admin'
  process.env.ADMIN_API_SECRET = 'right'
  const r = requireAdmin({ headers: { 'x-admin-secret': 'right' } })
  assert.equal(r.ok, true)
})
