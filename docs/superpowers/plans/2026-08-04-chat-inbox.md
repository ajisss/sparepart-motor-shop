# Chat Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a customer-facing chat inbox icon to the storefront header that lets logged-in customers message the store, synced two-way with the existing admin `ChatsPage`.

**Architecture:** A pure, framework-free `chatStore.js` module owns the conversation data shape and all transitions (create conversation, send message, mark read, sort, unread totals) so it can be unit-tested with `node --test` the same way `tests/section-banners.test.js` tests `SECTION_BANNERS`. A new `ChatContext` (same provider + `localStorage` shape as the existing `CartContext`) wraps that pure module with React state, persistence, and cross-tab sync via the `storage` event. The customer header (`Nav.jsx`) and the admin `ChatsPage.jsx`/`Sidebar.jsx` both consume `ChatContext`, so they read and write the same `localStorage['dmb:chats']` data — no backend involved.

**Tech Stack:** React 19, react-router-dom, `@phosphor-icons/react` (already a dependency), Tailwind CSS, `node --test` for pure-logic unit tests, Vite.

## Global Constraints

- Frontend-only, no backend/API — all persistence via `localStorage`, matching `CartContext`/`AuthContext`/`store/seed.js`.
- Storage key for this feature: `dmb:chats` (spec: `docs/superpowers/specs/2026-08-04-chat-inbox-design.md`).
- Pure conversation logic must live in a module free of `localStorage`/DOM access, since `node --test` runs under plain Node with no `localStorage`/DOM global (verified: `typeof localStorage === 'undefined'` under Node v26.5.0 in this project).
- Inbox icon uses `ChatCircleText` from `@phosphor-icons/react`, positioned between the Cart icon and Akun/Login in `Nav.jsx`.
- Logged-out click on the inbox icon navigates to `/login` — no dropdown for logged-out users.
- Existing 8 mock contacts currently hardcoded in `ChatsPage.jsx` become the seed data for `dmb:chats`, unchanged in content (names, avatars, messages).
- `npm run lint` and `npm run build` must both pass before this feature is considered done.

---

### Task 1: Pure chat store logic + seed data

**Files:**
- Create: `src/lib/chatStore.js`
- Create: `src/data/chats.js`
- Test: `tests/chat-store.test.js`

