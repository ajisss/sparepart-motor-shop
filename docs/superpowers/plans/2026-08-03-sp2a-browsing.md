# SP2A — Design System + Branding + Browsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand to "DMB Moto Shop", add the semantic colors + reusable UI primitives SP2 needs, and reshape the browsing storefront (Home, Katalog, Product Detail, Cart) to be data-driven off the SP1 store.

**Architecture:** Evolve the existing visual language (brand green, neutral greyscale, Instrument Sans, pill buttons, 12px card radius). Migrate display pages from the static `src/data/*` imports to the SP1 store hooks (`useProducts`, `useProduct`, `useCategories`, `useHomepage`). Add small, focused, reusable components under `src/components/ui`. No new dependencies.

**Tech Stack:** React 19, Vite 8, React Router 7, Tailwind 3. Plain JS (ESM), React Context + `localStorage` (SP1 store).

## Global Constraints

- Front-end-only POC prototype for showcase — no real backend. Favor a convincing demo over backend correctness. YAGNI.
- **No new dependencies. No test framework** is added. Pure-logic files (none in this plan) are verified with `node`; everything else is verified with `npm run build` (must compile clean) + `npm run lint` (no NEW warnings/errors) and a controller-run browser smoke test.
- **Design tokens** (`tailwind.config.js`) — use ONLY these defined shades; do not fabricate `primary` 50/300/400/500:
  - `primary`: 25 `#F7FEE7`, 100 `#D8F999`, 200 `#BBF451`, 600 `#497D00` (DEFAULT), 700 `#3C6300`, 800 `#35530E`, 900 `#192E03`.
  - `neutral`: 0 `#FFFFFF`, 25 `#F9F9F9`, 50 `#F3F4F2`, 100 `#E7E9E5`, 200 `#CFD3CC`, 600 `#707A66`, 800 `#404D33`, 900 `#102100`.
  - `font-sans` = Instrument Sans; radius `md` = 12px, `pill` = 100px.
  - Task 1 ADDS semantic colors: `success #16A34A`, `error #DC2626`, `warning #D97706`, `info #2563EB`.
- **Brand string is "DMB Moto Shop"** (replaces "MotoPart"). Old string appears in `Nav.jsx`, `Footer.jsx`, `AuthHeroPanel.jsx`, and `index.html` `<title>`.
- **The SP1 store is live.** `CartContext` (`useCart`) and `AuthContext` (`useAuth`) already read from the store — do NOT re-wrap or change them. Only the DISPLAY pages still use static `PRODUCTS`/`CATEGORIES`; those are what this plan migrates.
- Every page renders its own `<Nav/>` and `<Footer/>` (there is no layout route) — keep that pattern.
- Currency is always rendered via `src/utils/formatCurrency.js`.
- Rupiah/copy in Indonesian, matching existing pages.
- Each task must leave the app runnable (`npm run build` clean).
- Run all commands from repo root `/Users/macbook/sparepart-motor-shop`.

## Product shape (reference)

`{ id, sku, name, brand, price, category, compatibleWith[], rating, reviewCount, stock, images[], videoUrl, description, testimonials:[{id,author,rating,text,date}], published, isFeatured, createdAt }`

## File Structure

- `tailwind.config.js` — **modify**: add 4 semantic colors.
- `src/styles/tokens.md` — **modify**: document the POC semantic colors.
- `index.html` — **modify**: `<title>`.
- `src/components/layout/Nav.jsx`, `src/components/layout/Footer.jsx`, `src/components/auth/AuthHeroPanel.jsx` — **modify**: brand string.
- `src/components/ui/FormField.jsx`, `Input.jsx`, `Select.jsx`, `RadioCard.jsx` — **create** (Task 2).
- `src/components/ui/Modal.jsx`, `StatusBadge.jsx`, `Carousel.jsx` — **create** (Task 3).
- `src/pages/HomePage.jsx` — **modify** (Task 4).
- `src/pages/SearchPage.jsx` — **modify** (Task 5).
- `src/pages/ProductDetailPage.jsx` — **modify** (Task 6).
- `src/pages/CartPage.jsx` — **modify** (Task 7).

---

