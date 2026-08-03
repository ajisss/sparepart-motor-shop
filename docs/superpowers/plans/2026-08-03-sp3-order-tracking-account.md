# SP3 — Order Tracking & Customer Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute AFTER SP1 (data foundation) and SP2 (storefront + checkout) — this plan reads the SP1 store and reuses SP2 primitives.

**Goal:** Add the post-purchase customer surface: guest order tracking (`/lacak`), a read-only customer account (`/akun` with Profil / Alamat / Riwayat tabs), and a shared order detail view (`/pesanan/:id`) with a status timeline and shipment/resi block — plus seed demo orders so it is all demonstrable.

**Architecture:** Three new pages read the existing SP1 store; no new store mutations. `/pesanan/:id` is guarded: a logged-in owner opens it directly from history, a guest reaches it only after matching Order ID + email/HP on `/lacak` (which passes `location.state.verified`). Order detail composes two new presentational components (`OrderSummaryCard`, `OrderTimeline`). Pure logic (`formatDate`, `contactMatches`, seed-order integrity) is verified with `node`; UI is verified with `npm run build` + `npm run lint` + a browser smoke test.

**Tech Stack:** React 19, Vite 8, React Router 7, Tailwind 3, SP1 store.

## Global Constraints

- Front-end-only POC prototype for showcase — everything simulated in localStorage via `StoreProvider`. Favor a convincing demo over backend correctness. YAGNI.
- **No new dependencies. No test framework**: pure-logic files are verified by running `node`; UI is verified with `npm run build` + `npm run lint` + a browser smoke test.
- **SP3 is read-only**: NO profile/address editing, NO new store mutations. Pages only read via `useOrders`, `useOrder`, `useStore().orders`, `useAuth().currentUser`.
- **Order `status` is exactly one of** `'Menunggu pembayaran'`, `'Sedang diproses'`, `'Siap dikirim'`, `'Dalam pengiriman'`, `'Selesai'`, `'Refund diproses'`. Never invent status strings; `StatusBadge` already colors these six.
- **Order shape** (from SP1): `{ id, createdAt, userId (null=guest), contact:{name,email,phone}, shippingAddress:{recipientName,phone,line,city,province,postalCode}, items:[{productId,sku,name,price,qty}], shipping:{courier,service,cost,etaLabel}, promo:{code,discount}|null, subtotal, shippingCost, discount, total, paymentStatus, status, statusHistory:[{status,at}], tracking:{number,courier,history:[{status,at,note}]}|null }`.
- **Access model for `/pesanan/:id`**: render only when `order` exists AND (`currentUser && order.userId === currentUser.id`) OR (`location.state.verified === true`). Otherwise `navigate('/lacak', { replace:true, state:{ orderId:id } })`.
- Indonesian copy throughout. Money via `src/utils/formatCurrency.js`. Dates via the new `src/utils/formatDate.js`.
- Do NOT use native `alert`/`confirm`/`prompt`.
- Each task leaves the app runnable (`npm run build` clean). Run all commands from repo root `/Users/macbook/sparepart-motor-shop`.

## File Structure

**Create**
- `src/utils/formatDate.js` — ISO → Indonesian date/time string.
- `src/utils/tracking.js` — `contactMatches(order, query)` pure guest-lookup logic.
- `src/data/orders.js` — seed demo orders (3 Budi + 1 guest).
- `src/components/order/OrderSummaryCard.jsx` — light-theme order summary block.
- `src/components/order/OrderTimeline.jsx` — vertical `statusHistory` stepper.
- `src/pages/OrderDetailPage.jsx` — `/pesanan/:id` (guard + compose card/timeline/resi).
- `src/pages/TrackOrderPage.jsx` — `/lacak` guest tracking form.
- `src/pages/AccountPage.jsx` — `/akun` tabbed (profil/alamat/riwayat), login-guarded.

**Modify**
- `src/store/seed.js` — import `ORDERS`, seed them, bump `VERSION` 1 → 2.
- `src/App.jsx` — add `/lacak`, `/akun`, `/pesanan/:id` routes.
- `src/components/layout/Nav.jsx` — add "Lacak Pesanan" (public) + "Akun" (logged-in) links.
- `TODO.md` — mark SP3 done; add demo Order IDs to the run notes.

---

## Task 1: Utilities + seed demo orders

