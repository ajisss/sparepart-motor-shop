# SP2B — Checkout Wizard + Payment Simulation + Success Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute AFTER SP2A (browsing) is complete — this plan depends on the primitives it added.

**Goal:** Build the PRD checkout flow — a 4-step wizard (Identitas → Alamat → Pengiriman → Ringkasan) with the guest/login decision AT checkout, courier→service selection, promo codes, a Midtrans-Snap-style payment simulation with three outcomes, and a success page reading the real created order.

**Architecture:** `CheckoutPage` owns the wizard state and orchestrates step components; steps are controlled (parent holds the canonical data). Payment is a simulated Snap `Modal`. On a successful/pending payment the SP1 store's `createOrder` persists a snapshot order; the success page reads it via `useOrder`. Evolve the existing checkout code (`CheckoutPage`, `ShippingStep`, `DeliveryStep`, `ReviewStep`) into the new flow. No new dependencies.

**Tech Stack:** React 19, Vite 8, React Router 7, Tailwind 3, SP1 store.

## Global Constraints

- Front-end-only POC prototype for showcase — payment/shipping are simulated, not integrated. Favor a convincing demo over backend correctness. YAGNI.
- **No new dependencies. No test framework**: pure-logic file `src/utils/checkout.js` is verified with `node`; UI is verified with `npm run build` + `npm run lint` + a controller browser smoke test.
- Uses the SP1 store and the SP2A primitives: `useProducts`, `useShipping`, `usePromos`, `useAuth`, `useCart`, `useOrder`, and `useStore()` mutations `createOrder`, `setDefaultAddress`; components `Modal`, `RadioCard`, `FormField`, `Input`, `Select`, `StatusBadge`, `Button`.
- **Order `status` is exactly one of** `'Menunggu pembayaran'`, `'Sedang diproses'`, `'Siap dikirim'`, `'Dalam pengiriman'`, `'Selesai'`, `'Refund diproses'`. This plan only sets `'Sedang diproses'` (paid) and `'Menunggu pembayaran'` (pending).
- **Order shape produced by `createOrder(orderInput)`** (SP1 assigns `id`/`createdAt`/`statusHistory`); this plan provides:
  `{ userId, contact:{name,email,phone}, shippingAddress:{recipientName,phone,line,city,province,postalCode}, items:[{productId,sku,name,price,qty}], shipping:{courier,service,cost,etaLabel}, promo:{code,discount}|null, subtotal, shippingCost, discount, total, paymentStatus, status }`.
- `items` are SNAPSHOTTED from the cart joined against store products (not references).
- Do NOT use native `alert`/`confirm`/`prompt` — use the `Modal` primitive.
- Currency via `src/utils/formatCurrency.js`. Copy in Indonesian.
- Each task leaves the app runnable (`npm run build` clean). Run commands from repo root `/Users/macbook/sparepart-motor-shop`.

## File Structure

- `src/utils/checkout.js` — **create** (Task 8): promo/total pure logic.
- `src/components/checkout/OrderSummary.jsx`, `src/components/checkout/PromoInput.jsx` — **create** (Task 8).
- `src/components/checkout/Stepper.jsx` — **create** (Task 9): extracted from `CheckoutPage`.
- `src/pages/checkout/IdentityStep.jsx` — **create** (Task 9).
- `src/pages/CheckoutPage.jsx` — **modify** (Task 9): new orchestration.
- `src/pages/checkout/ShippingStep.jsx` — **modify** (Task 9) → the "Alamat" step.
- `src/pages/checkout/DeliveryStep.jsx` — **modify** (Task 9) → the "Pengiriman" step.
- `src/pages/checkout/ReviewStep.jsx` — **modify** (Task 9) → the "Ringkasan" step.
- `src/pages/checkout/PaymentStep.jsx` — **remove** from the flow (Task 9); payment becomes a modal.
- `src/components/checkout/PaymentModal.jsx` — **create** (Task 10).
- `src/pages/CheckoutSuccessPage.jsx` — **modify** (Task 11).

---

## Task 8: Checkout logic util + OrderSummary + PromoInput

**Files:**
- Create: `src/utils/checkout.js`, `src/components/checkout/OrderSummary.jsx`, `src/components/checkout/PromoInput.jsx`

**Interfaces:**
- Produces:
  - `applyPromo(subtotal, promo) → number` — discount amount, 0 if ineligible/null.
  - `validatePromo(code, promos, subtotal) → { promo, discount } | { error }`.
  - `computeTotals({ subtotal, shippingCost, discount }) → { total }`.
  - `OrderSummary({ subtotal, shippingCost, discount, total })`.
  - `PromoInput({ applied, onApply, onRemove, error })` — `onApply(code)` called with the raw code string.