## Task 1: Semantic colors + branding rename

**Files:**
- Modify: `tailwind.config.js`, `src/styles/tokens.md`, `index.html`, `src/components/layout/Nav.jsx`, `src/components/layout/Footer.jsx`, `src/components/auth/AuthHeroPanel.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces: Tailwind color utilities `text-success`/`bg-success` (+ `/10` opacity), and the same for `error`, `warning`, `info`. Brand name "DMB Moto Shop" everywhere.

- [ ] **Step 1: Add semantic colors to `tailwind.config.js`**

Inside `theme.extend.colors`, after the `neutral` block, add:
```js
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB',
```

- [ ] **Step 2: Document them in `src/styles/tokens.md`**

Append a section:
```markdown
## Semantic colors (POC additions — not from the original Figma)

Added in SP2 for form validation and order-status badges. Not part of the source
Figma file.

| Token | Hex |
|---|---|
| success | #16A34A |
| error | #DC2626 |
| warning | #D97706 |
| info | #2563EB |
```

- [ ] **Step 3: Rebrand `index.html` title**

Change the `<title>` to `DMB Moto Shop`.

- [ ] **Step 4: Rebrand the three components**

Replace the visible "MotoPart" text with "DMB Moto Shop" in `Nav.jsx` (brand Link), `Footer.jsx` (bottom-bar copyright line), and `AuthHeroPanel.jsx` (wordmark). Change only the display string; keep layout/classes.

- [ ] **Step 5: Verify build, lint, and that no "MotoPart" remains**

Run:
```bash
npm run build 2>&1 | tail -3
npm run lint 2>&1 | tail -3
grep -rn "MotoPart" src index.html || echo "NO MotoPart LEFT"
```
Expected: build succeeds, lint clean, grep prints `NO MotoPart LEFT`.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.js src/styles/tokens.md index.html src/components/layout/Nav.jsx src/components/layout/Footer.jsx src/components/auth/AuthHeroPanel.jsx
git commit -m "feat(sp2): add semantic colors and rebrand to DMB Moto Shop"
```

---

## Task 2: Form primitives — FormField, Input, Select, RadioCard

**Files:**
- Create: `src/components/ui/FormField.jsx`, `src/components/ui/Input.jsx`, `src/components/ui/Select.jsx`, `src/components/ui/RadioCard.jsx`

**Interfaces:**
- Consumes: semantic `error` color from Task 1.
- Produces (used heavily by the SP2B checkout):
  - `FormField({ label, error, htmlFor, children })`
  - `Input({ error, className, ...props })` — styled text input
  - `Select({ error, className, children, ...props })` — styled select
  - `RadioCard({ selected, onSelect, title, subtitle, right, disabled, children })`

- [ ] **Step 1: Create `src/components/ui/FormField.jsx`**

```jsx
export default function FormField({ label, error, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}
      {children}
      {error && <span className="text-sm text-error">{error}</span>}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/ui/Input.jsx`**

```jsx
export default function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`rounded-md border px-4 py-3 text-neutral-900 outline-none transition-colors placeholder:text-neutral-600 focus:border-primary-600 ${
        error ? 'border-error' : 'border-neutral-200'
      } ${className}`}
      {...props}
    />
  )
}
```

- [ ] **Step 3: Create `src/components/ui/Select.jsx`**

