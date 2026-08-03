# SP2 — Customer Storefront (DMB Moto Shop)

Date: 2026-08-03
Status: Approved design, ready for implementation plan

## Context

Second sub-project of the DMB Moto Shop reshape (per `~/DMB POS/figma-cli/prd.md`).
Front-end-only POC prototype for showcase — no real backend, no live
Midtrans/Biteship/Google SSO; everything simulated client-side. Optimize for a
convincing demo, not backend correctness.

SP1 delivered the shared data foundation: a reactive `StoreProvider`
(localStorage `dmb:data`) exposing products, categories, users+addresses,
orders+6 statuses, promos, shipping (couriers→services), and homepage content,
plus store-backed Auth (`useAuth`) and Cart (`useCart`). SP2 builds the customer
storefront on top of it: it reshapes the existing pages (currently the cloned
cosmetic-kit UI) into the PRD's purchase flow and wires them to the store.

**Design direction (approved):** evolve the existing visual language — keep the
brand green (`primary-600 #497D00`, lime pop `#BBF451`), neutral greyscale,
Instrument Sans, pill buttons, 12px card radius — and add the new components/flow
inside that style.

## Goals

- Full customer purchase flow per PRD: Home → Katalog → Detail → Cart →
  Checkout (identity decision AT checkout → address → shipping → promo/summary →
  Midtrans Snap simulation) → Success.
- Data-driven storefront reading from the SP1 store (admin edits in SP4–SP6 will
  reflect here).
- Rebrand nav/title from "MotoPart" to "DMB Moto Shop".

## Non-goals

- Order tracking page / customer profile / order history (SP3).
- Admin workspace (SP4–SP6).
- Real payment/shipping/SSO integration.
- Mobile-specific layout polish (desktop-first per PRD; existing responsive
  classes kept where present, but not a focus).

## Routes

| Route | Page | Notes |
|---|---|---|
| `/` | Home | banners, categories, "Produk Terbaru" (featured), testimonials |
| `/search` | Katalog | published products grid, category filter, search, price sort |
| `/product/:id` | Product Detail | carousel, video, stock, rating, description, testimonials, dual CTA |
| `/cart` | Cart | line items, qty, remove, subtotal, proceed to checkout |
| `/checkout` | Checkout wizard | 4 steps + pay (see below) |
| `/checkout/success` | Success | Order ID, items, total, shipping, address, status badge |

Home, Search, and Product Detail are migrated off the static `PRODUCTS`/
`CATEGORIES` imports onto the store hooks (`useProducts`, `useProduct`,
`useCategories`, `useHomepage`) as part of this work.

## Design system additions (within the existing style)

Add to `tailwind.config.js` (documented in `src/styles/tokens.md` as POC additions,
not from the original Figma):

- Semantic colors: `success #16A34A`, `error #DC2626`, `warning #D97706`,
  `info #2563EB`. Used for form validation and the 6 order-status badges.

Status → color mapping (for `StatusBadge`):

| Status | Color |
|---|---|
| Menunggu pembayaran | warning |
| Sedang diproses | info |
| Siap dikirim | info |
| Dalam pengiriman | primary |
| Selesai | success |
| Refund diproses | error |

New reusable components under `src/components/ui/` (and `src/components/checkout/`
where checkout-specific):

- `Stepper` — horizontal step indicator for checkout.
- `RadioCard` — selectable card (identity choice, courier, service, payment method).
- `FormField` / `Input` / `Select` — labeled inputs with an error slot.
- `Modal` — accessible overlay (used by the Snap payment modal). Must NOT use
  native `alert/confirm/prompt`.
- `Carousel` — image carousel for product detail (uses `product.images[]`).
- `StatusBadge` — colored pill for an order status.
- `PromoInput` — code entry + apply + applied/removed state.
- `OrderSummary` — subtotal / shipping / discount / total breakdown.

Existing components (`Button`, `ProductCard`, `PriceTag`, `Rating`,
`QuantitySelector`, `CategoryChip`, `EmptyState`, `Nav`, `Footer`) are reused and
extended, not replaced.

## Branding

Nav logo text and `index.html` `<title>` change from "MotoPart"/"Sparepart Motor
Shop" to "DMB Moto Shop".

## Home page

- **Banner:** a carousel/hero from `homepage.banners` (filter `active`, order by
  `order`) — headline, subtext, CTA linking to `ctaHref`.
- **Categories:** row of `CategoryChip`s from `useCategories()`, each linking to
  `/search?category=<id>`.
- **Produk Terbaru:** product cards for `homepage.featuredProductIds` (in order),
  resolved via the store; only `published` products shown.
- **Testimonials:** section rendering `homepage.testimonials`.
- Nav: search link, cart icon with `itemCount` badge, and a Login link or the
  user's name/Logout (from `useAuth`).

## Katalog (`/search`)

- Grid of `published` products from `useProducts()`.
- Category filter (chips or select) — respects `?category=` query param.
- Text search over name + brand.
- Sort by price (asc/desc) and/or newest (`createdAt`).
- Empty state via `EmptyState` when no matches.

## Product Detail (`/product/:id`)

- `Carousel` over `product.images`.
- Product video: if `product.videoUrl` is non-empty, embed it (iframe for a
  YouTube URL); otherwise omit the video block.