- [ ] **Step 1: Create `src/utils/checkout.js`**

```js
// Discount amount (Rupiah) for a subtotal + promo, or 0 if ineligible.
export function applyPromo(subtotal, promo) {
  if (!promo || !promo.active) return 0
  if (subtotal < (promo.minSpend || 0)) return 0
  if (promo.type === 'percent') return Math.round((subtotal * promo.value) / 100)
  if (promo.type === 'fixed') return Math.min(promo.value, subtotal)
  return 0
}

// Validate a code against the promo list for a subtotal.
// Returns { promo, discount } on success or { error } on failure.
export function validatePromo(code, promos, subtotal) {
  const normalized = String(code || '').trim().toUpperCase()
  if (!normalized) return { error: 'Masukkan kode promo.' }
  const promo = promos.find((p) => p.code.toUpperCase() === normalized)
  if (!promo || !promo.active) return { error: 'Kode promo tidak valid.' }
  if (subtotal < (promo.minSpend || 0)) {
    return { error: `Minimum belanja Rp ${(promo.minSpend || 0).toLocaleString('id-ID')} untuk kode ini.` }
  }
  return { promo, discount: applyPromo(subtotal, promo) }
}

// Final total (never negative).
export function computeTotals({ subtotal, shippingCost = 0, discount = 0 }) {
  return { total: Math.max(0, subtotal + shippingCost - discount) }
}
```

- [ ] **Step 2: Verify the util in node**

Run:
```bash
node --input-type=module -e "
import { applyPromo, validatePromo, computeTotals } from './src/utils/checkout.js';
const promos = [
  { code: 'DMB10', type: 'percent', value: 10, minSpend: 100000, active: true },
  { code: 'ONGKIR', type: 'fixed', value: 15000, minSpend: 0, active: true },
  { code: 'OFF', type: 'fixed', value: 5000, minSpend: 0, active: false },
];
console.assert(applyPromo(200000, promos[0]) === 20000, 'percent');
console.assert(applyPromo(50000, promos[0]) === 0, 'below minSpend');
console.assert(applyPromo(10000, { type:'fixed', value:15000, active:true }) === 10000, 'fixed capped at subtotal');
console.assert(validatePromo('dmb10', promos, 200000).discount === 20000, 'validate ok case-insensitive');
console.assert(validatePromo('DMB10', promos, 50000).error, 'validate minSpend error');
console.assert(validatePromo('NOPE', promos, 100000).error, 'unknown code error');
console.assert(validatePromo('OFF', promos, 100000).error, 'inactive code error');
console.assert(computeTotals({ subtotal: 100000, shippingCost: 15000, discount: 20000 }).total === 95000, 'total');
console.assert(computeTotals({ subtotal: 10000, shippingCost: 0, discount: 50000 }).total === 0, 'total non-negative');
console.log('OK checkout util');
"
```
Expected: prints `OK checkout util` with no assertion errors.

- [ ] **Step 3: Create `src/components/checkout/OrderSummary.jsx`**

```jsx
import { formatCurrency } from '../../utils/formatCurrency'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-neutral-600">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  )
}

export default function OrderSummary({ subtotal, shippingCost = 0, discount = 0, total }) {
  return (
    <div className="flex flex-col gap-2">
      <Row label="Subtotal" value={subtotal} />
      {shippingCost > 0 && <Row label="Ongkos kirim" value={shippingCost} />}
      {discount > 0 && (
        <div className="flex items-center justify-between text-success">
          <span>Diskon promo</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="font-medium text-neutral-900">Total</span>
        <span className="text-lg font-medium text-neutral-900">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/checkout/PromoInput.jsx`**

```jsx
import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function PromoInput({ applied, onApply, onRemove, error }) {
  const [code, setCode] = useState('')

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-md bg-primary-25 px-4 py-3">
        <span className="text-sm font-medium text-primary-700">Kode {applied.code} diterapkan</span>
        <button type="button" onClick={onRemove} className="text-sm text-neutral-600 underline">
          Hapus
        </button>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kode promo"
          className="flex-1"
          error={!!error}
        />
        <Button type="button" variant="secondary" onClick={() => onApply(code)}>
          Pakai
        </Button>
      </div>
      {error && <span className="text-sm text-error">{error}</span>}
    </div>
  )
}
```

