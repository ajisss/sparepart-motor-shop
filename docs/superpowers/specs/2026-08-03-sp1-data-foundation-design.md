# SP1 — Shared Data & Domain Foundation (DMB Moto Shop)

Date: 2026-08-03
Status: Approved design, ready for implementation plan

## Context

The repo (`sparepart-motor-shop`, React 19 + Vite + Tailwind + React Router) is
being reshaped into **DMB Moto Shop** per `~/DMB POS/figma-cli/prd.md`. This is a
**front-end-only POC prototype for showcase** — no real backend, no live
Midtrans/Biteship/Google SSO. Everything is simulated client-side and persisted to
localStorage. Optimize for "the flow visibly works and looks convincing in a demo,"
not backend correctness. Apply YAGNI; no new dependencies.

The full effort is decomposed into six sub-projects:

- **SP1** — shared data/domain layer ← *this spec*
- SP2 — customer storefront (core purchase flow)
- SP3 — order tracking & customer order history
- SP4 — admin workspace shell + dashboard
- SP5 — admin product & homepage-content management
- SP6 — admin order fulfillment + refund

SP1 is the shared foundation both the customer storefront and the admin workspace
read from and write to.

## Current state (what SP1 replaces/extends)

- `src/data/products.js` — static array of 15 products (`id, name, brand, price,
  category, compatibleWith, rating, reviewCount, stock, image, description`).
- `src/data/categories.js` — static array of 5 categories `{ id, name }`.
- `src/context/AuthContext.jsx` — boolean `isLoggedIn` in localStorage, no user
  identity; `login()`/`logout()`.
- `src/context/CartContext.jsx` — items `[{ productId, qty }]` in localStorage,
  subtotal computed from the static `PRODUCTS` import.
- `src/utils/orderNumber.js` — `generateOrderNumber()` → `ORD-XXXXXXXX`.
- `src/utils/formatCurrency.js` — Rupiah formatting.

## Goals

- A single reactive store (`StoreProvider`) holding all domain data, seeded from
  data files, auto-persisted to localStorage, exposed via hooks — so admin edits
  reflect in the storefront within the same session.
- A domain model rich enough to drive every downstream sub-project (rich products,
  users + addresses, orders + 6 statuses, promos, shipping options, homepage
  content).
- Existing Auth & Cart refactored onto the store so the app **stays runnable** at
  the end of SP1.
- Zero new dependencies.

## Non-goals

- No new pages/screens (those come in SP2–SP6).
- No reshape of existing storefront pages beyond the minimum needed to keep them
  from erroring.
- No real auth/payment/shipping integration or validation.

## Architecture & persistence

A single **`StoreProvider`** (React Context) holds the entire domain data object in
React state, seeded from data files on first load, and auto-persisted to
localStorage on change.

**localStorage keys:**

| Key | Contents |
|---|---|
| `dmb:data` | Whole domain data object (products, categories, users, orders, promos, shipping, homepage) + a `version` field. If `version` differs or the key is absent → re-seed from data files. |
| `dmb:auth` | `currentUserId` (session login) |
| `dmb:cart` | `[{ productId, qty }]` (unchanged shape) |

**Provider tree:** `StoreProvider` (outermost) → `AuthProvider` → `CartProvider`,
so Auth and Cart read from the store.

**Exposed hooks:**

- Reads: `useProducts()`, `useProduct(id)`, `useCategories()`, `useOrders()`,
  `useOrder(id)`, `usePromos()`, `useShipping()`, `useHomepage()`.
- Mutations (defined now, fully used in SP4–SP6): add/update/delete product,
  `createOrder(...)`, `updateOrderStatus(...)`, update homepage content, etc.
- `resetStore()` — restore seed data (handy for demos).

The `version` constant lets us bump the seed shape and force a re-seed during
development.

## Entity models

