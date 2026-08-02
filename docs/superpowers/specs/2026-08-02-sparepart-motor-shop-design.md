# Sparepart Motor Shop — Prototype Design Spec

Date: 2026-08-02

## Summary

A front-end-only prototype e-commerce site for motorcycle spare parts, visually
matching the "Vergelle — Cosmetic E-Commerce Web UI Kit" Figma design
(https://www.figma.com/design/g5t7sM0rQDvppxhMIyRnAF/Vergelle---Cosmetic-E-Commerce-Web-UI-Kit),
with product content swapped from cosmetics to motorcycle spare parts.

Figma source frames used (fileKey `g5t7sM0rQDvppxhMIyRnAF`, page "UI Design", node `203:5`):
- Onboarding & Auth → Login/Register
- Home
- Search
- Detail products → Product Detail
- Cart
- Checkout

Each section exists in two Figma variants: desktop (1440px) and mobile (393px).
Both are implemented.

## Goals

- Full purchase flow: Login → Home → Search → Product Detail → Cart → Checkout → Order Confirmation.
- Pixel-faithful layout, spacing, typography, and color match to the Figma design (per breakpoint).
- Content re-themed to motorcycle spare parts (categories, product names, descriptions).
- Fully client-side; no backend, no real payment integration, no real auth.

## Non-goals

- Backend/API, database, real authentication, real payment gateway.
- Account/Profile pages (excluded from Figma's "Accounts" section).
- SEO/SSR concerns.

## Tech stack

- Vite + React + React Router (SPA).
- Tailwind CSS, configured with design tokens (colors, spacing, font sizes) extracted from Figma via `get_design_context`.
- React Context for cart state and dummy auth state, persisted to `localStorage`.
- No test framework required for this prototype (manual verification via `/run` in browser); components kept simple enough to eyeball-verify against Figma screenshots.

## Routes

| Path | Page | Figma section |
|---|---|---|
| `/login` | Login/Register (tab switch) | Onboarding & Auth |
| `/` | Home (hero, categories, featured products) | Home |
| `/search` | Search & filters | Search |
| `/product/:id` | Product detail | Detail products |
| `/cart` | Cart | Cart |
| `/checkout` | Checkout form | Checkout |
| `/checkout/success` | Order confirmation | (new — end of Checkout flow) |

All routes are responsive: desktop layout ≥1024px derived from the 1440px Figma frames, mobile layout <768px derived from the 393px Figma frames, using Tailwind breakpoints.

## Data model (mock, in `src/data/products.js`)

```js
{
  id: string,
  name: string,
  brand: string,
  price: number,          // IDR
  category: string,       // one of CATEGORIES
  compatibleWith: string[], // e.g. ["Honda Vario 125", "Honda Vario 150"]
  rating: number,
  reviewCount: number,
  stock: number,
  image: string,          // placeholder asset path
  description: string,
}
```

Categories (replacing cosmetic categories from Figma): Mesin, Kelistrikan, Body & Aksesoris, Oli & Pelumas, Ban & Velg.

~15-20 mock products across categories, enough to populate Home's featured grid and Search results/filtering meaningfully.

## State management

- `CartContext`: cart items (`productId`, `qty`), `addItem`, `updateQty`, `removeItem`, `clearCart`, derived `subtotal`/`total`. Persisted to `localStorage` under key `cart`.
- `AuthContext`: `isLoggedIn` boolean, `login()` (accepts any non-empty form input, sets true), `logout()`. Persisted to `localStorage` under key `auth`. No route guarding required beyond optionally redirecting `/login` → `/` if already logged in (nice-to-have, not blocking).

## Page-by-page behavior

**Login/Register** — Matches Figma's split image/form layout. Tab or link toggles between Login and Register forms. Any submit with non-empty required fields calls `login()` and navigates to `/`.

**Home** — Hero banner (re-themed motorcycle imagery/copy), category chips/grid, featured/product grid using mock data, nav bar with search entry point and cart icon (shows item count badge).

**Search** — Search input + filter sidebar (category, price range, compatibility) matching Figma's filter UI; results grid reuses the same product card component as Home.

**Product Detail** — Image gallery (placeholder images), title/brand/price, compatibility list, description, quantity selector, "Tambah ke Keranjang" and "Beli Sekarang" (adds to cart then navigates to `/cart`).

**Cart** — List of cart items with qty controls and remove, order summary (subtotal, shipping placeholder, total), "Checkout" button (disabled/hidden if cart empty).

**Checkout** — Address form fields (dummy, no validation beyond required), payment method selection (radio list of dummy options: Transfer Bank, COD, E-Wallet), order summary. Submit clears cart, generates a dummy order number, navigates to `/checkout/success`.

**Order Confirmation** — Success message, dummy order number, order summary snapshot, link back to Home.

## Component reuse

Shared components (`src/components/`): `Nav`, `ProductCard`, `PriceTag`, `QuantitySelector`, `Button` (primary/secondary variants from Figma), `CategoryChip`, `EmptyState`. Built once per Figma "instance" pattern (e.g. Figma's "Primary Buttons", "Text Input" instances) and reused across pages, matching how Figma itself reuses components.

## Assets

- Icons/logos/vector graphics: exported directly from Figma via `get_design_context` asset URLs, downloaded and committed under `src/assets/`.
- Product photos: generic automotive-themed placeholders (not real product photography), sized/cropped to match Figma's image containers exactly.

## Error handling

Minimal, appropriate for a prototype:
- Empty cart → show empty-state instead of checkout button.
- Checkout required fields → simple inline "required" message, no complex validation.
- Unknown `:id` in `/product/:id` → redirect to `/` (or show simple "Product not found").

## Verification approach

No automated test suite for this prototype. Verification is visual: run the dev server (`/run`), navigate the full flow (login → home → search → detail → cart → checkout → confirmation) at both desktop and mobile widths, and compare against Figma screenshots per frame.