```jsx
export default function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`rounded-md border bg-neutral-0 px-4 py-3 text-neutral-900 outline-none transition-colors focus:border-primary-600 ${
        error ? 'border-error' : 'border-neutral-200'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
```

- [ ] **Step 4: Create `src/components/ui/RadioCard.jsx`**

```jsx
export default function RadioCard({ selected, onSelect, title, subtitle, right, disabled, children }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-md border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected ? 'border-primary-600 bg-primary-25' : 'border-neutral-200 bg-neutral-0 hover:bg-neutral-25'
      }`}
    >
      <span
        className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary-600' : 'border-neutral-200'
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
      </span>
      <span className="flex-1">
        <span className="block font-medium text-neutral-900">{title}</span>
        {subtitle && <span className="block text-sm text-neutral-600">{subtitle}</span>}
        {children}
      </span>
      {right && <span className="flex-none text-right">{right}</span>}
    </button>
  )
}
```

- [ ] **Step 5: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -3`
Expected: build succeeds, lint clean. (These primitives are exercised in browser by later tasks.)

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/FormField.jsx src/components/ui/Input.jsx src/components/ui/Select.jsx src/components/ui/RadioCard.jsx
git commit -m "feat(sp2): add FormField, Input, Select, RadioCard primitives"
```

---

## Task 3: Display primitives — Modal, StatusBadge, Carousel

**Files:**
- Create: `src/components/ui/Modal.jsx`, `src/components/ui/StatusBadge.jsx`, `src/components/ui/Carousel.jsx`

**Interfaces:**
- Produces:
  - `Modal({ open, onClose, title, children, maxWidth })` — overlay dialog; closes on Escape and backdrop click; NO native alert/confirm/prompt.
  - `StatusBadge({ status })` — colored pill for one of the 6 order statuses.
  - `Carousel({ images, alt })` — main image + thumbnail selector.

- [ ] **Step 1: Create `src/components/ui/Modal.jsx`**

```jsx
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} rounded-md bg-neutral-0 p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="mb-4 text-xl font-medium text-neutral-900">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/ui/StatusBadge.jsx`**

```jsx
const STATUS_COLORS = {
  'Menunggu pembayaran': 'bg-warning/10 text-warning',
  'Sedang diproses': 'bg-info/10 text-info',
  'Siap dikirim': 'bg-info/10 text-info',
  'Dalam pengiriman': 'bg-primary-100 text-primary-800',
  Selesai: 'bg-success/10 text-success',
  'Refund diproses': 'bg-error/10 text-error',
}

export default function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-neutral-100 text-neutral-800'
  return (
    <span className={`inline-flex items-center rounded-pill px-3 py-1 text-sm font-medium ${cls}`}>
      {status}
    </span>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/Carousel.jsx`**

```jsx
import { useState } from 'react'

export default function Carousel({ images = [], alt = '' }) {
  const [active, setActive] = useState(0)
  if (!images.length) return null
  const current = images[Math.min(active, images.length - 1)]
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-md bg-neutral-50">
        <img src={current} alt={alt} className="h-full w-full object-contain" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 overflow-hidden rounded-md border-2 ${
                i === active ? 'border-primary-600' : 'border-neutral-200'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -3`
Expected: build succeeds, lint clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Modal.jsx src/components/ui/StatusBadge.jsx src/components/ui/Carousel.jsx
git commit -m "feat(sp2): add Modal, StatusBadge, Carousel primitives"
```

---

## Task 4: Home page — data-driven off the store

**Files:**
- Modify: `src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `useHomepage()` (`{ banners, featuredProductIds, testimonials }`), `useProducts()`, `useCategories()`; existing `Nav`, `Footer`, `ProductCard`, `CategoryChip`, `Button`.
- Produces: no new exports.

**Behavior / acceptance:** First read the current file to preserve its visual structure and classes, then reshape the DATA SOURCE and add the two new sections:
- Replace the static `PRODUCTS`/`CATEGORIES` imports and the module-level `HERO_HIGHLIGHTS` with store data: `const homepage = useHomepage()`, `const products = useProducts()`, `const categories = useCategories()`.
- **Banner/hero:** drive it from `homepage.banners` filtered to `active`, sorted by `order`. Render the first active banner's `headline`/`subtext` in the existing hero, with the CTA `<Button>` linking (React Router `Link`) to that banner's `ctaHref` and labeled `ctaLabel`. Keep the existing hero styling (dark section). If there are multiple active banners, a simple selector (dots) is nice-to-have but optional; a single hero is acceptable.
- **Categories:** keep the existing chip row, sourced from `categories`, each linking to `/search?category=<id>` (use `Link`), plus a "Semua" link to `/search`.
- **Produk Terbaru:** replace the old "Produk Pilihan" grid with cards for `homepage.featuredProductIds` resolved against `products` (preserve order; skip ids not found or not `published`). Reuse `<ProductCard product={...} />`. Section heading: "Produk Terbaru".
- **Testimonials:** add a section after the products grid rendering `homepage.testimonials` (`author`, `text`, `rating`) as simple cards (use `neutral` tokens; show rating as "★" × value or the existing star glyph pattern). Keep it visually consistent.
- Only `published` products appear anywhere on this page.

- [ ] **Step 1: Read the current file**

Run: `sed -n '1,250p' src/pages/HomePage.jsx` — note the hero/category/grid structure and classes to preserve.

- [ ] **Step 2: Reshape HomePage per the Behavior/acceptance above**

Swap data sources to the store hooks, wire the banner/categories/featured/testimonials, keeping existing styling. Remove the now-unused static imports and `HERO_HIGHLIGHTS`.

- [ ] **Step 3: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -3`
Expected: build succeeds; lint clean (no unused `PRODUCTS`/`CATEGORIES` imports left).

- [ ] **Step 4: Commit**

```bash
git add src/pages/HomePage.jsx
git commit -m "feat(sp2): make Home data-driven (banners, categories, featured, testimonials)"
```

---

## Task 5: Katalog (`/search`) — store data, filter, search, sort, deep-link

**Files:**
- Modify: `src/pages/SearchPage.jsx`

**Interfaces:**
- Consumes: `useProducts()`, `useCategories()`, `useSearchParams` (react-router-dom); existing `Nav`, `Footer`, `ProductCard`, `CategoryChip`, `EmptyState`.

**Behavior / acceptance:** Read the current file first, preserve the hero/search/chip layout, then:
- Source products from `useProducts()` filtered to `published === true`; categories from `useCategories()`.
- Read the initial category from the URL: `const [params, setParams] = useSearchParams()`, `params.get('category')`. Selecting a category chip updates the URL param (`setParams`) so Home's `/search?category=<id>` links land pre-filtered. A "Semua" chip clears it.
- Text search (existing input) filters by name + brand (case-insensitive substring), kept in local state (optionally mirrored to `?q=`, but local state is acceptable).
- Add a sort control (a `Select`, from Task 2): options "Terbaru" (by `createdAt` desc), "Harga terendah" (price asc), "Harga tertinggi" (price desc). Default "Terbaru".
- `results` computed with `useMemo` over `[products, category, query, sort]`.
- Empty results → existing `EmptyState`. Otherwise show the count + `ProductCard` grid.

- [ ] **Step 1: Read the current file**

Run: `sed -n '1,250p' src/pages/SearchPage.jsx`

- [ ] **Step 2: Reshape SearchPage per the Behavior/acceptance above**

- [ ] **Step 3: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -3`
Expected: build succeeds, lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/pages/SearchPage.jsx
git commit -m "feat(sp2): catalog from store with category deep-link, search, and sort"
```

---

## Task 6: Product Detail — carousel, video, testimonials, dual CTA

**Files:**
- Modify: `src/pages/ProductDetailPage.jsx`

**Interfaces:**
- Consumes: `useProduct(id)`, `useCategories()`, `useCart()` (`addItem`), `useNavigate`, `useParams`; existing `Nav`, `Footer`, `PriceTag`, `Rating`, `QuantitySelector`, `Button`, `EmptyState`; new `Carousel` (Task 3).

**Behavior / acceptance:** Read the current file first, preserve the two-column gallery/info layout and classes, then:
- Source the product from `useProduct(id)` (not static `PRODUCTS.find`). If not found, render `EmptyState` "Produk tidak ditemukan" with an action back to `/search` (replace the current redirect-to-`/` effect).
- Replace the ad-hoc 4×-repeated-thumbnail gallery with `<Carousel images={product.images} alt={product.name} />`.
- **Video:** if `product.videoUrl` is a non-empty string, render a video block below the gallery — an `<iframe>` embed for a YouTube URL (convert a `watch?v=ID` URL to `https://www.youtube.com/embed/ID`). If empty, render nothing.
- Keep brand badge, `h1`, `PriceTag`, description, `compatibleWith` chips, `Rating`.
- **Stock:** show `Stok: <n>` when `stock > 0`; when `stock === 0` show "Stok habis" and disable both CTAs. `QuantitySelector` max = `product.stock` (min 1).
- **Testimonials:** add a section rendering `product.testimonials` (`author`, `rating`, `text`, `date`); if empty, show a small "Belum ada ulasan" line.
- **CTAs:** "Tambah ke Keranjang" → `addItem(product.id, qty)` and give inline feedback (e.g. a transient "Ditambahkan ✓" or keep the user on the page). "Checkout Sekarang" → `addItem(product.id, qty)` then `navigate('/checkout')` (note: NOT `/cart` — the current file navigates to `/cart`; change it to `/checkout`).

- [ ] **Step 1: Read the current file**

Run: `sed -n '1,250p' src/pages/ProductDetailPage.jsx`

- [ ] **Step 2: Reshape ProductDetailPage per the Behavior/acceptance above**

- [ ] **Step 3: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -3`
Expected: build succeeds, lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ProductDetailPage.jsx
git commit -m "feat(sp2): product detail with carousel, video, testimonials, dual CTA"
```

---

## Task 7: Cart — store products join + images

**Files:**
- Modify: `src/pages/CartPage.jsx`

**Interfaces:**
- Consumes: `useCart()` (already store-backed), `useProducts()`; existing `Nav`, `Footer`, `QuantitySelector`, `PriceTag`, `Button`, `EmptyState`, `ConfirmDeleteModal`, `formatCurrency`.

**Behavior / acceptance:** Read the current file first, preserve the two-column layout, then:
- Replace the static `PRODUCTS` join with `useProducts()`: build each cart row by joining `items` (from `useCart`) against the store `products` by `productId`.
- Use `product.images?.[0]` for the row image (the singular `image` field no longer exists).
- Keep the existing summary aside (subtotal/total from `useCart().subtotal`), the "Checkout" button → `navigate('/checkout')`, "Lanjut Belanja" → `/search`, and the `ConfirmDeleteModal` delete flow.
- Empty cart → existing `EmptyState`.

- [ ] **Step 1: Read the current file**

Run: `sed -n '1,250p' src/pages/CartPage.jsx`

- [ ] **Step 2: Reshape CartPage per the Behavior/acceptance above**

- [ ] **Step 3: Verify build + lint**

Run: `npm run build 2>&1 | tail -3 && npm run lint 2>&1 | tail -3`
Expected: build succeeds; lint clean (no unused static `PRODUCTS` import).

- [ ] **Step 4: Commit**

```bash
git add src/pages/CartPage.jsx
git commit -m "feat(sp2): cart rows joined from store products with images[0]"
```

---

## Self-Review

**Spec coverage (SP2 spec §Home/Katalog/Detail/Cart, §design system additions, §branding):**
- Semantic colors + status→color foundation → Task 1 (colors), Task 3 (StatusBadge uses them). ✓
- New primitives (Modal, RadioCard, FormField/Input/Select, Carousel, StatusBadge) → Tasks 2–3. (Stepper, PromoInput, OrderSummary, PaymentModal are SP2B.) ✓
- Branding → Task 1. ✓
- Home data-driven (banners/categories/featured/testimonials) → Task 4. ✓
- Katalog (published, category deep-link, search, sort) → Task 5. ✓
- Product Detail (carousel, conditional video, stock, testimonials, dual CTA to /checkout) → Task 6. ✓
- Cart (store join, images[0]) → Task 7. ✓
- Migrate display pages off static imports → Tasks 4–7. ✓

**Placeholder scan:** Primitives carry complete code. Page tasks give a "read current file" step plus concrete Behavior/acceptance (data hooks, sections, states, interactions) rather than vague directives — intentional for a UI reshape verified in-browser; no TBD/TODO. ✓

**Type consistency:** Primitive prop names (`RadioCard` `selected/onSelect/title/subtitle/right`, `Modal` `open/onClose/title`, `Carousel` `images/alt`, `StatusBadge` `status`) are defined once here and consumed by SP2B. Store hook names match SP1 (`useProducts`, `useProduct`, `useCategories`, `useHomepage`, `useCart`). ✓

**Deferred to SP2B:** checkout wizard, `checkout.js` util, `Stepper`/`PromoInput`/`OrderSummary`/`PaymentModal`, success page, `createOrder` wiring.
