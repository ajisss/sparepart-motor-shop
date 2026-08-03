# SP3 — Order Tracking & Customer Account (DMB Moto Shop)

Date: 2026-08-03
Status: Approved design, ready for implementation plan

## Context

Third sub-project of the DMB Moto Shop POC (React 19 + Vite + Tailwind + React
Router, front-end-only, all state simulated in localStorage via `StoreProvider`).
SP1 built the domain/data foundation; SP2 built the customer storefront and
checkout through the Midtrans-Snap-simulated success page. SP3 adds the
**post-purchase customer surface**: guest order tracking, a logged-in customer
account (read-only profile, saved addresses, order history), and a shared order
detail view with a status timeline and shipment/resi info.

PRD reference: `~/DMB POS/figma-cli/prd.md` (§5.5 tracking, §6 the six customer
statuses). All required data already exists from SP1 — orders carry `contact`,
`shippingAddress`, `items`, `shipping`, `status`, `statusHistory`, and
`tracking` (default `null`). SP3 is almost entirely new **read-only pages over
the existing store**; it adds no new store mutations and no new dependencies.

## Goals

- Guests can look up an order via **Order ID + email/HP** and see its status.
- Logged-in customers get an **Account** page: read-only profile, saved
  addresses, and order history.
- A single **order detail** view (status badge + `statusHistory` timeline +
  resi block when `tracking` is present), reused by both tracking and history.
- Seed a handful of demo orders so the tracking/history/timeline/resi UI is
  actually demonstrable.

## Non-goals

- **No profile/address editing.** Profile and addresses are display-only in SP3.
  (Address management already happens in checkout; full CRUD is out of scope.)
- No new store mutations, no new dependencies.
- No admin-side order handling (that is SP6) — SP3 only *reads* order state.
- No real auth/verification beyond matching seed data client-side.

## Routes & navigation

| Route | Access | Contents |
|---|---|---|
| `/lacak` | Public | Guest tracking form: Order ID + email/HP |
| `/akun?tab=profil\|alamat\|riwayat` | Login-only (redirect to `/login` if not) | Three tabs: Profile (read-only), Saved addresses, Order history |
| `/pesanan/:id` | Guarded (see below) | Order detail: summary card + status timeline + resi block |

Tab selection on `/akun` is driven by the `tab` search param (default `profil`)
via `useSearchParams`, so tabs are deep-linkable and back-button friendly.

**Nav changes (`Nav.jsx`):**
- Add a public **"Lacak Pesanan"** link in the nav row (next to Home / Cari
  Produk).
- Right-hand cluster: when logged in, show **"Akun"** (→ `/akun`) alongside
  **"Logout"**; when logged out, keep **"Login"**.

## Access control for `/pesanan/:id` (the "Pilihan A" model)

The detail page renders only when one of these holds:

- **Owner:** a user is logged in **and** `order.userId === currentUser.id`
  (reached from the history tab).
- **Verified guest:** the page was navigated to from `/lacak` with
  `location.state.verified === true` (set only after an Order ID + email/HP
  match).

Otherwise → `navigate('/lacak', { state: { orderId } })` (redirect, with the id
prefilled). Because verification lives in navigation `state`, a browser refresh
drops it and an unverified guest is sent back to `/lacak` to re-verify — this is
intentional and matches the PRD narrative. A missing/unknown order id → the
same redirect (no "order exists" leak).

## `/lacak` verification logic

Form fields: **Order ID** and a single **email/HP** input. On submit:

1. Find the order by `id`.
2. Match succeeds when the input (trimmed) equals, case-insensitively,
   `order.contact.email` **or** `order.contact.phone`.
3. Success → `navigate('/pesanan/' + id, { state: { verified: true } })`.
4. Failure (no order, or contact mismatch) → inline error
   *"Order ID atau email/HP tidak cocok."* — deliberately not revealing whether
   the id exists.

Note (SP2 tech debt): dummy Google users have empty `phone`/`email`, so their
*guest-style* lookups would be unmatchable — but logged-in users view orders via
`/akun`, and seeded guest orders carry a real contact, so this does not affect
the demo.