```js
// Product (extends current)
{
  id, sku,                    // sku is new (single SKU per product, per PRD)
  name, brand, category,      // category = category id
  price, stock,
  images: [url, ...],         // carousel (old single `image` becomes an array)
  videoUrl,                   // new — product video (may be empty)
  description,
  compatibleWith: [...],
  rating, reviewCount,        // kept, drives product card
  testimonials: [{ id, author, rating, text, date }],  // new — detail page
  published: true,            // new — publish toggle (SP5)
  isFeatured: false,          // new — show as "Produk Terbaru" (SP5)
  createdAt,
}

// Category — { id, name } (unchanged)

// User
{
  id, name, email, phone,
  password,                   // plaintext, POC only
  provider: 'password' | 'google',
  addresses: [ Address ],
  defaultAddressId,           // may be null → demo "no address yet"
}

// Address
{ id, recipientName, phone, line, city, province, postalCode }

// Order
{
  id: 'ORD-XXXXXXXX',
  createdAt,
  userId,                     // null = guest
  contact: { name, email, phone },     // guest tracking + recipient
  shippingAddress: {...},     // snapshot of address
  items: [{ productId, sku, name, price, qty }],   // snapshot for history integrity
  shipping: { courier, service, cost, etaLabel },  // expedisi + package
  promo: { code, discount } | null,
  subtotal, shippingCost, discount, total,
  paymentStatus: 'pending' | 'paid' | 'failed',    // Midtrans representation
  status,                     // one of the 6 PRD statuses (below)
  tracking: { number, courier, history: [{ status, at, note }] } | null,  // filled at "Siap Dikirim" (Biteship sim)
  statusHistory: [{ status, at }],
}
// status: 'Menunggu pembayaran' | 'Sedang diproses' | 'Siap dikirim'
//         | 'Dalam pengiriman' | 'Selesai' | 'Refund diproses'

// Promo
{ code, type: 'percent' | 'fixed', value, minSpend, active }

// Shipping (expedisi → package)
{
  couriers: [
    { id: 'jne', name: 'JNE', services: [
        { id: 'reg', name: 'Regular',  cost: 15000, etaLabel: '2–3 hari' },
        { id: 'sd',  name: 'Same Day', cost: 35000, etaLabel: 'Hari ini' },
    ]},
    // + SiCepat, AnterAja (dummy)
  ]
}

// HomepageContent
{
  banners: [{ id, image, headline, subtext, ctaLabel, ctaHref, active, order }],
  featuredProductIds: [ ... ],     // ordering/activation of "Produk Terbaru"
  testimonials: [{ id, author, text, rating }],   // curated homepage testimonials
}
```

**Design decisions (for lightness):**

- `rating`/`reviewCount` are stored, not derived from `testimonials`.
- Order `items` and `shippingAddress` are snapshots so order history is unaffected
  by later product/address edits.
- `paymentStatus` is separate from `status` purely to represent the Midtrans step;
  `status` = 'Menunggu pembayaran' corresponds to `paymentStatus` = 'pending', and
  'Sedang diproses' corresponds to 'paid'.

## Seed data plan

Seed files live in `src/data/` (the store seeds from them):

- **`products.js`** — keep the 15 existing products; add `sku` (e.g. `NHK-KMP-001`),
  `images` (array — reuse existing SVGs plus 1–2 duplicates for the carousel),
  `videoUrl` (dummy YouTube link on 1–2 products, empty on the rest), `testimonials`
  (2–3 on several products), `published: true`, `isFeatured` (5–6 set `true`),
  `createdAt`.
- **`categories.js`** — unchanged (5 categories).
- **`users.js`** (new) — 2 seed users:
  - `budi@dmb.com` — has a complete default address (demo "fast checkout").
  - `sari@dmb.com` — no address yet (demo "fill address first time").
- **`promos.js`** (new) — e.g. `DMB10` (percent 10%, minSpend 100k), `ONGKIR`
  (fixed 15k), `HEMAT50K` (fixed 50k, minSpend 300k).
- **`shipping.js`** (new) — 3 couriers (JNE, SiCepat, AnterAja), each with 2–3
  packages (Regular/Same Day/Instant) with dummy cost + ETA.
- **`homepage.js`** (new) — 2 promo banners, `featuredProductIds` (from products
  with `isFeatured`), 3 curated testimonials.

## Refactor of existing code (keep the app runnable)

- **`AuthContext`** — `isLoggedIn` (boolean) → `currentUser` (user object or
  `null`). New API: `login(email, password)`, `loginWithGoogle()`,
  `register(data)`, `logout()`, reading/writing `store.users`. Keep `isLoggedIn`
  as a derived value (`!!currentUser`) so existing components don't break. Per the
  approved auth model: any password is accepted for seed users; `loginWithGoogle()`
  logs in as a dummy Google user; `register()` adds a user and logs in. No password
  validation.
- **`CartContext`** — item shape stays `[{ productId, qty }]`; `subtotal` computed
  from products in the store instead of the static `PRODUCTS` import.
- **Existing pages** (Home, Search, Detail, Cart, Checkout, Login/Register,
  Success) — NOT reshaped in SP1; they must simply not error. `LoginPage`/
  `RegisterPage` get the minimal edits needed to call the new auth API. Pages that
  read the static `PRODUCTS`/`CATEGORIES` exports keep working because the store
  seeds from those same files; full migration to reactive hooks happens in SP2.

## New file structure

```
src/data/    products.js (extend), categories.js, users.js, promos.js, shipping.js, homepage.js
src/store/   StoreProvider.jsx, hooks.js, seed.js   (load + version + reset)
```

## Verification (definition of done)

- `npm run dev` runs with no console errors.
- Login / logout and cart still function.
- `localStorage` contains a seeded `dmb:data` after first load.
- `resetStore()` restores seed data.
- All exposed hooks return the seeded data.