**Interfaces:**
- Produces (used by Task 2's `ChatContext`):
  - `initialsFromName(name: string): string`
  - `colorForId(id: string): string` (hex color)
  - `ensureConversation(conversations: object, { id, name, userId }, now: number): object` — returns a new conversations map with that id present, creating it if missing
  - `sendMessage(conversations: object, conversationId: string, from: 'admin' | 'customer', text: string, now: number): object` — returns a new conversations map with the message appended; no-ops (returns `conversations` unchanged) if `conversationId` doesn't exist
  - `markRead(conversations: object, conversationId: string, by: 'admin' | 'customer'): object`
  - `totalUnread(conversations: object, by: 'admin' | 'customer'): number`
  - `sortByRecent(conversations: object): array` — conversations sorted by `updatedAt` descending
  - `lastMessage(conversation: object): object | null`
  - `buildSeedConversations(): object` (from `src/data/chats.js`) — the initial `dmb:chats` shape

- [x] **Step 1: Write the failing tests**

Create `tests/chat-store.test.js`:

```js
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
```

- [x] **Step 2: Run tests to verify they fail**

Run: `node --test tests/chat-store.test.js`
Expected: FAIL — `Cannot find module '../src/lib/chatStore.js'` (module doesn't exist yet)

- [x] **Step 3: Implement `src/lib/chatStore.js`**

```js
const AVATAR_PALETTE = ['#71717A', '#16a34a', '#e07b54', '#7c3aed', '#374151', '#be185d', '#1d4ed8', '#9f1239']

export function initialsFromName(name) {
  const initials = (name || '')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return initials || '?'
}

export function colorForId(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

export function ensureConversation(conversations, { id, name, userId }, now) {
  if (conversations[id]) return conversations
  return {
    ...conversations,
    [id]: {
      id,
      name,
      initials: initialsFromName(name),
      color: colorForId(id),
      userId: userId ?? null,
      online: false,
      unreadForAdmin: 0,
      unreadForCustomer: 0,
      updatedAt: now,
      messages: [],
    },
  }
}

export function sendMessage(conversations, conversationId, from, text, now) {
  const conversation = conversations[conversationId]
  if (!conversation) return conversations

  const message = {
    id: `${conversationId}-${conversation.messages.length}-${now}`,
    from,
    text,
    time: new Date(now).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  }
  const unreadKey = from === 'customer' ? 'unreadForAdmin' : 'unreadForCustomer'

  return {
    ...conversations,
    [conversationId]: {
      ...conversation,
      messages: [...conversation.messages, message],
      updatedAt: now,
      [unreadKey]: conversation[unreadKey] + 1,
    },
  }
}

export function markRead(conversations, conversationId, by) {
  const conversation = conversations[conversationId]
  if (!conversation) return conversations
  const unreadKey = by === 'admin' ? 'unreadForAdmin' : 'unreadForCustomer'
  if (conversation[unreadKey] === 0) return conversations
  return { ...conversations, [conversationId]: { ...conversation, [unreadKey]: 0 } }
}

export function totalUnread(conversations, by) {
  const unreadKey = by === 'admin' ? 'unreadForAdmin' : 'unreadForCustomer'
  return Object.values(conversations).reduce((sum, c) => sum + c[unreadKey], 0)
}

export function sortByRecent(conversations) {
  return Object.values(conversations).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function lastMessage(conversation) {
  return conversation.messages[conversation.messages.length - 1] ?? null
}
```

- [x] **Step 4: Implement `src/data/chats.js`**

This carries over the 8 mock contacts currently hardcoded in `src/pages/admin/ChatsPage.jsx` (the `CONTACTS` array), reshaped into the new schema: `unread` → `unreadForAdmin`, `preview`/top-level `time` dropped (both are derived from the last message via `lastMessage()`), each message gains a stable string `id`.

```js
import { initialsFromName, colorForId } from '../lib/chatStore.js'

const SEED_CONTACTS = [
  {
    id: 'c1',
    name: 'Andi Pratama',
    online: true,
    unreadForAdmin: 2,
    messages: [
      { from: 'customer', text: 'Halo, mau tanya stok kampas rem untuk Honda Vario 150 masih ada?', time: '10:28' },
      { from: 'admin', text: 'Halo Andi! Ada, stok masih aman. Mau langsung order?', time: '10:29' },
      { from: 'customer', text: 'Iya, tadi udah order. Kira-kira kapan bisa dikirim?', time: '10:31' },
      { from: 'admin', text: 'Pesanan kamu sudah kami proses. Estimasi pengiriman 1–2 hari kerja ya!', time: '10:32' },
      { from: 'customer', text: 'Siap, makasih bang!', time: '10:33' },
      { from: 'customer', text: 'Bang, kampas rem Vario saya udah nyampe belum ya?', time: '10:33' },
    ],
  },
  {
    id: 'c2',
    name: 'James Carter',
    online: false,
    unreadForAdmin: 2,
    messages: [
      { from: 'customer', text: 'Hi, I ordered a chain kit last night. Has my order been shipped already?', time: '10:18' },
      { from: 'admin', text: "Hi James! Your order is being processed. We'll ship it today.", time: '10:20' },
    ],
  },
  {
    id: 'c3',
    name: 'Olivia',
    online: true,
    unreadForAdmin: 1,
    messages: [
      { from: 'customer', text: 'Halo, pesanan saya bisa diganti alamat pengirimannya gak ya? Salah input tadi.', time: '09:55' },
    ],
  },
  {
    id: 'c4',
    name: 'Ethan Ramirez',
    online: false,
    unreadForAdmin: 0,
    messages: [
      { from: 'customer', text: 'Filter oli yang saya terima kayaknya beda sama foto di website.', time: '09:38' },
      { from: 'admin', text: 'Maaf atas ketidaknyamanannya. Boleh kirim foto produk yang diterima?', time: '09:40' },
    ],
  },
  {
    id: 'c5',
    name: 'Liam Parker',
    online: false,
    unreadForAdmin: 0,
    messages: [
      { from: 'customer', text: 'Knalpot racing nya udah sampe, packagingnya aman banget. Thanks!', time: 'Kemarin' },
      { from: 'admin', text: 'Terima kasih sudah belanja di DMB! Jangan lupa kasih review ya.', time: 'Kemarin' },
      { from: 'customer', text: 'Thanks for the quick response!', time: 'Kemarin' },
    ],
  },
  {
    id: 'c6',
    name: 'Julia',
    online: false,
    unreadForAdmin: 4,
    messages: [{ from: 'customer', text: 'Halo, bisa cancel pesanan yang baru aja saya buat?', time: 'Kemarin' }],
  },
  {
    id: 'c7',
    name: 'Budi Santoso',
    online: false,
    unreadForAdmin: 3,
    messages: [{ from: 'customer', text: 'Bang, baut manifold M8 ukuran 30mm ada stoknya gak?', time: 'Kemarin' }],
  },
  {
    id: 'c8',
    name: 'Michelle',
    online: false,
    unreadForAdmin: 0,
    messages: [{ from: 'customer', text: 'Pesanan saya udah dikirim belum ya?', time: 'Kemarin' }],
  },
]

export function buildSeedConversations() {
  const now = Date.now()
  const conversations = {}

  SEED_CONTACTS.forEach((contact, index) => {
    conversations[contact.id] = {
      id: contact.id,
      name: contact.name,
      initials: initialsFromName(contact.name),
      color: colorForId(contact.id),
      userId: null,
      online: contact.online,
      unreadForAdmin: contact.unreadForAdmin,
      unreadForCustomer: 0,
      updatedAt: now - index * 60_000,
      messages: contact.messages.map((m, i) => ({ id: `${contact.id}-${i}`, ...m })),
    }
  })

  return conversations
}
```

- [x] **Step 5: Run tests to verify they pass**

Run: `node --test tests/chat-store.test.js`
Expected: PASS, all 10 tests green

- [x] **Step 6: Run the full test suite to check nothing else broke**

Run: `npm test`
Expected: PASS, including the pre-existing `product-assets.test.js` and `section-banners.test.js`

- [x] **Step 7: Commit**

```bash
git add src/lib/chatStore.js src/data/chats.js tests/chat-store.test.js
git commit -m "feat: add pure chat store logic and seed conversations"
```

---

### Task 2: `ChatContext` provider + wire into `App.jsx`

**Files:**
- Create: `src/context/ChatContext.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `useAuth()` from `src/context/AuthContext.jsx` (`currentUser: { id, name, ... } | null`); everything from Task 1's `src/lib/chatStore.js` and `src/data/chats.js`.
- Produces (used by Task 3 and Task 4):
  - `useChat()` returning:
    - `conversationList: array` — all conversations, sorted by recency (for `ChatsPage`)
    - `myConversation: object | null` — the logged-in customer's own conversation, or `null` if logged out or no conversation yet
    - `myUnread: number` — `myConversation.unreadForCustomer`, or `0`
    - `adminUnreadTotal: number` — sum of `unreadForAdmin` across all conversations (for `Sidebar`)
    - `sendAsCustomer(text: string): void`
    - `sendAsAdmin(conversationId: string, text: string): void`
    - `markReadBy(conversationId: string, by: 'admin' | 'customer'): void`
    - `lastMessage: (conversation: object) => object | null` (re-exported from `chatStore.js` for convenience in list rendering)

- [x] **Step 1: Implement `src/context/ChatContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { buildSeedConversations } from '../data/chats'
import { ensureConversation, sendMessage, markRead, totalUnread, sortByRecent, lastMessage } from '../lib/chatStore'

const ChatContext = createContext(null)
const STORAGE_KEY = 'dmb:chats'

function loadConversations() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return buildSeedConversations()
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return buildSeedConversations()
    return parsed
  } catch {
    return buildSeedConversations()
  }
}