## Order detail view — shared components

- **`OrderSummaryCard`** (light theme): Order ID, created date, `StatusBadge`,
  item snapshot list + total, shipping (`courier · service · etaLabel`),
  recipient + address. Visual pattern mirrors `CheckoutSuccessPage`'s order
  block but as a normal light card. `CheckoutSuccessPage` is left as-is (not
  refactored) to limit blast radius.
- **`OrderTimeline`**: renders `order.statusHistory` as a vertical stepper
  (status label + formatted date/time via a new `formatDate` util), with the
  latest/current status emphasized.
- **Resi block**: rendered **only when `order.tracking != null`** — shows
  `tracking.number`, `tracking.courier`, and the `tracking.history` entries.
  When `tracking` is `null` the block is omitted entirely.

## Account page

- **Profil (read-only):** name, email, phone; a small badge for `provider`
  (`password`/`google`) is acceptable.
- **Alamat:** list `currentUser.addresses`, marking the `defaultAddressId`
  entry; `EmptyState` when there are none (e.g. seed user Sari).
- **Riwayat:** `useOrders()` filtered to `userId === currentUser.id` (store
  already keeps newest first). Each row: Order ID, date, item summary, total,
  `StatusBadge`, link → `/pesanan/:id`. `EmptyState` "Belum ada pesanan" when
  empty. History is filtered inline in the page — no new store hook (YAGNI).

## Seed demo orders (required)

The seed currently has `orders: []`, so history/tracking would be empty. Add
**`src/data/orders.js`** with a small set, and import it into `buildSeed()`:

- ~3 orders owned by **Budi (`u1`)** spanning statuses, including:
  - one **"Dalam pengiriman"** with `tracking` populated (exercises resi +
    tracking-history UI),
  - one **"Sedang diproses"**,
  - one **"Selesai"**.
- one **guest** order (`userId: null`) with a real `contact` (name + email +
  phone) to exercise `/lacak`.

Each seed order must be shape-complete per the SP1 Order model: `id`,
`createdAt`, `userId`, `contact`, `shippingAddress` (snapshot), `items`
(snapshot with `productId, sku, name, price, qty`), `shipping`, `promo`,
`subtotal`/`shippingCost`/`discount`/`total`, `paymentStatus`, `status`,
`statusHistory` (with plausible timestamps), and `tracking` (`null` except the
in-transit order). Bump `VERSION` in `seed.js` `1 → 2` so existing stores
re-seed automatically. Record the demo Order IDs + guest email/HP in the spec
and in `TODO.md`'s "Menjalankan" section.

## File plan

**New**
```
src/pages/TrackOrderPage.jsx        # /lacak
src/pages/AccountPage.jsx           # /akun (tabbed: profil/alamat/riwayat)
src/pages/OrderDetailPage.jsx       # /pesanan/:id (guard + compose card/timeline)
src/components/order/OrderSummaryCard.jsx
src/components/order/OrderTimeline.jsx
src/utils/formatDate.js
src/data/orders.js                  # seed orders
```

**Changed**
```
src/App.jsx      # add 3 routes
src/components/layout/Nav.jsx   # "Lacak Pesanan" + "Akun" links
src/store/seed.js               # import orders, bump VERSION 1 -> 2
TODO.md          # mark SP3 done; add demo order IDs to run notes
```

No new store mutations, no new dependencies.

## Verification (definition of done)

Verified in the browser:

- Login `budi@dmb.com` → `/akun`: profile + address render; Riwayat lists seed
  orders; clicking one → `/pesanan/:id` shows summary + timeline; the
  "Dalam pengiriman" order shows the resi block with tracking history.
- `/lacak`: correct guest Order ID + email/HP → detail renders; wrong input →
  inline error, no detail.
- Opening `/pesanan/:id` for an order that isn't the logged-in user's, or via a
  direct URL without verification → redirect to `/lacak`.
- `/akun` while logged out → redirect to `/login`.
- Sari (`sari@dmb.com`, no address, no orders) → Alamat and Riwayat show empty
  states.
- `npm run lint` and `npm run build` are clean.