- Name, brand, `PriceTag`, `Rating`, stock indicator (e.g. "Stok: 40" or "Stok
  habis" when `stock === 0`), description.
- Testimonials list from `product.testimonials`.
- `QuantitySelector` (max = stock).
- CTAs: **Tambah ke Keranjang** (`addItem`, stays on page with feedback) and
  **Checkout Sekarang** (adds the item then navigates to `/checkout`).
- If `stock === 0`, both CTAs disabled with an out-of-stock message.
- Uses `useProduct(id)`; unknown id → `EmptyState` "Produk tidak ditemukan".

## Cart (`/cart`)

- Line items from `useCart()`: image (`images[0]`), name, unit price,
  `QuantitySelector`, line total, remove (existing `ConfirmDeleteModal`).
- `OrderSummary` (subtotal only here; shipping/discount computed at checkout).
- "Lanjut ke Checkout" → `/checkout`. Disabled when cart empty.
- Empty state via `EmptyState`.

## Checkout wizard (`/checkout`)

A `Stepper`-driven wizard holding local checkout state (identity/contact,
address, shipping selection, promo). Guard: if the cart is empty, redirect to
`/cart`.

**Step 1 — Identitas:**
- If `useAuth().isLoggedIn` → step is auto-satisfied and skipped; a summary line
  shows "Masuk sebagai <email>" with an option to continue as someone else.
- If not logged in → two `RadioCard`s:
  - *Lanjut sebagai tamu* — proceeds; contact fields (name, phone, email) are
    collected in Step 2.
  - *Masuk ke akun* — inline email/password form (`login`) + a **Google SSO**
    button (`loginWithGoogle`). On success, proceeds as a logged-in user.

**Step 2 — Alamat:**
- Logged-in user with a `defaultAddressId` → show the default address, selectable;
  allow adding a new address (becomes default via `setDefaultAddress`).
- Logged-in user without a default → address form; on save, `setDefaultAddress`
  stores it as the default on their profile.
- Guest → contact fields (name, phone, email) + a manual address form (not saved
  to any user; captured into the order's `contact` + `shippingAddress`).
- Required-field validation with inline errors.

**Step 3 — Pengiriman:**
- Choose a courier (`RadioCard` per `shipping.couriers`), then a service/package
  (`RadioCard` per `courier.services`) showing `cost` + `etaLabel`.
- Selection sets the order's `shipping = { courier, service, cost, etaLabel }`.

**Step 4 — Ringkasan:**
- `OrderSummary`: items, subtotal (from cart), shipping cost, discount, total.
- `PromoInput`: validate the code against `store.promos` (must be `active`,
  `subtotal >= minSpend`); apply `type: 'percent'|'fixed'` to compute discount.
  Invalid/ineligible code → inline error, no discount.
- **Bayar** button opens the Snap payment modal.

## Payment simulation (Midtrans Snap)

A `Modal` styled to resemble Midtrans Snap:

- Shows the total, a short list of dummy methods (VA BCA, GoPay, QRIS — visual
  only), a **Bayar Sekarang** button.
- A demo outcome control lets the presenter pick **berhasil / pending / gagal**.
- **berhasil:** `createOrder({ userId, contact, shippingAddress, items (snapshot),
  shipping, promo, subtotal, shippingCost, discount, total, paymentStatus: 'paid',
  status: 'Sedang diproses' })`, then `clearCart()`, then navigate to
  `/checkout/success` with the new order id.
- **pending:** same `createOrder` but `paymentStatus: 'pending'`,
  `status: 'Menunggu pembayaran'`; navigate to success (status pending).
- **gagal:** stay in the modal, show an error, allow retry (no order created).

Order `items` are snapshotted `{ productId, sku, name, price, qty }` from the cart
resolved against the store; `contact`/`shippingAddress` come from Step 2.

## Success page (`/checkout/success`)

Reads the order id (via router state or `?order=` param) and looks it up with
`useOrder(id)`. Shows: Order ID, item list + quantities, total, shipping type
(courier + service), recipient address, and a `StatusBadge`. Guests see a hint
that they can track with their Order ID + email/phone (the Lacak Pesanan page is
SP3); logged-in users see a hint that it appears in their profile (SP3). Actions:
"Lanjut belanja" (`/search`) and "Kembali ke beranda" (`/`). If no order is
found, `EmptyState`.

## Data & utilities

- Reads: `useProducts`, `useProduct`, `useCategories`, `useHomepage`,
  `useShipping`, `usePromos`, `useAuth`, `useCart`, `useOrder`.
- Writes: `createOrder`, `setDefaultAddress` (both from SP1 `useStore`).
- New pure util `src/utils/checkout.js`:
  - `applyPromo(subtotal, promo)` → discount amount (0 if ineligible/null).
  - `computeTotals({ subtotal, shippingCost, discount })` → `{ total }`.
  - `validatePromo(code, promos, subtotal)` → `{ promo, discount } | { error }`.
- Snapshot builder for order items from cart + store products.

## Verification (definition of done)

- `npm run build` and `npm run lint` clean.
- Browser smoke (controller-run): Home renders banners/categories/featured/
  testimonials from the store; Katalog filters/searches/sorts; Detail shows
  carousel + (conditional) video + testimonials, both CTAs work; Cart updates;
  the checkout wizard completes for (a) a guest and (b) a logged-in user with a
  default address and (c) a logged-in user without a default address (address
  saved as default); courier→service selection and a valid promo affect the
  total; the Snap modal's three outcomes behave as specified; a `paid` order lands
  on the success page with the right Order ID, items, shipping, address, and
  "Sedang diproses" badge; a created order is present in `store.orders`.
- No console errors across the flow.