export function ChatProvider({ children }) {
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState(() => loadConversations())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setConversations(loadConversations())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const sendAsCustomer = (text) => {
    if (!currentUser || !text.trim()) return
    const now = Date.now()
    setConversations((prev) => {
      const withConversation = ensureConversation(
        prev,
        { id: currentUser.id, name: currentUser.name, userId: currentUser.id },
        now,
      )
      return sendMessage(withConversation, currentUser.id, 'customer', text.trim(), now)
    })
  }

  const sendAsAdmin = (conversationId, text) => {
    if (!text.trim()) return
    setConversations((prev) => sendMessage(prev, conversationId, 'admin', text.trim(), Date.now()))
  }

  const markReadBy = (conversationId, by) => {
    setConversations((prev) => markRead(prev, conversationId, by))
  }

  const myConversation = currentUser ? conversations[currentUser.id] ?? null : null

  const value = {
    conversationList: sortByRecent(conversations),
    myConversation,
    myUnread: myConversation?.unreadForCustomer ?? 0,
    adminUnreadTotal: totalUnread(conversations, 'admin'),
    sendAsCustomer,
    sendAsAdmin,
    markReadBy,
    lastMessage,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
```

- [x] **Step 2: Wire `ChatProvider` into `App.jsx`**

In `src/App.jsx`, add the import next to the other context imports:

```jsx
import { ChatProvider } from './context/ChatContext'
```

Then nest it between `AuthProvider` and `CartProvider` (it needs `useAuth()`, and `CartProvider`/`Routes` don't need to be inside it, but nesting it there keeps every route covered by both providers):

```jsx
      <StoreProvider>
        <AuthProvider>
          <ChatProvider>
            <CartProvider>
              <Routes>
                {/* ...unchanged... */}
              </Routes>
            </CartProvider>
          </ChatProvider>
        </AuthProvider>
      </StoreProvider>
```

- [x] **Step 3: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds with no new errors (Task 3/4 haven't consumed `useChat()` yet, so this only proves the provider tree is valid)

- [x] **Step 4: Commit**

```bash
git add src/context/ChatContext.jsx src/App.jsx
git commit -m "feat: add ChatContext and wire it into the app"
```

---

### Task 3: Customer inbox icon + dropdown in `Nav.jsx`

**Files:**
- Modify: `src/components/layout/Nav.jsx`

**Interfaces:**
- Consumes: `useChat()` from Task 2 (`myConversation`, `myUnread`, `sendAsCustomer`, `markReadBy`); `useAuth()`'s existing `isLoggedIn`; `ChatCircleText`, `PaperPlaneTilt` from `@phosphor-icons/react`.

- [x] **Step 1: Add imports and new state**

In `src/components/layout/Nav.jsx`, add to the top imports:

```jsx
import { ChatCircleText, PaperPlaneTilt } from '@phosphor-icons/react'
import { useChat } from '../../context/ChatContext'
```

Inside `Nav()`, alongside the existing `cartOpen`/`cartRef` state (after `const cartRef = useRef(null)`):

```jsx
  const { myConversation, myUnread, sendAsCustomer, markReadBy } = useChat()
  const [inboxOpen, setInboxOpen] = useState(false)
  const [inboxInput, setInboxInput] = useState('')
  const inboxRef = useRef(null)
```

- [x] **Step 2: Close the inbox dropdown on outside click, Escape, and route change**

Add a new effect mirroring the existing mini-cart one (place it right after the mini-cart's outside-click effect, before the "Close the mini-cart whenever the route changes" effect):

```jsx
  // Close the inbox popup on outside click or Escape.
  useEffect(() => {
    if (!inboxOpen) return
    const onDown = (e) => {
      if (inboxRef.current && !inboxRef.current.contains(e.target)) setInboxOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setInboxOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [inboxOpen])
```

Change the existing route-change effect to also close the inbox:

```jsx
  // Close the mini-cart and inbox whenever the route changes.
  useEffect(() => {
    setCartOpen(false)
    setInboxOpen(false)
  }, [location.pathname])
```

- [x] **Step 3: Mark the customer's messages read when the dropdown opens**

Add another small effect near the others:

```jsx
  // Mark the customer's unread admin replies as read once they open the inbox.
  useEffect(() => {
    if (inboxOpen && myConversation && myConversation.unreadForCustomer > 0) {
      markReadBy(myConversation.id, 'customer')
    }
  }, [inboxOpen])
```

- [x] **Step 4: Add a `handleSendInbox` helper**

Place this near the top of the component body, alongside the other derived values (e.g. after `recentItems`):

```jsx
  const handleSendInbox = () => {
    if (!inboxInput.trim()) return
    sendAsCustomer(inboxInput)
    setInboxInput('')
  }
```

- [x] **Step 5: Add the inbox icon + dropdown JSX**

In the render, insert this block right after the closing `</div>` of the "Cart + mini-cart popup" `<div className="relative" ref={cartRef}>...</div>` block, and before the `{isLoggedIn ? (...) : (...)}` Akun/Login block:

```jsx
        {/* Inbox */}
        <div className="relative" ref={inboxRef}>
          <button
            type="button"
            aria-label="Pesan"
            aria-expanded={inboxOpen}
            onClick={() => {
              if (!isLoggedIn) {
                navigate('/login')
                return
              }
              setInboxOpen((o) => !o)
            }}
            className="relative flex size-5 items-center justify-center"
          >
            <ChatCircleText size={20} className={link} />
            {isLoggedIn && myUnread > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-600 text-xs font-semibold text-neutral-900">
                {myUnread}
              </span>
            )}
          </button>

          {isLoggedIn && inboxOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 flex w-80 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-0 text-left shadow-xl">
              <div className="border-b border-neutral-100 px-4 py-3">
                <h3 className="font-medium text-neutral-900">Chat dengan Toko</h3>
              </div>

              <div className="flex h-72 flex-col gap-3 overflow-y-auto px-4 py-3">
                {!myConversation || myConversation.messages.length === 0 ? (
                  <p className="m-auto text-center text-sm text-neutral-500">Mulai chat dengan kami.</p>
                ) : (
                  myConversation.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                          msg.from === 'customer' ? 'bg-neutral-900 text-neutral-0' : 'bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3">
                <input
                  value={inboxInput}
                  onChange={(e) => setInboxInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInbox()}
                  placeholder="Ketik pesan..."
                  className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendInbox}
                  aria-label="Kirim pesan"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-neutral-0 hover:bg-neutral-800"
                >
                  <PaperPlaneTilt size={16} weight="fill" />
                </button>
              </div>
            </div>
          )}
        </div>
```

- [x] **Step 6: Manual verification**

Run: `npm run dev`, open `http://localhost:5173/`

1. Logged out: click the new inbox icon → confirm it navigates to `/login`.
2. Log in as `budi@dmb.com` / `password`. Click the inbox icon → confirm the dropdown opens with the empty state ("Mulai chat dengan kami").
3. Type a message, press Enter → confirm it appears right-aligned in the dropdown and the input clears.
4. Click outside the dropdown → confirm it closes. Reopen it → confirm the message persisted.
5. Refresh the page → confirm the message is still there (persisted via `localStorage`).

- [x] **Step 7: Commit**

```bash
git add src/components/layout/Nav.jsx
git commit -m "feat: add customer inbox icon and chat dropdown to the header"
```

---

### Task 4: Wire admin `ChatsPage` to `ChatContext`

**Files:**
- Modify: `src/pages/admin/ChatsPage.jsx`

**Interfaces:**
- Consumes: `useChat()` from Task 2 (`conversationList`, `sendAsAdmin`, `markReadBy`, `lastMessage`).

- [x] **Step 1: Replace the local mock data and state with `ChatContext`**

In `src/pages/admin/ChatsPage.jsx`, delete the entire hardcoded `CONTACTS` array (lines 4–126) and the `import { useState } from 'react'` stays, but add:

```jsx
import { useChat } from '../../context/ChatContext'
```

Replace the component's opening state block:

```jsx
export default function ChatsPage() {
  const [activeId, setActiveId] = useState('c1')
  const [input, setInput] = useState('')
  const [chats, setChats] = useState(CONTACTS)

  const active = chats.find((c) => c.id === activeId)
  const totalUnread = chats.reduce((s, c) => s + c.unread, 0)

  function send() {
    if (!input.trim()) return
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { id: Date.now(), from: 'admin', text: input.trim(), time: 'Baru saja' }], preview: input.trim() }
          : c
      )
    )
    setInput('')
  }
```

with:

```jsx
export default function ChatsPage() {
  const { conversationList, sendAsAdmin, markReadBy, lastMessage } = useChat()
  const [activeId, setActiveId] = useState(null)
  const [input, setInput] = useState('')

  const chats = conversationList
  const activeConversationId = activeId ?? chats[0]?.id ?? null
  const active = chats.find((c) => c.id === activeConversationId)
  const totalUnread = chats.reduce((s, c) => s + c.unreadForAdmin, 0)

  function selectConversation(id) {
    setActiveId(id)
    markReadBy(id, 'admin')
  }

  function send() {
    if (!input.trim() || !active) return
    sendAsAdmin(active.id, input)
    setInput('')
  }
```

- [x] **Step 2: Update the conversation list rendering to use `lastMessage`/`unreadForAdmin`**

Replace the list `<button onClick={() => setActiveId(c.id)} ...>` (inside the `{chats.map((c) => (...))}` block) so it calls `selectConversation` and derives preview/time/unread from the new schema:

```jsx
              <button
                onClick={() => selectConversation(c.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                  activeConversationId === c.id ? 'bg-[var(--adm-bg)]' : 'hover:bg-[var(--adm-bg)]'
                }`}
              >
                <Avatar contact={c} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-black">{c.name}</p>
                  <p className="truncate text-[13px] text-[var(--adm-muted)]">{lastMessage(c)?.text ?? ''}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[11px] text-[var(--adm-muted)]">{lastMessage(c)?.time ?? ''}</span>
                  {c.unreadForAdmin > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--adm-forest-500)] text-[11px] font-semibold text-white">
                      {c.unreadForAdmin}
                    </span>
                  )}
                </div>
              </button>