Foundation everything else consumes: date formatting, the guest-lookup matcher, and the demo orders that make history/tracking non-empty.

**Files:**
- Create: `src/utils/formatDate.js`, `src/utils/tracking.js`, `src/data/orders.js`
- Modify: `src/store/seed.js`

**Interfaces:**
- Produces:
  - `formatDate(iso, opts?) → string` — Indonesian locale date+time; `''` for empty/invalid.
  - `contactMatches(order, query) → boolean` — true when trimmed, lowercased `query` equals `order.contact.email` or `order.contact.phone`.
  - `ORDERS` — array of shape-complete seed orders.
  - Demo IDs (stable): `ORD-7K2M9X4A` (Budi, Dalam pengiriman + tracking), `ORD-3F8H1P6C` (Budi, Sedang diproses), `ORD-9Q4D2W7B` (Budi, Selesai + tracking), `ORD-6T1N8K3E` (guest Andi, Sedang diproses; email `andi.pratama@gmail.com`, phone `081377788899`).

- [ ] **Step 1: Create `src/utils/formatDate.js`**

```js
// Format an ISO date string to Indonesian locale, e.g. "3 Agustus 2026, 14.30".
// Returns '' for empty or invalid input so callers can render safely.
export function formatDate(iso, opts = {}) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  })
}
```

- [ ] **Step 2: Create `src/utils/tracking.js`**

```js
// Whether a guest tracking query (email OR phone) matches an order's contact.
// Case-insensitive, trimmed. Returns false for a missing order or empty query.
export function contactMatches(order, query) {
  if (!order) return false
  const q = String(query || '').trim().toLowerCase()
  if (!q) return false
  const email = String(order.contact?.email || '').trim().toLowerCase()
  const phone = String(order.contact?.phone || '').trim().toLowerCase()
  return q === email || q === phone
}
```

- [ ] **Step 3: Create `src/data/orders.js`**