- [ ] **Step 5: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -3`
Expected: build succeeds, lint clean.

- [ ] **Step 6: Commit**

```bash
git add src/utils/checkout.js src/components/checkout/OrderSummary.jsx src/components/checkout/PromoInput.jsx
git commit -m "feat(sp2): checkout promo/total util, OrderSummary, PromoInput"
```

---

## Task 9: Checkout wizard — orchestration + 4 steps

**Files:**
- Create: `src/components/checkout/Stepper.jsx`, `src/pages/checkout/IdentityStep.jsx`
- Modify: `src/pages/CheckoutPage.jsx`, `src/pages/checkout/ShippingStep.jsx` (→ Alamat), `src/pages/checkout/DeliveryStep.jsx` (→ Pengiriman), `src/pages/checkout/ReviewStep.jsx` (→ Ringkasan)

**Interfaces:**
- `Stepper({ steps, currentIndex })` — `steps: {id,label}[]`; highlights up to `currentIndex`.
- Step components are controlled: each receives `data`, `onChange(patch)`, `onNext`, `onBack` as needed (see below).

**Read first:** `sed -n '1,400p' src/pages/CheckoutPage.jsx src/pages/checkout/ShippingStep.jsx src/pages/checkout/DeliveryStep.jsx src/pages/checkout/ReviewStep.jsx` — preserve the existing card/aside layout, the inline `Stepper` markup (extract it), and the empty-cart redirect guard.

**CheckoutPage (new orchestration):**
- `STEPS = [{id:'identitas',label:'Identitas'}, {id:'alamat',label:'Alamat'}, {id:'pengiriman',label:'Pengiriman'}, {id:'ringkasan',label:'Ringkasan'}]`.
- State `data`:
  ```js
  {
    mode: null,            // 'guest' | 'account'
    contact: { name: '', phone: '', email: '' },
    address: { recipientName: '', phone: '', line: '', city: '', province: '', postalCode: '' },
    shipping: null,        // { courier, service, cost, etaLabel }
    promo: null,           // { code, discount } | null
  }
  ```
- `useAuth()`: if `isLoggedIn` on mount, set `mode:'account'` and start on `'alamat'` (skip Identitas); prefill `contact` from `currentUser` and, if `currentUser.defaultAddressId`, prefill `address` from that default address. If not logged in, start on `'identitas'`.
- `step` state (id) + `stepIndex` from STEPS; `goNext`/`goBack` clamp. Render `<Stepper steps={STEPS} currentIndex={stepIndex} />` + the current step component.
- Keep the empty-cart guard (redirect to `/cart`, ignoring the `clearCart` that happens on successful pay — reuse the existing `useRef` pattern).
- Right `<aside>`: live `OrderSummary` using `useCart().subtotal`, `data.shipping?.cost || 0`, `data.promo?.discount || 0`, and `computeTotals(...)`.
- A `handlePlaceOrder(paymentStatus, status)` helper builds the order input (snapshot items by joining `useCart().items` with `useProducts()`; contact/address from `data`; `userId = currentUser?.id ?? null`), calls `createOrder(input)`, then `clearCart()`, then `navigate('/checkout/success', { state: { orderId: order.id } })`. In THIS task, the Ringkasan step's "Bayar" button calls `handlePlaceOrder('paid', 'Sedang diproses')` directly (the Snap modal is added in Task 10).

**IdentityStep (`src/pages/checkout/IdentityStep.jsx`)** — props `{ onChooseGuest, onLoggedIn }`:
- Two `RadioCard`s: *Lanjut sebagai tamu* (→ `onChooseGuest()` sets `mode:'guest'`, advances to Alamat) and *Masuk ke akun*.
- Selecting *Masuk ke akun* reveals an inline email/password form (`FormField`+`Input`) with a "Masuk" `Button` (calls `useAuth().login(email, password)`; on `{ok:false}` show the error) and a **Google SSO** `Button` (`useAuth().loginWithGoogle()`). On successful login call `onLoggedIn()` (parent sets `mode:'account'`, prefills contact/address from the user, advances to Alamat).

**ShippingStep → Alamat** — props `{ data, onChange, onNext, onBack, mode }` (+ store access for `setDefaultAddress`, `useAuth` for the current user):
- If `mode === 'guest'`: contact fields (name, phone, email) + a manual address form (recipientName, phone, line, city, province, postalCode). Writes into `data.contact` and `data.address` via `onChange`.
- If `mode === 'account'` and the user has a default address: show it (read-only card, selected) with an "Ubah/Tambah alamat" toggle to a form; contact prefilled from the user.
- If `mode === 'account'` and NO default address: show the address form; on continue, call `setDefaultAddress(currentUser.id, address)` so it becomes the profile default (address needs an `id` — generate one, e.g. `'a-' + Date.now()`).
- Required-field validation with inline `FormField` errors; `onNext` gated until valid.

**DeliveryStep → Pengiriman** — props `{ data, onChange, onNext, onBack }` + `useShipping()`:
- Replace the hardcoded `DELIVERY_OPTIONS` with `useShipping().couriers`. First choose a courier (`RadioCard` per courier), then its services (`RadioCard` per `courier.services`) showing `name`, `etaLabel`, and `formatCurrency(cost)` on the right.
- On selecting a service, `onChange({ shipping: { courier: courierName, service: serviceName, cost, etaLabel } })`.
- `onNext` gated until a service is chosen. Remove the exported `DELIVERY_OPTIONS` (and update any importer — `ReviewStep`/`CheckoutPage`).

**ReviewStep → Ringkasan** — props `{ data, onBack, onPay }` + `useCart()`, `useProducts()`, `usePromos()`:
- Read-only summary: recipient (contact + address), shipping (courier/service/eta), and the product rows (join cart items with store products; show name, qty, line total).
- `PromoInput`: on apply, call `validatePromo(code, promos, subtotal)`; on success `onChange`-equivalent to set `data.promo = { code, discount }` and clear error; on failure show the error. On remove, clear `data.promo`. (Pass promo state up via an `onChange` prop, or lift promo handling into CheckoutPage and pass `applied`/`onApply`/`onRemove`/`error` down — either is fine; keep `data.promo` the source of truth.)
- `OrderSummary` with subtotal / shipping cost / discount / total (`computeTotals`).
- A **Bayar** `Button` → `onPay()` (in this task, `onPay` = `handlePlaceOrder('paid','Sedang diproses')`).
- Remove `PaymentStep` from the flow (no longer imported by `CheckoutPage`); the file may remain on disk unused or be deleted — if deleted, ensure nothing imports it.

- [ ] **Step 1: Read the current checkout files** (command above).

- [ ] **Step 2: Create `Stepper` and `IdentityStep`; rewrite `CheckoutPage` orchestration** per the spec above.

- [ ] **Step 3: Reshape `ShippingStep` (Alamat), `DeliveryStep` (Pengiriman), `ReviewStep` (Ringkasan)** per the spec above; remove `PaymentStep` from the flow and drop the `DELIVERY_OPTIONS`/`PAYMENT_OPTIONS` exports and their importers.

- [ ] **Step 4: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -6`
Expected: build succeeds; lint clean (no unused imports of removed `DELIVERY_OPTIONS`/`PAYMENT_OPTIONS`/`PaymentStep`).

