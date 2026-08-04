import test from 'node:test'
import assert from 'node:assert/strict'
import {
  initialsFromName,
  colorForId,
  ensureConversation,
  sendMessage,
  markRead,
  totalUnread,
  sortByRecent,
  lastMessage,
} from '../src/lib/chatStore.js'
import { buildSeedConversations } from '../src/data/chats.js'

test('initialsFromName takes up to two initials from the name', () => {
  assert.equal(initialsFromName('Budi Santoso'), 'BS')
  assert.equal(initialsFromName('Sari'), 'S')
  assert.equal(initialsFromName(''), '?')
})

test('colorForId is deterministic for the same id', () => {
  assert.equal(colorForId('u1'), colorForId('u1'))
  assert.match(colorForId('u1'), /^#[0-9a-fA-F]{6}$/)
})

test('ensureConversation creates a conversation once and is idempotent', () => {
  const created = ensureConversation({}, { id: 'u1', name: 'Budi Santoso', userId: 'u1' }, 1000)
  assert.ok(created.u1)
  assert.equal(created.u1.name, 'Budi Santoso')
  assert.equal(created.u1.userId, 'u1')
  assert.deepEqual(created.u1.messages, [])
  assert.equal(created.u1.unreadForAdmin, 0)
  assert.equal(created.u1.unreadForCustomer, 0)
  assert.equal(created.u1.updatedAt, 1000)

  const again = ensureConversation(created, { id: 'u1', name: 'Budi Santoso', userId: 'u1' }, 2000)
  assert.equal(again, created) // unchanged, no new object
})

test('sendMessage from customer appends a message and increments admin unread', () => {
  const base = ensureConversation({}, { id: 'u1', name: 'Budi Santoso', userId: 'u1' }, 1000)
  const next = sendMessage(base, 'u1', 'customer', 'Halo, stok ada?', 2000)

  assert.equal(next.u1.messages.length, 1)
  assert.equal(next.u1.messages[0].from, 'customer')
  assert.equal(next.u1.messages[0].text, 'Halo, stok ada?')
  assert.equal(next.u1.unreadForAdmin, 1)
  assert.equal(next.u1.unreadForCustomer, 0)
  assert.equal(next.u1.updatedAt, 2000)
})

test('sendMessage from admin increments customer unread instead', () => {
  const base = ensureConversation({}, { id: 'u1', name: 'Budi Santoso', userId: 'u1' }, 1000)
  const next = sendMessage(base, 'u1', 'admin', 'Ada, mau order?', 2000)

  assert.equal(next.u1.unreadForAdmin, 0)
  assert.equal(next.u1.unreadForCustomer, 1)
})

test('sendMessage is a no-op for an unknown conversation', () => {
  const base = {}
  const next = sendMessage(base, 'missing', 'admin', 'hi', 1000)
  assert.equal(next, base)
})

test('markRead zeroes only the requested side', () => {
  let convos = ensureConversation({}, { id: 'u1', name: 'Budi', userId: 'u1' }, 1000)
  convos = sendMessage(convos, 'u1', 'customer', 'hi', 2000)
  convos = sendMessage(convos, 'u1', 'admin', 'halo', 3000)
  assert.equal(convos.u1.unreadForAdmin, 1)
  assert.equal(convos.u1.unreadForCustomer, 1)

  const adminRead = markRead(convos, 'u1', 'admin')
  assert.equal(adminRead.u1.unreadForAdmin, 0)
  assert.equal(adminRead.u1.unreadForCustomer, 1)
})

test('totalUnread sums the requested side across all conversations', () => {
  let convos = ensureConversation({}, { id: 'u1', name: 'Budi', userId: 'u1' }, 1000)
  convos = ensureConversation(convos, { id: 'u2', name: 'Sari', userId: 'u2' }, 1000)
  convos = sendMessage(convos, 'u1', 'customer', 'hi', 2000)
  convos = sendMessage(convos, 'u2', 'customer', 'hi', 2000)

  assert.equal(totalUnread(convos, 'admin'), 2)
  assert.equal(totalUnread(convos, 'customer'), 0)
})

test('sortByRecent orders conversations by updatedAt descending', () => {
  let convos = ensureConversation({}, { id: 'u1', name: 'Budi', userId: 'u1' }, 1000)
  convos = ensureConversation(convos, { id: 'u2', name: 'Sari', userId: 'u2' }, 2000)
  const sorted = sortByRecent(convos)
  assert.deepEqual(sorted.map((c) => c.id), ['u2', 'u1'])
})

test('lastMessage returns the most recent message or null', () => {
  let convos = ensureConversation({}, { id: 'u1', name: 'Budi', userId: 'u1' }, 1000)
  assert.equal(lastMessage(convos.u1), null)
  convos = sendMessage(convos, 'u1', 'customer', 'hi', 2000)
  convos = sendMessage(convos, 'u1', 'admin', 'halo', 3000)
  assert.equal(lastMessage(convos.u1).text, 'halo')
})

test('buildSeedConversations returns the 8 mock contacts with the new schema', () => {
  const seed = buildSeedConversations()
  const ids = Object.keys(seed)
  assert.equal(ids.length, 8)

  for (const id of ids) {
    const c = seed[id]
    assert.equal(c.id, id)
    assert.ok(c.name)
    assert.ok(c.initials)
    assert.ok(c.color)
    assert.equal(c.userId, null)
    assert.equal(typeof c.online, 'boolean')
    assert.equal(typeof c.unreadForAdmin, 'number')
    assert.equal(c.unreadForCustomer, 0)
    assert.equal(typeof c.updatedAt, 'number')
    assert.ok(Array.isArray(c.messages) && c.messages.length > 0)
    for (const m of c.messages) {
      assert.ok(['admin', 'customer'].includes(m.from))
      assert.ok(m.text)
      assert.ok(m.time)
    }
  }
})