```js
const BUDI_ADDRESS = {
  recipientName: 'Budi Santoso',
  phone: '081234567890',
  line: 'Jl. Merdeka No. 10, RT 02/RW 03',
  city: 'Bandung',
  province: 'Jawa Barat',
  postalCode: '40111',
}

export const ORDERS = [
  {
    id: 'ORD-7K2M9X4A',
    createdAt: '2026-07-28T09:12:00+07:00',
    userId: 'u1',
    contact: { name: 'Budi Santoso', email: 'budi@dmb.com', phone: '081234567890' },
    shippingAddress: BUDI_ADDRESS,
    items: [
      { productId: 'p1', sku: 'NHK-MSN-001', name: 'Kampas Rem Depan NHK', price: 85000, qty: 2 },
      { productId: 'p4', sku: 'SHL-OLI-004', name: 'Oli Mesin Shell Advance 10W-40', price: 65000, qty: 1 },
    ],
    shipping: { courier: 'JNE', service: 'Regular', cost: 15000, etaLabel: '2–3 hari' },
    promo: null,
    subtotal: 235000,
    shippingCost: 15000,
    discount: 0,
    total: 250000,
    paymentStatus: 'paid',
    status: 'Dalam pengiriman',
    statusHistory: [
      { status: 'Menunggu pembayaran', at: '2026-07-28T09:12:00+07:00' },
      { status: 'Sedang diproses', at: '2026-07-28T09:20:00+07:00' },
      { status: 'Siap dikirim', at: '2026-07-29T10:05:00+07:00' },
      { status: 'Dalam pengiriman', at: '2026-07-30T08:40:00+07:00' },
    ],
    tracking: {
      number: 'JNE-8829301X',
      courier: 'JNE',
      history: [
        { status: 'Paket dibuat', at: '2026-07-29T10:05:00+07:00', note: 'Shipment dibuat di gudang Bandung' },
        { status: 'Dalam perjalanan', at: '2026-07-30T08:40:00+07:00', note: 'Berangkat dari Bandung menuju Jakarta' },
        { status: 'Transit', at: '2026-07-31T14:10:00+07:00', note: 'Tiba di hub Jakarta' },
      ],
    },
  },
  {
    id: 'ORD-3F8H1P6C',
    createdAt: '2026-08-01T13:00:00+07:00',
    userId: 'u1',
    contact: { name: 'Budi Santoso', email: 'budi@dmb.com', phone: '081234567890' },
    shippingAddress: BUDI_ADDRESS,
    items: [
      { productId: 'p2', sku: 'GSA-KLS-002', name: 'Aki Kering GS Astra', price: 320000, qty: 1 },
    ],
    shipping: { courier: 'SiCepat', service: 'Regular', cost: 12000, etaLabel: '2–3 hari' },
    promo: { code: 'DMB10', discount: 32000 },
    subtotal: 320000,
    shippingCost: 12000,
    discount: 32000,
    total: 300000,
    paymentStatus: 'paid',
    status: 'Sedang diproses',
    statusHistory: [
      { status: 'Menunggu pembayaran', at: '2026-08-01T13:00:00+07:00' },
      { status: 'Sedang diproses', at: '2026-08-01T13:07:00+07:00' },
    ],
    tracking: null,
  },
  {
    id: 'ORD-9Q4D2W7B',
    createdAt: '2026-07-10T11:00:00+07:00',
    userId: 'u1',
    contact: { name: 'Budi Santoso', email: 'budi@dmb.com', phone: '081234567890' },
    shippingAddress: BUDI_ADDRESS,
    items: [
      { productId: 'p3', sku: 'RCB-BDY-003', name: 'Spion Custom CNC', price: 145000, qty: 1 },
    ],
    shipping: { courier: 'AnterAja', service: 'Regular', cost: 14000, etaLabel: '2–3 hari' },
    promo: null,
    subtotal: 145000,
    shippingCost: 14000,
    discount: 0,
    total: 159000,
    paymentStatus: 'paid',
    status: 'Selesai',
    statusHistory: [
      { status: 'Menunggu pembayaran', at: '2026-07-10T11:00:00+07:00' },
      { status: 'Sedang diproses', at: '2026-07-10T11:05:00+07:00' },
      { status: 'Siap dikirim', at: '2026-07-11T09:30:00+07:00' },
      { status: 'Dalam pengiriman', at: '2026-07-12T08:00:00+07:00' },
      { status: 'Selesai', at: '2026-07-14T16:20:00+07:00' },
    ],
    tracking: {
      number: 'ANT-5567712Y',
      courier: 'AnterAja',
      history: [
        { status: 'Paket dibuat', at: '2026-07-11T09:30:00+07:00', note: 'Shipment dibuat' },
        { status: 'Dalam perjalanan', at: '2026-07-12T08:00:00+07:00', note: 'Paket dalam pengiriman' },
        { status: 'Terkirim', at: '2026-07-14T16:20:00+07:00', note: 'Paket diterima penerima' },
      ],
    },
  },
  {
    id: 'ORD-6T1N8K3E',
    createdAt: '2026-08-02T19:00:00+07:00',
    userId: null,
    contact: { name: 'Andi Pratama', email: 'andi.pratama@gmail.com', phone: '081377788899' },
    shippingAddress: {
      recipientName: 'Andi Pratama',
      phone: '081377788899',
      line: 'Jl. Kenanga No. 22',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12140',
    },
    items: [
      { productId: 'p5', sku: 'IRC-BNV-005', name: 'Ban Tubeless IRC 90/80-14', price: 275000, qty: 1 },
    ],
    shipping: { courier: 'JNE', service: 'Same Day', cost: 35000, etaLabel: 'Hari ini' },
    promo: null,
    subtotal: 275000,
    shippingCost: 35000,
    discount: 0,
    total: 310000,
    paymentStatus: 'paid',
    status: 'Sedang diproses',
    statusHistory: [
      { status: 'Menunggu pembayaran', at: '2026-08-02T19:00:00+07:00' },
      { status: 'Sedang diproses', at: '2026-08-02T19:04:00+07:00' },
    ],
    tracking: null,
  },
]
```

- [ ] **Step 4: Wire seed orders into `src/store/seed.js` and bump VERSION**

In `src/store/seed.js`, add the import alongside the other data imports:

```js
import { ORDERS } from '../data/orders.js'
```

Change the version constant from `1` to `2`:

```js
export const VERSION = 2
```

In `buildSeed()`, replace `orders: [],` with:

```js
    orders: ORDERS,
```

- [ ] **Step 5: Verify pure logic with node**

Run:

```bash
node --input-type=module -e "
import { ORDERS } from './src/data/orders.js';
import { formatDate } from './src/utils/formatDate.js';
import { contactMatches } from './src/utils/tracking.js';
let ok = true;
for (const o of ORDERS) {
  const sum = o.items.reduce((s, it) => s + it.price * it.qty, 0);
  if (sum !== o.subtotal) { console.log('SUBTOTAL MISMATCH', o.id, sum, o.subtotal); ok = false; }
  if (o.subtotal + o.shippingCost - o.discount !== o.total) { console.log('TOTAL MISMATCH', o.id); ok = false; }
  if (o.statusHistory[o.statusHistory.length - 1].status !== o.status) { console.log('STATUS/HISTORY MISMATCH', o.id); ok = false; }
}
const guest = ORDERS.find(o => o.id === 'ORD-6T1N8K3E');
console.log('match email:', contactMatches(guest, 'ANDI.PRATAMA@gmail.com'));
console.log('match phone:', contactMatches(guest, ' 081377788899 '));
console.log('reject:', contactMatches(guest, 'wrong@x.com'));
console.log('formatDate:', formatDate('2026-07-30T08:40:00+07:00'));
console.log('formatDate empty:', JSON.stringify(formatDate('')));
console.log(ok ? 'ALL ORDER INVARIANTS OK' : 'INVARIANTS FAILED');
"
```

Expected: `match email: true`, `match phone: true`, `reject: false`, a non-empty `formatDate:` line, `formatDate empty: ""`, and `ALL ORDER INVARIANTS OK`.

- [ ] **Step 6: Verify the build is clean**

Run: `npm run build`
Expected: build succeeds, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/utils/formatDate.js src/utils/tracking.js src/data/orders.js src/store/seed.js
git commit -m "feat(sp3): seed demo orders + formatDate/contactMatches utils"
```

---

## Task 2: Order detail page + display components

The shared, viewable deliverable: `/pesanan/:id` composing a summary card, a status timeline, and (conditionally) a resi block, behind the access guard. Testable via the existing login page (log in as Budi, open one of his seed orders).

**Files:**
- Create: `src/components/order/OrderSummaryCard.jsx`, `src/components/order/OrderTimeline.jsx`, `src/pages/OrderDetailPage.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `formatDate` (Task 1), `useOrder` (`src/store/hooks.js`), `useAuth().currentUser`, `StatusBadge`, `formatCurrency`, `Nav`, `Footer`, `Button`.
- Produces:
  - `OrderSummaryCard({ order })` — light card: id + date + status badge, items + total, shipping, recipient/address.
  - `OrderTimeline({ history })` — vertical stepper over `statusHistory`; last entry emphasized.
  - `OrderDetailPage` — default export, route element for `/pesanan/:id`.

- [ ] **Step 1: Create `src/components/order/OrderTimeline.jsx`**