- [ ] **Step 5: Commit**

```bash
git add src/pages/CheckoutPage.jsx src/components/checkout/Stepper.jsx src/pages/checkout/IdentityStep.jsx src/pages/checkout/ShippingStep.jsx src/pages/checkout/DeliveryStep.jsx src/pages/checkout/ReviewStep.jsx
git commit -m "feat(sp2): checkout wizard — identity/address/shipping/review flow with store data"
```

*(Controller runs a browser smoke test after review: guest and logged-in paths, courier→service, promo, and a direct pay landing on success.)*

---

## Task 10: Midtrans Snap payment simulation modal

**Files:**
- Create: `src/components/checkout/PaymentModal.jsx`
- Modify: `src/pages/CheckoutPage.jsx` (route "Bayar" through the modal)

**Interfaces:**
- `PaymentModal({ open, total, onClose, onResult })` — `onResult('paid' | 'pending' | 'failed')`.

**Behavior:**
- Uses the `Modal` primitive, styled to resemble Midtrans Snap: header "Pembayaran" (with a small "Simulasi" tag), the `total` prominently (via `formatCurrency`), a short visual-only list of dummy methods (VA BCA, GoPay, QRIS) as `RadioCard`s (one selected by default), and a **Bayar Sekarang** `Button`.
- A small demo control (a `Select` or 3 buttons) lets the presenter pick the simulated outcome: **Berhasil / Pending / Gagal** (default Berhasil). "Bayar Sekarang" calls `onResult(<chosen>)`.
- CheckoutPage wiring: the Ringkasan "Bayar" now opens `PaymentModal` (`open` state) instead of paying directly. `onResult`:
  - `'paid'` → `handlePlaceOrder('paid', 'Sedang diproses')`.
  - `'pending'` → `handlePlaceOrder('pending', 'Menunggu pembayaran')`.
  - `'failed'` → close nothing / show an inline error in the modal ("Pembayaran gagal, coba lagi."), keep the modal open, create NO order.