```

(This replaces `activeId === c.id` → `activeConversationId === c.id`, `c.preview` → `lastMessage(c)?.text ?? ''`, `c.time` → `lastMessage(c)?.time ?? ''`, and `c.unread` → `c.unreadForAdmin` in both the condition and the badge.)

- [x] **Step 3: Manual verification**

With the dev server running (`npm run dev`), and Task 3 already merged:

1. Log in as `budi@dmb.com` / `password` on the storefront, send a message via the header inbox (e.g. "Baut manifold M8 ada?").
2. In another tab, log in to `/admin/login` as `admin@dmb.com` / `admin123`, go to `/admin/chats`.
3. Confirm a conversation named "Budi Santoso" appears in the list (separate from the seeded mock "Budi Santoso" `c7` contact — this is expected, since the mock contact and the real logged-in user are different conversation ids) with the sent message as its preview and an unread badge.
4. Click it, confirm the message shows in the chat window and the unread badge clears.
5. Reply as admin, confirm `send()` appends the reply.
6. Switch back to the storefront tab, open the inbox dropdown again (may need to click elsewhere then reopen, or refresh) — confirm the admin's reply appears and the header badge shows the new unread count.

- [x] **Step 4: Commit**

```bash
git add src/pages/admin/ChatsPage.jsx
git commit -m "feat: sync admin ChatsPage with the shared ChatContext"
```

---

### Task 5: Live unread badge on the admin sidebar

**Files:**
- Modify: `src/components/admin/Sidebar.jsx`

**Interfaces:**
- Consumes: `useChat()` from Task 2 (`adminUnreadTotal`).

- [x] **Step 1: Move `MENU` inside the component so it can read live data**

In `src/components/admin/Sidebar.jsx`, add the import:

```jsx
import { useChat } from '../../context/ChatContext'
```

Delete the module-level `MENU` constant:

```jsx
const MENU = [
  { to: '/admin', label: 'Dashboard', Icon: SquaresFour, end: true },
  { to: '/admin/orders', label: 'Pesanan', Icon: ClipboardText },
  { to: '/admin/products', label: 'Produk', Icon: Package },
  { to: '/admin/chats', label: 'Chat', Icon: ChatCircleText, badge: 4 },
]
```

(Leave the `GENERAL` constant below it untouched — it stays module-level since it has no dynamic data.)

- [x] **Step 2: Rebuild `MENU` inside `Sidebar()` using live unread count**

Change:

```jsx
export default function Sidebar() {
  return (
```

to:

```jsx
export default function Sidebar() {
  const { adminUnreadTotal } = useChat()
  const MENU = [
    { to: '/admin', label: 'Dashboard', Icon: SquaresFour, end: true },
    { to: '/admin/orders', label: 'Pesanan', Icon: ClipboardText },
    { to: '/admin/products', label: 'Produk', Icon: Package },
    { to: '/admin/chats', label: 'Chat', Icon: ChatCircleText, badge: adminUnreadTotal > 0 ? adminUnreadTotal : undefined },
  ]

  return (
```

- [x] **Step 3: Manual verification**

With the dev server running and an admin session active on `/admin`:

1. Confirm the sidebar "Chat" badge reflects the real total unread count from `ChatsPage` (matches the seeded mock contacts' unread counts on first load: 2+2+1+0+0+4+3+0 = 12).
2. Open `/admin/chats`, click into every conversation with an unread badge to mark them read, confirm the sidebar badge count decreases accordingly and disappears entirely at 0.

- [x] **Step 4: Commit**

```bash
git add src/components/admin/Sidebar.jsx
git commit -m "feat: make the admin sidebar chat badge reflect live unread count"
```

---

### Task 6: Full verification pass

**Files:** none (verification only)

- [x] **Step 1: Run the full automated test suite**

Run: `npm test`
Expected: PASS, all tests including `tests/chat-store.test.js`

- [x] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors

- [x] **Step 3: Run production build**

Run: `npm run build`
Expected: build succeeds

- [x] **Step 4: End-to-end manual walkthrough in the browser**

With `npm run dev` running:

1. Fresh browser profile / clear `localStorage` (or open a private window) to exercise first-load seeding.
2. Logged out: click the header inbox icon → redirected to `/login`.
3. Log in as `sari@dmb.com` / `password` (a customer with no prior conversation). Open inbox → empty state shown. Send "Halo, ada promo ban?" → appears immediately.
4. In a second tab, log in as admin (`admin@dmb.com` / `admin123`) → `/admin/chats` → confirm "Sari Wulandari" appears in the list with that message as preview, sidebar badge includes it.
5. Reply from admin. Back in the customer tab, reopen the inbox (or wait for the `storage` event) → reply visible, badge clears once opened.
6. Refresh both tabs → all messages and unread states persisted correctly.
7. Confirm the pre-existing seeded conversations (Andi Pratama, James Carter, etc.) still render correctly in `/admin/chats` exactly as before this feature.

- [x] **Step 5: Final commit (only if any fixes were needed in this task)**

If steps 1–4 required no code changes, this task produces no commit — the feature is complete as of Task 5's commit.