```jsx
import { formatDate } from '../../utils/formatDate'

// Vertical stepper over an order's statusHistory (oldest → newest).
// The last entry is the current status and is emphasized.
export default function OrderTimeline({ history = [] }) {
  if (!history.length) return null
  return (
    <ol className="flex flex-col">
      {history.map((entry, i) => {
        const isCurrent = i === history.length - 1
        const isLast = i === history.length - 1
        return (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 size-3 shrink-0 rounded-full ${
                  isCurrent ? 'bg-primary-600' : 'bg-neutral-300'
                }`}
              />
              {!isLast && <span className="w-px flex-1 bg-neutral-200" />}
            </div>
            <div className={isLast ? '' : 'pb-6'}>
              <p className={`text-sm font-medium ${isCurrent ? 'text-neutral-900' : 'text-neutral-700'}`}>
                {entry.status}
              </p>
              <p className="text-xs text-neutral-500">{formatDate(entry.at)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
```

- [ ] **Step 2: Create `src/components/order/OrderSummaryCard.jsx`**

```jsx
import StatusBadge from '../ui/StatusBadge'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

// Read-only light-theme summary of an order. Mirrors the CheckoutSuccessPage
// block but as a normal card for the detail/tracking surface.
export default function OrderSummaryCard({ order }) {
  const address = order.shippingAddress || {}
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-4">
        <div>
          <p className="font-mono text-sm font-medium text-neutral-900">{order.id}</p>
          <p className="text-xs text-neutral-500">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-2 border-b border-neutral-100 p-4">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-neutral-700">
              {item.name} <span className="text-neutral-400">× {item.qty}</span>
            </span>
            <span className="shrink-0 text-neutral-900">{formatCurrency(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-sm font-medium">
          <span className="text-neutral-900">Total</span>
          <span className="text-primary-700">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-b border-neutral-100 p-4 text-sm">
        <p className="font-medium text-neutral-900">Pengiriman</p>
        <p className="text-neutral-600">
          {order.shipping?.courier} · {order.shipping?.service}
        </p>
        {order.shipping?.etaLabel && <p className="text-neutral-400">{order.shipping.etaLabel}</p>}
      </div>

      <div className="flex flex-col gap-1 p-4 text-sm">
        <p className="font-medium text-neutral-900">Penerima</p>
        <p className="text-neutral-600">{order.contact?.name}</p>
        <p className="text-neutral-400">
          {address.recipientName}
          {address.phone ? ` · ${address.phone}` : ''}
        </p>
        <p className="text-neutral-400">
          {[address.line, address.city, address.province, address.postalCode].filter(Boolean).join(', ')}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/pages/OrderDetailPage.jsx`**

```jsx
import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import OrderSummaryCard from '../components/order/OrderSummaryCard'
import OrderTimeline from '../components/order/OrderTimeline'
import { useOrder } from '../store/hooks'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatDate'

export default function OrderDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const order = useOrder(id)

  const isOwner = !!currentUser && order?.userId === currentUser.id
  const isVerifiedGuest = location.state?.verified === true
  const authorized = !!order && (isOwner || isVerifiedGuest)

  useEffect(() => {
    if (!authorized) navigate('/lacak', { replace: true, state: { orderId: id } })
  }, [authorized, id, navigate])

  if (!authorized) return null

  return (
    <div>
      <Nav />
      <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-8 lg:py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-neutral-900 lg:text-2xl">Detail Pesanan</h1>
          <Link to={isOwner ? '/akun?tab=riwayat' : '/lacak'} className="text-sm text-neutral-600">
            ← Kembali
          </Link>
        </div>

        <OrderSummaryCard order={order} />

        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-0 p-4">
          <h2 className="text-sm font-medium text-neutral-900">Riwayat Status</h2>
          <OrderTimeline history={order.statusHistory} />
        </div>

        {order.tracking && (
          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-0 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-neutral-900">Info Pengiriman</h2>
              <span className="font-mono text-sm text-primary-700">{order.tracking.number}</span>
            </div>
            <p className="text-xs text-neutral-500">Kurir: {order.tracking.courier}</p>
            <ol className="flex flex-col">
              {order.tracking.history.map((h, i) => (
                <li key={i} className="border-l border-neutral-200 pb-4 pl-4 last:pb-0">
                  <p className="text-sm text-neutral-800">{h.status}</p>
                  {h.note && <p className="text-xs text-neutral-500">{h.note}</p>}
                  <p className="text-xs text-neutral-400">{formatDate(h.at)}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 4: Add the `/pesanan/:id` route in `src/App.jsx`**

Add the import next to the other page imports:

```jsx
import OrderDetailPage from './pages/OrderDetailPage'
```

Add the route inside `<Routes>` (after the `/checkout/success` route):

```jsx
              <Route path="/pesanan/:id" element={<OrderDetailPage />} />
```

- [ ] **Step 5: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: build succeeds; lint reports only the one pre-existing intentional `password` warning in `AuthContext` (no new errors).

- [ ] **Step 6: Browser smoke test (owner path)**

Run `npm run dev`. In the browser:
1. Go to `/login`, log in as `budi@dmb.com` (any password).
2. Navigate to `/pesanan/ORD-7K2M9X4A`.
Expected: summary card (2 items, total Rp250.000), status badge "Dalam pengiriman", the status timeline (4 entries, last emphasized), and the "Info Pengiriman" resi block with number `JNE-8829301X` and 3 history rows.
3. Navigate to `/pesanan/ORD-3F8H1P6C`.
Expected: same layout, status "Sedang diproses", and NO "Info Pengiriman" block (`tracking` is null).

(Guest verification + the redirect-when-unauthorized path are exercised in Task 3, once `/lacak` exists.)

- [ ] **Step 7: Commit**

```bash
git add src/components/order/OrderSummaryCard.jsx src/components/order/OrderTimeline.jsx src/pages/OrderDetailPage.jsx src/App.jsx
git commit -m "feat(sp3): order detail page with status timeline and resi block"
```

---

## Task 3: Guest tracking page `/lacak` + Nav link

Public tracking form. Completes the guest branch end-to-end, so this task also verifies the Task 2 guard (verified-guest render + unauthorized redirect).

**Files:**
- Create: `src/pages/TrackOrderPage.jsx`
- Modify: `src/App.jsx`, `src/components/layout/Nav.jsx`

**Interfaces:**
- Consumes: `contactMatches` (Task 1), `useStore().orders`, `Nav`, `Footer`, `Button`, `Input`, `FormField`.
- Produces: `TrackOrderPage` — default export, route element for `/lacak`. On a match: `navigate('/pesanan/'+id, { state:{ verified:true } })`.

- [ ] **Step 1: Create `src/pages/TrackOrderPage.jsx`**

```jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import FormField from '../components/ui/FormField'
import { useStore } from '../store/StoreProvider'
import { contactMatches } from '../utils/tracking'

export default function TrackOrderPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { orders } = useStore()
  const [orderId, setOrderId] = useState(location.state?.orderId || '')
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const id = orderId.trim()
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase())
    if (order && contactMatches(order, contact)) {
      navigate(`/pesanan/${order.id}`, { state: { verified: true } })
      return
    }
    setError('Order ID atau email/HP tidak cocok.')
  }

  return (
    <div>
      <Nav />
      <section className="mx-auto flex w-full max-w-[440px] flex-col gap-6 px-4 py-10 lg:py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium text-neutral-900">Lacak Pesanan</h1>
          <p className="text-sm text-neutral-600">
            Masukkan Order ID beserta email atau nomor HP yang Anda gunakan saat checkout.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Order ID" htmlFor="orderId">
            <Input
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ORD-XXXXXXXX"
            />
          </FormField>
          <FormField label="Email atau Nomor HP" htmlFor="contact" error={error}>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email@contoh.com atau 08xxxxxxxxxx"
            />
          </FormField>
          <Button type="submit" variant="primary" className="w-full">
            Lacak Pesanan
          </Button>
        </form>
      </section>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Add the `/lacak` route in `src/App.jsx`**

Add the import:

```jsx
import TrackOrderPage from './pages/TrackOrderPage'
```

Add the route inside `<Routes>`:

```jsx
              <Route path="/lacak" element={<TrackOrderPage />} />
```

- [ ] **Step 3: Add the "Lacak Pesanan" nav link in `src/components/layout/Nav.jsx`**

In the desktop `<nav>` block, add a third link after "Cari Produk":

```jsx
        <Link to="/">Home</Link>
        <Link to="/search">Cari Produk</Link>
        <Link to="/lacak">Lacak Pesanan</Link>
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: build succeeds; only the pre-existing `password` lint warning.

- [ ] **Step 5: Browser smoke test (guest track + guard)**

Run `npm run dev`. In the browser, logged OUT (click Logout if needed):
1. Go to `/lacak`. Enter Order ID `ORD-6T1N8K3E` and contact `andi.pratama@gmail.com` → submit.
   Expected: redirected to `/pesanan/ORD-6T1N8K3E`, detail renders (status "Sedang diproses", no resi block).
2. Go back to `/lacak`. Enter `ORD-6T1N8K3E` and a wrong contact `salah@x.com` → submit.
   Expected: inline error "Order ID atau email/HP tidak cocok."; no navigation.
3. Directly visit `/pesanan/ORD-7K2M9X4A` while logged out.
   Expected: redirected to `/lacak` (Budi's order is not yours and no verification) with the Order ID prefilled.

- [ ] **Step 6: Commit**

```bash
git add src/pages/TrackOrderPage.jsx src/App.jsx src/components/layout/Nav.jsx
git commit -m "feat(sp3): guest order tracking page and nav link"
```

---

## Task 4: Account page `/akun` (Profil / Alamat / Riwayat) + Nav link

Login-guarded account page with three read-only tabs driven by the `tab` search param.

**Files:**
- Create: `src/pages/AccountPage.jsx`
- Modify: `src/App.jsx`, `src/components/layout/Nav.jsx`

**Interfaces:**
- Consumes: `useAuth().currentUser`, `useOrders` (`src/store/hooks.js`), `formatCurrency`, `formatDate` (Task 1), `StatusBadge`, `EmptyState`, `Nav`, `Footer`.
- Produces: `AccountPage` — default export, route element for `/akun`. Redirects to `/login` when logged out.

- [ ] **Step 1: Create `src/pages/AccountPage.jsx`**

```jsx
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../store/hooks'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

const TABS = [
  { key: 'profil', label: 'Profil' },
  { key: 'alamat', label: 'Alamat' },
  { key: 'riwayat', label: 'Riwayat' },
]

export default function AccountPage() {
  const { currentUser } = useAuth()
  const orders = useOrders()
  const [searchParams, setSearchParams] = useSearchParams()

  if (!currentUser) return <Navigate to="/login" replace />

  const requested = searchParams.get('tab')
  const tab = TABS.some((t) => t.key === requested) ? requested : 'profil'
  const myOrders = orders.filter((o) => o.userId === currentUser.id)

  return (
    <div>
      <Nav />
      <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-8 lg:py-12">
        <h1 className="text-2xl font-medium text-neutral-900">Akun Saya</h1>

        <div className="flex gap-2 border-b border-neutral-100">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSearchParams({ tab: t.key })}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-primary-600 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profil' && <ProfileTab user={currentUser} />}
        {tab === 'alamat' && <AddressTab user={currentUser} />}
        {tab === 'riwayat' && <HistoryTab orders={myOrders} />}
      </section>
      <Footer />
    </div>
  )
}

function ProfileTab({ user }) {
  const rows = [
    { label: 'Nama', value: user.name },
    { label: 'Email', value: user.email || '—' },
    { label: 'Nomor HP', value: user.phone || '—' },
    { label: 'Metode masuk', value: user.provider === 'google' ? 'Google' : 'Email & password' },
  ]
  return (
    <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-neutral-0">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4 p-4 text-sm">
          <span className="text-neutral-500">{r.label}</span>
          <span className="text-right text-neutral-900">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

function AddressTab({ user }) {
  if (!user.addresses.length) {
    return (
      <EmptyState
        title="Belum ada alamat"
        description="Alamat tersimpan akan muncul di sini setelah Anda menyimpannya saat checkout."
      />
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {user.addresses.map((a) => (
        <div key={a.id} className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-neutral-0 p-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900">{a.recipientName}</span>
            {a.id === user.defaultAddressId && (
              <span className="rounded-pill bg-primary-100 px-2 py-0.5 text-xs text-primary-800">Default</span>
            )}
          </div>
          <p className="text-neutral-500">{a.phone}</p>
          <p className="text-neutral-500">
            {[a.line, a.city, a.province, a.postalCode].filter(Boolean).join(', ')}
          </p>
        </div>
      ))}
    </div>
  )
}

function HistoryTab({ orders }) {
  if (!orders.length) {
    return (
      <EmptyState
        title="Belum ada pesanan"
        description="Pesanan Anda akan muncul di sini setelah Anda menyelesaikan checkout."
      />
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {orders.map((o) => (
        <Link
          key={o.id}
          to={`/pesanan/${o.id}`}
          className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-0 p-4 transition-colors hover:border-primary-300"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-sm font-medium text-neutral-900">{o.id}</span>
            <StatusBadge status={o.status} />
          </div>
          <p className="text-xs text-neutral-500">{formatDate(o.createdAt)}</p>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-neutral-600">
              {o.items[0]?.name}
              {o.items.length > 1 ? ` +${o.items.length - 1} lainnya` : ''}
            </span>
            <span className="font-medium text-neutral-900">{formatCurrency(o.total)}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add the `/akun` route in `src/App.jsx`**

Add the import:

```jsx
import AccountPage from './pages/AccountPage'
```

Add the route inside `<Routes>`:

```jsx
              <Route path="/akun" element={<AccountPage />} />
```

- [ ] **Step 3: Add the "Akun" nav link in `src/components/layout/Nav.jsx`**

Replace the logged-in branch so "Akun" appears next to Logout. The current block is:

```jsx
        {isLoggedIn ? (
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="text-sm text-neutral-600"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="text-sm text-neutral-600">
            Login
          </Link>
        )}
```

Change it to:

```jsx
        {isLoggedIn ? (
          <>
            <Link to="/akun" className="text-sm text-neutral-600">
              Akun
            </Link>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="text-sm text-neutral-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sm text-neutral-600">
            Login
          </Link>
        )}
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: build succeeds; only the pre-existing `password` lint warning.

- [ ] **Step 5: Browser smoke test (account)**

Run `npm run dev`. In the browser:
1. Log in as `budi@dmb.com`. Click "Akun" in the nav → `/akun`.
   Expected: **Profil** tab shows Nama "Budi Santoso", email, phone, "Email & password".
2. Click **Alamat** tab (URL becomes `/akun?tab=alamat`).
   Expected: one address card with a "Default" badge.
3. Click **Riwayat** tab.
   Expected: 3 order cards (newest first: `ORD-3F8H1P6C`, then `ORD-7K2M9X4A`, then `ORD-9Q4D2W7B`), each with status badge + total. Click one → `/pesanan/:id` detail. The guest order `ORD-6T1N8K3E` does NOT appear.
4. Log out, then visit `/akun` directly.
   Expected: redirected to `/login`.
5. Log in as `sari@dmb.com`. Open `/akun` → Alamat and Riwayat tabs.
   Expected: both show their empty states.

- [ ] **Step 6: Commit**

```bash
git add src/pages/AccountPage.jsx src/App.jsx src/components/layout/Nav.jsx
git commit -m "feat(sp3): customer account page with profil/alamat/riwayat tabs"
```

---

## Task 5: Docs update + full SP3 verification

Close out SP3: update `TODO.md` and run the whole definition-of-done in one pass.

**Files:**
- Modify: `TODO.md`

- [ ] **Step 1: Update `TODO.md`**

In the "Progres" section, add an SP3 line after the SP2 entry:

```markdown
- [x] **SP3 — Lacak pesanan & profil/riwayat customer** — halaman **Lacak
  Pesanan** (tamu: Order ID + email/HP), **/akun** (tab Profil/Alamat/Riwayat
  read-only), **/pesanan/:id** (detail + timeline `statusHistory` + blok resi
  `tracking`) dengan gate akses pemilik/tamu-terverifikasi. Seed order demo
  ditambah. Terverifikasi end-to-end di browser.
```

In "Sisa sub-proyek (urut)", delete the entire `### SP3 — Lacak pesanan & profil/riwayat customer` block (its work is done).

In the "Menjalankan" section, append a demo-orders line after the existing demo accounts line:

```markdown
Order demo: login `budi@dmb.com` lalu buka **Akun → Riwayat** (3 order). Lacak
pesanan tamu: Order ID `ORD-6T1N8K3E` + email `andi.pratama@gmail.com` (atau HP
`081377788899`).
```

- [ ] **Step 2: Full definition-of-done verification**

Run: `npm run lint && npm run build`
Expected: build clean; lint reports only the pre-existing intentional `password` warning.

Then run `npm run dev` and confirm the whole SP3 flow in the browser:
- Login `budi@dmb.com` → `/akun`: Profil + Alamat render; Riwayat lists 3 orders; click → `/pesanan/:id` shows summary + timeline; `ORD-7K2M9X4A` shows the resi block.
- Logged out `/lacak`: `ORD-6T1N8K3E` + `andi.pratama@gmail.com` → detail renders; wrong contact → inline error.
- Logged out, direct `/pesanan/ORD-7K2M9X4A` → redirect to `/lacak`.
- Logged out `/akun` → redirect to `/login`.
- `sari@dmb.com` → Alamat + Riwayat empty states.

- [ ] **Step 3: Commit**

```bash
git add TODO.md
git commit -m "docs(sp3): mark SP3 done and add demo order lookup to run notes"
```

---

## Self-Review Notes

- **Spec coverage:** `/lacak` (Task 3), `/akun` read-only tabs (Task 4), `/pesanan/:id` detail+timeline+resi (Task 2), Pilihan-A access guard (Task 2, exercised Task 3), Nav links (Tasks 3–4), seed demo orders + VERSION bump (Task 1), demo-ID docs (Task 5). All spec sections mapped.
- **No profile/address editing, no new store mutations, no new deps** — honored (all pages read-only).
- **Status strings** used in seed orders are all within the six-value enum.
- **Type consistency:** `formatDate(iso)`, `contactMatches(order, query)`, `OrderSummaryCard({order})`, `OrderTimeline({history})` are defined in Task 1/2 and consumed with the same signatures in Tasks 2–4.