- `handlePlaceOrder` closes the modal, creates the order, clears the cart, and navigates to success (as in Task 9).

- [ ] **Step 1: Create `src/components/checkout/PaymentModal.jsx`** per the spec.

- [ ] **Step 2: Wire CheckoutPage** — replace the direct-pay `onPay` with opening `PaymentModal`; implement the three `onResult` branches.

- [ ] **Step 3: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -3`
Expected: build succeeds, lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/checkout/PaymentModal.jsx src/pages/CheckoutPage.jsx
git commit -m "feat(sp2): Midtrans Snap payment simulation modal with 3 outcomes"
```

*(Controller browser smoke: berhasil → order 'Sedang diproses' + success page; pending → 'Menunggu pembayaran'; gagal → stays, no order created.)*

---

## Task 11: Success page — read the real order

**Files:**
- Modify: `src/pages/CheckoutSuccessPage.jsx`

**Interfaces:**
- Consumes: `useLocation` (router state `{ orderId }`), `useOrder(orderId)`, `useAuth()`; existing `Nav`, `Footer`, `Button`; new `StatusBadge`; `formatCurrency`.

**Behavior / acceptance:** Read the current file first, keep the centered success-card styling, then:
- Get `orderId` from `location.state?.orderId` (fallback: `?order=` search param). Look up the order with `useOrder(orderId)`. If none found, render an `EmptyState`/redirect to `/`.
- Show: a success (or pending) headline, the **Order ID**, the item list with quantities and line totals, the **total** (`formatCurrency(order.total)`), the **shipping** type (`order.shipping.courier` + `order.shipping.service`, eta), the **recipient** (`order.contact.name`, `order.shippingAddress`), and a `<StatusBadge status={order.status} />`.
- Hint block: if `order.userId` is null (guest) → "Simpan Order ID Anda untuk melacak pesanan dengan Order ID + email/nomor HP di halaman Lacak Pesanan." (the Lacak page is SP3 — just the hint here). If logged in → "Pesanan ini akan muncul di profil Anda." (profil is SP3).
- Actions: "Lanjut belanja" (`/search`) and "Kembali ke beranda" (`/`).

- [ ] **Step 1: Read the current file**

Run: `sed -n '1,200p' src/pages/CheckoutSuccessPage.jsx`

- [ ] **Step 2: Reshape CheckoutSuccessPage per the Behavior/acceptance above.**

- [ ] **Step 3: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -3`
Expected: build succeeds, lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CheckoutSuccessPage.jsx
git commit -m "feat(sp2): success page reads real order with status badge and details"
```

---

## Self-Review

**Spec coverage (SP2 spec §checkout wizard, §payment simulation, §success, §data/utilities):**
- Checkout logic util (validatePromo/applyPromo/computeTotals) → Task 8 (with node tests). ✓
- OrderSummary, PromoInput → Task 8. ✓
- Wizard: identity-at-checkout (guest/login+SSO), address (default/add/guest), shipping (courier→service from store), review+promo → Task 9. ✓
- Logged-in skip of Identitas + address prefill + no-default→setDefaultAddress → Task 9. ✓
- Snap modal with berhasil/pending/gagal + createOrder branches → Task 10. ✓
- Success page from real order (Order ID, items, total, shipping, address, StatusBadge, guest/user hints) → Task 11. ✓
- Order snapshot shape + statuses verbatim → Global Constraints + Tasks 9–10. ✓

**Placeholder scan:** `checkout.js`, `OrderSummary`, `PromoInput`, `PaymentModal` interface carry complete code; the wizard task gives per-file Behavior specs + a "read current file" step (intentional for reshaping existing UI verified in-browser). No TBD/TODO. ✓

**Type consistency:** `data` shape (`mode/contact/address/shipping/promo`) is defined once in Task 9 and consumed by its steps + Task 10. `handlePlaceOrder(paymentStatus, status)` signature is consistent across Tasks 9–10. `createOrder` input matches the SP1 Order entity and the Global Constraints block. `PaymentModal` `onResult('paid'|'pending'|'failed')` maps to the two statuses + no-op. Promo `{code,discount}` shape consistent between `validatePromo`, `data.promo`, and the order. ✓

**Cross-plan dependency:** requires SP2A primitives (`Modal`, `RadioCard`, `FormField`, `Input`, `Select`, `StatusBadge`) and store-migrated pages. Execute SP2A first.

**Note on Task 9 size:** it is the largest task (orchestration + 4 steps). If an implementer reports it too large, split by step (Identity+orchestration; Alamat; Pengiriman; Ringkasan) — each keeps the build green because the orchestration renders all four from the start.
