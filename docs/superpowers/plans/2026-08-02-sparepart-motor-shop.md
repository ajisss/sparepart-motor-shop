# Sparepart Motor Shop Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-only React prototype of a motorcycle spare-parts e-commerce site, visually matching the "Vergelle" Figma UI kit (content re-themed from cosmetics to sparepart motor), covering the full flow: Login → Home → Search → Product Detail → Cart → Checkout → Order Confirmation, responsive at desktop (1440px) and mobile (393px) breakpoints.

**Architecture:** Vite + React + React Router SPA. Two React Contexts (`AuthContext`, `CartContext`) hold all app state, persisted to `localStorage`. All product data is a static mock module. Every page is built by pulling its Figma reference via `get_design_context` (specific node IDs given per task) and reimplementing it as Tailwind-styled React components, reusing a shared `components/ui` library.

**Tech Stack:** Vite, React 18, React Router 6, Tailwind CSS. No backend, no test framework (per spec — verification is manual/visual against Figma).

## Global Constraints

- Figma source: fileKey `g5t7sM0rQDvppxhMIyRnAF` (Vergelle — Cosmetic E-Commerce Web UI Kit), page "UI Design".
- Every `get_design_context` call in this plan MUST pass `skillNames` including `figma-design-to-code`.
- Every page must be implemented at BOTH breakpoints: desktop (≥1024px, Tailwind default/`lg:` styles) and mobile (<768px, base styles), using the specific desktop and mobile node IDs given in each task. Use Tailwind mobile-first: base styles = mobile Figma frame, `lg:` overrides = desktop Figma frame.
- No backend calls, no real payment integration, no real authentication — all state is local/mock, per the spec's non-goals.
- Product content must be motorcycle spare parts (categories: Mesin, Kelistrikan, Body & Aksesoris, Oli & Pelumas, Ban & Velg), never cosmetics wording.
- Product photography = generic automotive placeholders, NOT hand-drawn SVGs (per figma-design-to-code skill rules on images/icons — icons/logos ARE downloaded from Figma's real exported assets, product photos are the only placeholders).
- Icons/logos/vectors used in a page must be downloaded from the Figma asset URLs returned by `get_design_context` and committed under `src/assets/` — never hand-authored SVG paths.
- Currency formatting: Indonesian Rupiah, e.g. `Rp 125.000` (no decimals, thousands separator `.`).
- Verification for every task = run `npm run dev`, open the page in a browser, resize to both 393px and 1440px widths, and visually compare against the Figma screenshot (`get_screenshot`) for that task's node IDs.

---

## File Structure

```
sparepart-motor-shop/
  index.html
  vite.config.js
  tailwind.config.js
  postcss.config.js
  package.json
  src/
    main.jsx
    App.jsx                       # routes
    index.css                     # tailwind directives + base tokens
    assets/                       # downloaded Figma icons/logos (per page, subfoldered)
    utils/
      formatCurrency.js
      orderNumber.js
    data/
      categories.js
      products.js
    context/
      AuthContext.jsx
      CartContext.jsx
    components/
      layout/
        Nav.jsx
        Footer.jsx
      ui/
        Button.jsx
        PriceTag.jsx
        Rating.jsx
        CategoryChip.jsx
        QuantitySelector.jsx
        EmptyState.jsx
        ProductCard.jsx
      cart/
        ConfirmDeleteModal.jsx
    pages/
      LoginPage.jsx
      RegisterPage.jsx
      HomePage.jsx
      SearchPage.jsx
      ProductDetailPage.jsx
      CartPage.jsx
      CheckoutPage.jsx            # stepper container: shipping/delivery/payment/review
      checkout/
        ShippingStep.jsx
        DeliveryStep.jsx
        PaymentStep.jsx
        ReviewStep.jsx
      CheckoutSuccessPage.jsx
  docs/superpowers/
    specs/2026-08-02-sparepart-motor-shop-design.md
    plans/2026-08-02-sparepart-motor-shop.md
```

---

### Task 1: Project scaffold, routing skeleton, Tailwind setup

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `tailwind.config.js`, `postcss.config.js`
- Create: `src/main.jsx`, `src/App.jsx`, `src/index.css`
- Create: placeholder page files (empty divs) so routing compiles: `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/pages/HomePage.jsx`, `src/pages/SearchPage.jsx`, `src/pages/ProductDetailPage.jsx`, `src/pages/CartPage.jsx`, `src/pages/CheckoutPage.jsx`, `src/pages/CheckoutSuccessPage.jsx`

**Interfaces:**
- Produces: route table in `App.jsx` — `/login`, `/register`, `/`, `/search`, `/product/:id`, `/cart`, `/checkout`, `/checkout/success`. Every later page task replaces its corresponding placeholder file's content; it must keep the same default export name and file path.

- [ ] **Step 1: Scaffold the Vite project**

```bash
cd /Users/ihsanaziz/Projects/sparepart-motor-shop
npm create vite@latest . -- --template react
npm install
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Configure Tailwind content paths**

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 3: Add Tailwind directives**

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Create placeholder pages**

Each placeholder file, e.g. `src/pages/LoginPage.jsx`:
```jsx
export default function LoginPage() {
  return <div>LoginPage placeholder</div>
}
```
Repeat for `RegisterPage`, `HomePage`, `SearchPage`, `ProductDetailPage`, `CartPage`, `CheckoutPage`, `CheckoutSuccessPage` (matching component/function names to file names).

- [ ] **Step 5: Wire routing in App.jsx**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import CheckoutSuccessPage from './pages/CheckoutSuccessPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

`src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 6: Verify dev server runs and routes resolve**

Run: `npm run dev`
Expected: server starts on localhost; visiting `/`, `/login`, `/cart`, etc. each render their placeholder text with no console errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Scaffold Vite+React+Tailwind project with routing skeleton"
```

---

### Task 2: Design tokens from Figma → Tailwind theme

**Files:**
- Modify: `tailwind.config.js`
- Create: `src/styles/tokens.md` (short human-readable record of extracted values, for reference by later tasks)

**Interfaces:**
- Produces: Tailwind theme extensions (`theme.extend.colors`, `.fontFamily`, `.borderRadius`, `.boxShadow`) that every later component/page task must use instead of arbitrary hard-coded hex values.

- [ ] **Step 1: Pull design variables from Figma**

Call `mcp__plugin_figma_figma__get_variable_defs` with `fileKey: "g5t7sM0rQDvppxhMIyRnAF"`, `nodeId: "16191:42118"` (Home desktop frame — has full-page color/type usage). If the tool returns no variables (styles used instead of variables), fall back to calling `get_design_context` with `fileKey: "g5t7sM0rQDvppxhMIyRnAF"`, `nodeId: "16191:42118"`, `skillNames: "figma-design-to-code"` and read the CSS custom properties / hex values in the returned reference code.

- [ ] **Step 2: Record the extracted tokens**

Write `src/styles/tokens.md` listing: primary color, secondary/accent color, neutral/gray scale, success/error colors, font family name(s), base font sizes, border radius values, and shadow values, each with their exact hex/px value as returned by Figma. This file is a reference for every subsequent task — do not invent values not present in the Figma output.

- [ ] **Step 3: Add them to Tailwind theme**

`tailwind.config.js`, extend `theme.extend` with the exact values recorded in Step 2, e.g.:
```js
theme: {
  extend: {
    colors: {
      primary: { /* shades from tokens.md */ },
      neutral: { /* shades from tokens.md */ },
    },
    fontFamily: {
      sans: ['<FontFamilyFromFigma>', 'sans-serif'],
    },
  },
},
```
(Fill in the placeholders with the literal values captured in Step 2 — do not leave generic Tailwind defaults if Figma specifies a distinct palette/font.)

- [ ] **Step 4: If a custom font is used, load it**

If the font family from Figma is a Google Font, add it via `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=<FontName>:wght@400;500;600;700&display=swap" rel="stylesheet">
```
(Use the exact font name found in Step 1/2.)

- [ ] **Step 5: Verify**

Run: `npm run dev`. Add `className="font-sans text-primary-500"` (or equivalent) temporarily to `HomePage` placeholder, confirm the font and color render as expected, then remove the temporary className.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add Figma-derived design tokens to Tailwind theme"
```

---

### Task 3: Mock product data and currency utility

**Files:**
- Create: `src/data/categories.js`
- Create: `src/data/products.js`
- Create: `src/utils/formatCurrency.js`
- Create: `public/products/` (placeholder product images)

**Interfaces:**
- Produces: `CATEGORIES` (array of `{ id, name }`), `PRODUCTS` (array matching the shape below), `formatCurrency(number): string`. All later pages import from these.

- [ ] **Step 1: Define categories**

`src/data/categories.js`:
```js
export const CATEGORIES = [
  { id: 'mesin', name: 'Mesin' },
  { id: 'kelistrikan', name: 'Kelistrikan' },
  { id: 'body-aksesoris', name: 'Body & Aksesoris' },
  { id: 'oli-pelumas', name: 'Oli & Pelumas' },
  { id: 'ban-velg', name: 'Ban & Velg' },
]
```

- [ ] **Step 2: Generate placeholder product images**

Create 5 simple flat placeholder SVGs (one per category, reused across products in that category), each a colored rectangle with a centered category-icon-style label, e.g. `public/products/mesin.svg`, `public/products/kelistrikan.svg`, `public/products/body-aksesoris.svg`, `public/products/oli-pelumas.svg`, `public/products/ban-velg.svg`. Example `public/products/mesin.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#E2E8F0"/>
  <text x="300" y="300" font-family="sans-serif" font-size="32" fill="#475569" text-anchor="middle" dominant-baseline="middle">Mesin</text>
</svg>
```
Repeat with matching label text for the other 4 categories, using a distinct fill color per category (any 5 distinct neutral/pastel hex values).

- [ ] **Step 3: Define product mock data**

`src/data/products.js`:
```js
export const PRODUCTS = [
  { id: 'p1', name: 'Kampas Rem Depan NHK', brand: 'NHK', price: 85000, category: 'mesin', compatibleWith: ['Honda Vario 125', 'Honda Vario 150'], rating: 4.6, reviewCount: 128, stock: 40, image: '/products/mesin.svg', description: 'Kampas rem depan berkualitas tinggi untuk performa pengereman optimal.' },
  { id: 'p2', name: 'Aki Kering GS Astra', brand: 'GS Astra', price: 320000, category: 'kelistrikan', compatibleWith: ['Yamaha NMAX', 'Yamaha Aerox'], rating: 4.8, reviewCount: 96, stock: 25, image: '/products/kelistrikan.svg', description: 'Aki kering bebas perawatan dengan daya tahan lama.' },
  { id: 'p3', name: 'Spion Custom CNC', brand: 'RCB', price: 145000, category: 'body-aksesoris', compatibleWith: ['Universal'], rating: 4.3, reviewCount: 54, stock: 60, image: '/products/body-aksesoris.svg', description: 'Spion custom bahan aluminium CNC, ringan dan kokoh.' },
  { id: 'p4', name: 'Oli Mesin Shell Advance 10W-40', brand: 'Shell', price: 65000, category: 'oli-pelumas', compatibleWith: ['Universal 4-tak'], rating: 4.7, reviewCount: 210, stock: 100, image: '/products/oli-pelumas.svg', description: 'Oli mesin sintetik untuk perlindungan mesin maksimal.' },
  { id: 'p5', name: 'Ban Tubeless IRC 90/80-14', brand: 'IRC', price: 275000, category: 'ban-velg', compatibleWith: ['Honda Beat', 'Honda Scoopy'], rating: 4.5, reviewCount: 77, stock: 30, image: '/products/ban-velg.svg', description: 'Ban tubeless dengan grip optimal di jalan basah maupun kering.' },
  { id: 'p6', name: 'Busi Iridium NGK', brand: 'NGK', price: 55000, category: 'mesin', compatibleWith: ['Universal'], rating: 4.9, reviewCount: 302, stock: 150, image: '/products/mesin.svg', description: 'Busi iridium untuk pembakaran lebih sempurna dan hemat bahan bakar.' },
  { id: 'p7', name: 'Lampu LED Headlamp H4', brand: 'Osram', price: 195000, category: 'kelistrikan', compatibleWith: ['Universal'], rating: 4.4, reviewCount: 88, stock: 45, image: '/products/kelistrikan.svg', description: 'Lampu LED terang dengan konsumsi daya rendah.' },
  { id: 'p8', name: 'Cover Body Set Racing', brand: 'TDR', price: 450000, category: 'body-aksesoris', compatibleWith: ['Yamaha MX King'], rating: 4.2, reviewCount: 31, stock: 15, image: '/products/body-aksesoris.svg', description: 'Set body cover racing untuk tampilan sporty.' },
  { id: 'p9', name: 'Oli Gardan Yamalube', brand: 'Yamalube', price: 25000, category: 'oli-pelumas', compatibleWith: ['Yamaha Matic'], rating: 4.6, reviewCount: 145, stock: 200, image: '/products/oli-pelumas.svg', description: 'Oli gardan khusus motor matic Yamaha.' },
  { id: 'p10', name: 'Velg Racing Ring 14', brand: 'Rossi', price: 850000, category: 'ban-velg', compatibleWith: ['Honda Beat', 'Honda Vario'], rating: 4.7, reviewCount: 42, stock: 10, image: '/products/ban-velg.svg', description: 'Velg racing ringan dengan desain sporty 3-palang.' },
  { id: 'p11', name: 'Rantai Keteng Honda', brand: 'Honda Genuine', price: 75000, category: 'mesin', compatibleWith: ['Honda Beat', 'Honda Vario'], rating: 4.5, reviewCount: 66, stock: 55, image: '/products/mesin.svg', description: 'Rantai keteng original untuk kelancaran timing mesin.' },
  { id: 'p12', name: 'Kiprok Regulator Rectifier', brand: 'Daytona', price: 165000, category: 'kelistrikan', compatibleWith: ['Universal'], rating: 4.3, reviewCount: 39, stock: 33, image: '/products/kelistrikan.svg', description: 'Kiprok performa tinggi untuk kestabilan pengisian aki.' },
  { id: 'p13', name: 'Handguard Set Universal', brand: 'Acerbis', price: 210000, category: 'body-aksesoris', compatibleWith: ['Universal'], rating: 4.1, reviewCount: 22, stock: 40, image: '/products/body-aksesoris.svg', description: 'Pelindung tangan universal untuk keamanan berkendara.' },
  { id: 'p14', name: 'Grease Multi Purpose', brand: 'AHM', price: 18000, category: 'oli-pelumas', compatibleWith: ['Universal'], rating: 4.4, reviewCount: 58, stock: 120, image: '/products/oli-pelumas.svg', description: 'Gemuk multi fungsi untuk pelumasan komponen bearing dan rantai.' },
  { id: 'p15', name: 'Ban Tubeless Corsa 80/90-14', brand: 'Corsa', price: 230000, category: 'ban-velg', compatibleWith: ['Universal Matic'], rating: 4.2, reviewCount: 29, stock: 50, image: '/products/ban-velg.svg', description: 'Ban tubeless harga terjangkau dengan daya cengkeram baik.' },
]
```

- [ ] **Step 4: Currency formatter**

`src/utils/formatCurrency.js`:
```js
export function formatCurrency(amount) {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID')
}
```

- [ ] **Step 5: Verify**

Run: `node -e "console.log(require('./src/utils/formatCurrency.js'))"` is not valid for ESM — instead temporarily import and console.log `formatCurrency(125000)` inside `HomePage` placeholder, confirm dev console/UI shows `Rp 125.000`, then remove the temporary code.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add mock sparepart product data, categories, and currency formatter"
```

---

### Task 4: Shared UI components (Button, PriceTag, Rating, CategoryChip, QuantitySelector, EmptyState)

**Files:**
- Create: `src/components/ui/Button.jsx`
- Create: `src/components/ui/PriceTag.jsx`
- Create: `src/components/ui/Rating.jsx`
- Create: `src/components/ui/CategoryChip.jsx`
- Create: `src/components/ui/QuantitySelector.jsx`
- Create: `src/components/ui/EmptyState.jsx`

**Interfaces:**
- Consumes: Tailwind tokens from Task 2, `formatCurrency` from Task 3.
- Produces:
  - `Button({ variant: 'primary'|'secondary', children, onClick, type, disabled, className })`
  - `PriceTag({ amount, originalAmount? })`
  - `Rating({ value, reviewCount })`
  - `CategoryChip({ label, active, onClick })`
  - `QuantitySelector({ value, min = 1, max, onChange })`
  - `EmptyState({ title, description, actionLabel?, onAction? })`
  All are default exports consumed by later page/component tasks under these exact prop names.

- [ ] **Step 1: Fetch Figma reference for these atoms**

Call `get_design_context` with `fileKey: "g5t7sM0rQDvppxhMIyRnAF"`, `nodeId: "16191:42118"` (Home desktop — contains Primary Buttons, price, rating, category chip instances), `skillNames: "figma-design-to-code"`. Note the exact padding, radius, font-weight, and color-per-variant for buttons; the star icon and text layout for ratings; the pill shape and active/inactive colors for category chips.

- [ ] **Step 2: Implement Button**

```jsx
export default function Button({ variant = 'primary', children, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full font-medium px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
```
(Replace `primary-500`/`primary-600`/`primary-50` with the actual token names defined in Task 2's Tailwind config, and adjust radius/padding to match the Figma reference from Step 1.)

- [ ] **Step 3: Implement PriceTag, Rating, CategoryChip, QuantitySelector, EmptyState**

```jsx
// PriceTag.jsx
import { formatCurrency } from '../../utils/formatCurrency'
export default function PriceTag({ amount, originalAmount }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-semibold text-neutral-900">{formatCurrency(amount)}</span>
      {originalAmount && originalAmount > amount && (
        <span className="text-sm text-neutral-400 line-through">{formatCurrency(originalAmount)}</span>
      )}
    </div>
  )
}
```
```jsx
// Rating.jsx
export default function Rating({ value, reviewCount }) {
  return (
    <div className="flex items-center gap-1 text-sm text-neutral-600">
      <span aria-hidden>★</span>
      <span>{value.toFixed(1)}</span>
      {reviewCount != null && <span className="text-neutral-400">({reviewCount})</span>}
    </div>
  )
}
```
```jsx
// CategoryChip.jsx
export default function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
        active ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
      }`}
    >
      {label}
    </button>
  )
}
```
```jsx
// QuantitySelector.jsx
export default function QuantitySelector({ value, min = 1, max = 99, onChange }) {
  return (
    <div className="inline-flex items-center border border-neutral-200 rounded-full">
      <button
        type="button"
        className="w-9 h-9 flex items-center justify-center disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >−</button>
      <span className="w-8 text-center">{value}</span>
      <button
        type="button"
        className="w-9 h-9 flex items-center justify-center disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >+</button>
    </div>
  )
}
```
```jsx
// EmptyState.jsx
import Button from './Button'
export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      {description && <p className="text-neutral-500 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="mt-2">{actionLabel}</Button>
      )}
    </div>
  )
}
```
Adjust colors/spacing/radius in all of the above to match the exact values read from the Step 1 reference (do not leave generic guesses if Figma specifies something different).

- [ ] **Step 4: Verify**

Temporarily render each component with sample props inside `HomePage` placeholder, run `npm run dev`, visually confirm they resemble the Figma reference (buttons, chips, rating, quantity stepper), then remove the temporary render code (these get used for real in later page tasks).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add shared UI atoms: Button, PriceTag, Rating, CategoryChip, QuantitySelector, EmptyState"
```

---

### Task 5: ProductCard component

**Files:**
- Create: `src/components/ui/ProductCard.jsx`

**Interfaces:**
- Consumes: `PriceTag`, `Rating` from Task 4; product shape from Task 3.
- Produces: `ProductCard({ product })` — default export, wraps in a `<Link to={`/product/${product.id}`}>`, used by `HomePage` and `SearchPage`.

- [ ] **Step 1: Fetch Figma reference for the product card**

Call `get_design_context` with `fileKey: "g5t7sM0rQDvppxhMIyRnAF"`, `nodeId: "16191:42196"` (a "Section" inside Home desktop containing the product grid), `skillNames: "figma-design-to-code"`. Read the card's image aspect ratio, padding, name/brand/price layout, and rating placement.

- [ ] **Step 2: Implement**

```jsx
import { Link } from 'react-router-dom'
import PriceTag from './PriceTag'
import Rating from './Rating'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-neutral-100 p-3 hover:shadow-md transition-shadow"
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs text-neutral-400">{product.brand}</span>
      <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">{product.name}</h3>
      <Rating value={product.rating} reviewCount={product.reviewCount} />
      <PriceTag amount={product.price} />
    </Link>
  )
}
```
Adjust spacing/radius/typography to match the Step 1 reference exactly.

- [ ] **Step 3: Verify**

Temporarily render `<ProductCard product={PRODUCTS[0]} />` in `HomePage` placeholder, `npm run dev`, confirm it displays the mock product with image, name, rating, price, and links to `/product/p1`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add ProductCard component"
```

---

### Task 6: AuthContext and CartContext

**Files:**
- Create: `src/context/AuthContext.jsx`
- Create: `src/context/CartContext.jsx`
- Modify: `src/App.jsx` (wrap routes with both providers)

**Interfaces:**
- Produces:
  - `AuthProvider`, `useAuth()` → `{ isLoggedIn, login(), logout() }`
  - `CartProvider`, `useCart()` → `{ items: [{ productId, qty }], addItem(productId, qty=1), updateQty(productId, qty), removeItem(productId), clearCart(), subtotal, itemCount }`
  All later pages consume via these two hooks.

- [ ] **Step 1: Implement AuthContext**

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('auth') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('auth', String(isLoggedIn))
  }, [isLoggedIn])

  const login = () => setIsLoggedIn(true)
  const logout = () => setIsLoggedIn(false)

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

- [ ] **Step 2: Implement CartContext**

```jsx
// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PRODUCTS } from '../data/products'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem('cart')
    return raw ? JSON.parse(raw) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (productId, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) => i.productId === productId ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { productId, qty }]
    })
  }

  const updateQty = (productId, qty) => {
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, qty } : i))
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => {
      const product = PRODUCTS.find((p) => p.id === i.productId)
      return product ? sum + product.price * i.qty : sum
    }, 0)
  }, [items])

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
```

- [ ] **Step 3: Wrap App with both providers**

`src/App.jsx` — wrap the existing `<Routes>` block:
```jsx
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
// ...
return (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* existing routes unchanged */}
        </Routes>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
)
```

- [ ] **Step 4: Verify**

Temporarily call `useCart().addItem('p1')` and render `useCart().itemCount` in `HomePage` placeholder, `npm run dev`, click to add, confirm the count increments and persists across a page reload (localStorage). Remove temporary code afterward.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add AuthContext and CartContext with localStorage persistence"
```

---

### Task 7: Nav and Footer layout components

**Files:**
- Create: `src/components/layout/Nav.jsx`
- Create: `src/components/layout/Footer.jsx`

**Interfaces:**
- Consumes: `useAuth`, `useCart` from Task 6.
- Produces: `Nav()` (no props — reads context directly), `Footer()`. Used by every page task from here on.

- [ ] **Step 1: Fetch Figma reference**

Call `get_design_context` with `fileKey: "g5t7sM0rQDvppxhMIyRnAF"`, `nodeId: "16197:23508"` (Nav instance used across Home desktop), `skillNames: "figma-design-to-code"`, and separately `nodeId: "16205:24109"` (Footer, mobile Detail Products section) for footer structure. Download logo/icon assets referenced (search icon, cart icon, logo) into `src/assets/nav/`.

- [ ] **Step 2: Implement Nav**

```jsx
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export default function Nav() {
  const { itemCount } = useCart()
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between px-4 lg:px-16 py-4 border-b border-neutral-100">
      <Link to="/" className="font-bold text-lg text-neutral-900">MotoPart</Link>
      <nav className="hidden lg:flex items-center gap-6 text-sm text-neutral-600">
        <Link to="/">Home</Link>
        <Link to="/search">Cari Produk</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/search" aria-label="Search">🔍</Link>
        <Link to="/cart" className="relative" aria-label="Cart">
          🛒
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
        {isLoggedIn ? (
          <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-neutral-600">Logout</button>
        ) : (
          <Link to="/login" className="text-sm text-neutral-600">Login</Link>
        )}
      </div>
    </header>
  )
}
```
Replace the 🔍/🛒 emoji placeholders with the actual downloaded icon assets from Step 1 (`<img src="...">`), and match spacing/colors to the Figma reference.

- [ ] **Step 3: Implement Footer**

```jsx
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-100 px-4 lg:px-16 py-10 text-sm text-neutral-500">
      <p>© {new Date().getFullYear()} MotoPart. Prototype for demo purposes only.</p>
    </footer>
  )
}
```
Adjust layout/columns to match the Figma footer reference from Step 1 if it has more structure (e.g. link columns) — reproduce that structure with dummy links (`href="#"`).

- [ ] **Step 4: Verify**

Render `<Nav />` and `<Footer />` in `HomePage` placeholder, `npm run dev`, confirm cart badge shows correct count and login/logout link toggles based on `AuthContext` state (toggle manually via temporary button).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add Nav and Footer layout components"
```

---

### Task 8: Login and Register pages

**Files:**
- Modify: `src/pages/LoginPage.jsx`
- Modify: `src/pages/RegisterPage.jsx`

**Interfaces:**
- Consumes: `useAuth` (Task 6), `Button` (Task 4).
- Produces: fully implemented `/login` and `/register` routes.

- [ ] **Step 1: Fetch Figma references**

Desktop Login: `nodeId: "16191:40659"`. Mobile Login: `nodeId: "16192:46838"`. Desktop Register: `nodeId: "16191:40692"`. Mobile Register: `nodeId: "16192:46871"`. Call `get_design_context` for each (`fileKey: "g5t7sM0rQDvppxhMIyRnAF"`, `skillNames: "figma-design-to-code"`). Download the hero/illustration image and any brand logo assets into `src/assets/auth/`.

- [ ] **Step 2: Implement LoginPage**

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Email dan password wajib diisi')
      return
    }
    login()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:block lg:w-1/2 bg-neutral-100">
        {/* replace with the downloaded hero image asset from Figma, sized to match the reference exactly */}
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-neutral-900">Masuk ke akun Anda</h1>
          <p className="text-neutral-500">Belum punya akun? <Link to="/register" className="text-primary-500 font-medium">Daftar</Link></p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-neutral-200 rounded-xl px-4 py-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-neutral-200 rounded-xl px-4 py-3"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="primary">Masuk</Button>
        </form>
      </div>
    </div>
  )
}
```
Adjust the layout, image container sizing, input styling, and copy positioning to match the desktop (`16191:40659`) and mobile (`16192:46838`) Figma references exactly (mobile: stack vertically, hide the side image per the mobile frame's actual layout — verify against the mobile reference rather than assuming).

- [ ] **Step 3: Implement RegisterPage**

Same structure as LoginPage but with additional name field and calling `login()` on submit as well (dummy — no separate account storage needed per spec):
```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Semua field wajib diisi')
      return
    }
    login()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:block lg:w-1/2 bg-neutral-100" />
      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-neutral-900">Buat akun baru</h1>
          <p className="text-neutral-500">Sudah punya akun? <Link to="/login" className="text-primary-500 font-medium">Masuk</Link></p>
          <input type="text" placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} className="border border-neutral-200 rounded-xl px-4 py-3" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-neutral-200 rounded-xl px-4 py-3" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-neutral-200 rounded-xl px-4 py-3" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="primary">Daftar</Button>
        </form>
      </div>
    </div>
  )
}
```
Match to the `16191:40692` (desktop) / `16192:46871` (mobile) references.

- [ ] **Step 4: Verify**

Run `npm run dev`, visit `/login` at 1440px and 393px widths, compare to Figma screenshots for both node IDs; submit with empty fields (see error), then fill and submit (redirects to `/`, Nav should now show "Logout"). Repeat for `/register`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Implement Login and Register pages matching Figma"
```

---

### Task 9: Home page

**Files:**
- Modify: `src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `Nav`, `Footer` (Task 7), `ProductCard`, `CategoryChip`, `Button` (Tasks 4/5), `CATEGORIES`, `PRODUCTS` (Task 3).

- [ ] **Step 1: Fetch Figma references**

Desktop: `nodeId: "16191:42118"` (full Home page, desktop). Mobile: `nodeId: "16209:41643"` (full Home page, mobile). Call `get_design_context` for both (`fileKey: "g5t7sM0rQDvppxhMIyRnAF"`, `skillNames: "figma-design-to-code"`). Download hero banner image/illustration assets into `src/assets/home/`.

- [ ] **Step 2: Implement**

```jsx
import { useState } from 'react'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import CategoryChip from '../components/ui/CategoryChip'
import ProductCard from '../components/ui/ProductCard'
import Button from '../components/ui/Button'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS } from '../data/products'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState(null)

  const filtered = activeCategory
    ? PRODUCTS.filter((p) => p.category === activeCategory)
    : PRODUCTS

  return (
    <div>
      <Nav />
      <section className="px-4 lg:px-16 py-10 lg:py-20 bg-neutral-50 flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl lg:text-5xl font-bold text-neutral-900">Sparepart Motor Original & Berkualitas</h1>
          <p className="text-neutral-500 max-w-md">Temukan kebutuhan sparepart motor Anda, dari mesin sampai aksesoris, semua ada di sini.</p>
          <Link to="/search"><Button variant="primary">Belanja Sekarang</Button></Link>
        </div>
        <div className="flex-1">
          {/* replace with the downloaded hero image asset, sized to match the Figma hero container */}
        </div>
      </section>

      <section className="px-4 lg:px-16 py-8 flex gap-3 overflow-x-auto">
        <CategoryChip label="Semua" active={!activeCategory} onClick={() => setActiveCategory(null)} />
        {CATEGORIES.map((c) => (
          <CategoryChip key={c.id} label={c.name} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)} />
        ))}
      </section>

      <section className="px-4 lg:px-16 py-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Produk Pilihan</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <Footer />
    </div>
  )
}
```
Match section spacing, grid column count, hero layout proportions, and copy tone to the desktop (`16191:42118`) and mobile (`16209:41643`) references exactly — the mobile reference likely uses a single/double column grid and stacked hero; verify rather than assume.

- [ ] **Step 3: Verify**

`npm run dev`, visit `/` at 1440px and 393px, compare to Figma screenshots for both node IDs. Click a category chip and confirm the grid filters. Click a product card and confirm it navigates to `/product/:id` (will 404-style render the placeholder ProductDetailPage until Task 11).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Implement Home page matching Figma"
```

---

### Task 10: Search page (input + filters + results)

**Files:**
- Modify: `src/pages/SearchPage.jsx`

**Interfaces:**
- Consumes: `Nav`, `Footer`, `ProductCard`, `CategoryChip`, `EmptyState`, `CATEGORIES`, `PRODUCTS`.

- [ ] **Step 1: Fetch Figma references**

Desktop initial state: `nodeId: "16191:50061"`. Desktop results: `nodeId: "16191:50258"`. Mobile initial: `nodeId: "16197:18200"`. Mobile results: `nodeId: "16218:32192"`. Call `get_design_context` for all four (`fileKey: "g5t7sM0rQDvppxhMIyRnAF"`, `skillNames: "figma-design-to-code"`).

- [ ] **Step 2: Implement**

```jsx
import { useMemo, useState } from 'react'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import CategoryChip from '../components/ui/CategoryChip'
import ProductCard from '../components/ui/ProductCard'
import EmptyState from '../components/ui/EmptyState'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS } from '../data/products'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)

  const results = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = !activeCategory || p.category === activeCategory
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategory])

  return (
    <div>
      <Nav />
      <section className="px-4 lg:px-16 py-8">
        <input
          type="text"
          placeholder="Cari sparepart, brand, atau kompatibilitas motor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-neutral-200 rounded-full px-5 py-3"
        />
      </section>
      <section className="px-4 lg:px-16 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
          <CategoryChip label="Semua" active={!activeCategory} onClick={() => setActiveCategory(null)} />
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.id} label={c.name} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)} />
          ))}
        </aside>
        <div className="flex-1 pb-16">
          {results.length === 0 ? (
            <EmptyState title="Produk tidak ditemukan" description="Coba kata kunci atau kategori lain." />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}
```
Match the filter sidebar layout (desktop: left column per `16191:50258`'s "Filters Container"; mobile: likely a horizontal scroll or a filter-sheet toggle per `16218:32192` — verify against reference) and the search-input placement/styling from `16191:50061`/`16197:18200`.

- [ ] **Step 3: Verify**

`npm run dev`, visit `/search` at both breakpoints, type a query that matches (e.g. "oli") and one that matches nothing (confirm EmptyState shows), toggle a category chip, compare layout to the four Figma references.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Implement Search page with query and category filtering"
```

---

### Task 11: Product Detail page

**Files:**
- Modify: `src/pages/ProductDetailPage.jsx`

**Interfaces:**
- Consumes: `Nav`, `Footer`, `Rating`, `PriceTag`, `QuantitySelector`, `Button`, `useCart`, `PRODUCTS`.
- Produces: "Tambah ke Keranjang" (calls `addItem`, stays on page) and "Beli Sekarang" (calls `addItem` then `navigate('/cart')`) buttons.

- [ ] **Step 1: Fetch Figma references**

Desktop: `nodeId: "16192:23139"` (Detail Products - Overview, desktop). Mobile: `nodeId: "16197:27972"` (Detail Products - Overview, mobile). Call `get_design_context` for both.

- [ ] **Step 2: Implement**

```jsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import Rating from '../components/ui/Rating'
import PriceTag from '../components/ui/PriceTag'
import QuantitySelector from '../components/ui/QuantitySelector'
import Button from '../components/ui/Button'
import { useCart } from '../context/CartContext'
import { PRODUCTS } from '../data/products'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)

  const product = PRODUCTS.find((p) => p.id === id)

  if (!product) {
    navigate('/')
    return null
  }

  return (
    <div>
      <Nav />
      <section className="px-4 lg:px-16 py-8 flex flex-col lg:flex-row gap-10">
        <div className="lg:w-1/2 aspect-square rounded-2xl overflow-hidden bg-neutral-100">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="lg:w-1/2 flex flex-col gap-4">
          <span className="text-sm text-neutral-400">{product.brand}</span>
          <h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
          <Rating value={product.rating} reviewCount={product.reviewCount} />
          <PriceTag amount={product.price} />
          <p className="text-neutral-600">{product.description}</p>
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-2">Kompatibel dengan:</h3>
            <ul className="flex flex-wrap gap-2">
              {product.compatibleWith.map((m) => (
                <li key={m} className="text-xs bg-neutral-100 rounded-full px-3 py-1">{m}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-4">
            <QuantitySelector value={qty} max={product.stock} onChange={setQty} />
            <span className="text-sm text-neutral-400">Stok: {product.stock}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => addItem(product.id, qty)}>Tambah ke Keranjang</Button>
            <Button variant="primary" onClick={() => { addItem(product.id, qty); navigate('/cart') }}>Beli Sekarang</Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
```
Match image gallery layout (if the Figma reference has multiple thumbnail images, reproduce a thumbnail strip using the same `product.image` repeated, since mock data has one image per product), section order, and typography scale to the desktop/mobile references.

- [ ] **Step 3: Verify**

`npm run dev`, visit `/product/p1` at both breakpoints, compare to Figma screenshots. Click "Tambah ke Keranjang" and confirm Nav's cart badge increments without navigating away. Click "Beli Sekarang" and confirm it navigates to `/cart` with the item present.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Implement Product Detail page matching Figma"
```

---

### Task 12: Cart page with delete-confirmation modal

**Files:**
- Modify: `src/pages/CartPage.jsx`
- Create: `src/components/cart/ConfirmDeleteModal.jsx`

**Interfaces:**
- Consumes: `useCart`, `PRODUCTS`, `QuantitySelector`, `PriceTag`, `Button`, `EmptyState`.
- Produces: `ConfirmDeleteModal({ open, onConfirm, onCancel, itemLabel })`.

- [ ] **Step 1: Fetch Figma references**

Desktop empty: `nodeId: "16192:25535"`. Desktop with items: `nodeId: "16192:25701"` ("Cart - Default"). Desktop delete-one confirm: `nodeId: "16192:26275"`. Mobile empty: `nodeId: "16209:35893"`. Mobile with items: `nodeId: "16209:40594"`. Mobile delete-one confirm: `nodeId: "16209:41369"`. Call `get_design_context` for each.

- [ ] **Step 2: Implement ConfirmDeleteModal**

```jsx
import Button from '../ui/Button'

export default function ConfirmDeleteModal({ open, onConfirm, onCancel, itemLabel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-neutral-900">Hapus produk?</h3>
        <p className="text-neutral-500">Yakin ingin menghapus {itemLabel} dari keranjang?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>Batal</Button>
          <Button variant="primary" onClick={onConfirm}>Hapus</Button>
        </div>
      </div>
    </div>
  )
}
```
Match the modal's exact copy, button order, and styling to the `16192:26275`/`16209:41369` reference.

- [ ] **Step 3: Implement CartPage**

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import QuantitySelector from '../components/ui/QuantitySelector'
import PriceTag from '../components/ui/PriceTag'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDeleteModal from '../components/cart/ConfirmDeleteModal'
import { useCart } from '../context/CartContext'
import { PRODUCTS } from '../data/products'
import { formatCurrency } from '../utils/formatCurrency'

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart()
  const navigate = useNavigate()
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const cartRows = items
    .map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.productId) }))
    .filter((row) => row.product)

  const pendingProduct = PRODUCTS.find((p) => p.id === pendingDeleteId)

  return (
    <div>
      <Nav />
      <section className="px-4 lg:px-16 py-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Keranjang Belanja</h1>
        {cartRows.length === 0 ? (
          <EmptyState
            title="Keranjang Anda kosong"
            description="Yuk cari sparepart yang Anda butuhkan."
            actionLabel="Cari Produk"
            onAction={() => navigate('/search')}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-4">
              {cartRows.map(({ productId, qty, product }) => (
                <div key={productId} className="flex items-center gap-4 border border-neutral-100 rounded-2xl p-4">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl bg-neutral-100" />
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900">{product.name}</h3>
                    <PriceTag amount={product.price} />
                  </div>
                  <QuantitySelector value={qty} max={product.stock} onChange={(q) => updateQty(productId, q)} />
                  <button onClick={() => setPendingDeleteId(productId)} className="text-sm text-red-500">Hapus</button>
                </div>
              ))}
            </div>
            <div className="lg:w-80 border border-neutral-100 rounded-2xl p-6 h-fit flex flex-col gap-4">
              <h2 className="font-semibold text-neutral-900">Ringkasan Belanja</h2>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between font-semibold text-neutral-900 border-t border-neutral-100 pt-4">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Button variant="primary" onClick={() => navigate('/checkout')}>Checkout</Button>
              <Link to="/search" className="text-sm text-center text-primary-500">Lanjut Belanja</Link>
            </div>
          </div>
        )}
      </section>
      <Footer />
      <ConfirmDeleteModal
        open={!!pendingDeleteId}
        itemLabel={pendingProduct?.name}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => { removeItem(pendingDeleteId); setPendingDeleteId(null) }}
      />
    </div>
  )
}
```
Match row layout, summary card placement (desktop: side-by-side per `16192:25701`; mobile: likely a bottom sheet/stacked summary per `16209:40594` — verify) to the references from Step 1.

- [ ] **Step 4: Verify**

`npm run dev`. With an empty cart, visit `/cart` and confirm the empty state (compare to `16192:25535`/`16209:35893`). Add 2 different products via Product Detail, revisit `/cart`, confirm both rows, adjust quantity, confirm subtotal updates, click "Hapus" on one row, confirm the modal appears (compare to `16192:26275`/`16209:41369`), confirm deletion works, and click "Checkout" navigates to `/checkout`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Implement Cart page with quantity update and delete confirmation"
```

---

### Task 13: Checkout stepper (Shipping → Delivery → Payment → Review)

**Files:**
- Modify: `src/pages/CheckoutPage.jsx`
- Create: `src/pages/checkout/ShippingStep.jsx`
- Create: `src/pages/checkout/DeliveryStep.jsx`
- Create: `src/pages/checkout/PaymentStep.jsx`
- Create: `src/pages/checkout/ReviewStep.jsx`

**Interfaces:**
- Consumes: `useCart`, `PRODUCTS`, `Button`, `PriceTag`, `formatCurrency`.
- Produces: `CheckoutPage` owns `step` state (`'shipping'|'delivery'|'payment'|'review'`) and the shared form-data object `{ address, deliveryMethod, paymentMethod }`, passed down as props `{ data, onChange, onNext, onBack }` to each step component. `ReviewStep` receives an additional `onConfirm` prop that clears the cart and navigates to `/checkout/success`.

- [ ] **Step 1: Fetch Figma references**

Desktop: Shipping `16192:26519`, Add Address modal `16192:26610`, Delivery `16192:26725`, Payment `16192:26809`, Review `16192:26922`. Mobile: Shipping `16209:31025`, Add Address `16209:33364`, Delivery `16209:34108`, Payment `16209:34349`, Review `16209:34679`. Call `get_design_context` for each of these 10 (fileKey `g5t7sM0rQDvppxhMIyRnAF`).

- [ ] **Step 2: Implement CheckoutPage (stepper shell)**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import { useCart } from '../context/CartContext'
import ShippingStep from './checkout/ShippingStep'
import DeliveryStep from './checkout/DeliveryStep'
import PaymentStep from './checkout/PaymentStep'
import ReviewStep from './checkout/ReviewStep'
import { generateOrderNumber } from '../utils/orderNumber'

const STEPS = ['shipping', 'delivery', 'payment', 'review']

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [step, setStep] = useState('shipping')
  const [data, setData] = useState({
    address: { name: '', phone: '', fullAddress: '' },
    deliveryMethod: null,
    paymentMethod: null,
  })

  const stepIndex = STEPS.indexOf(step)
  const goNext = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)])
  const goBack = () => setStep(STEPS[Math.max(stepIndex - 1, 0)])

  const handleChange = (patch) => setData((prev) => ({ ...prev, ...patch }))

  const handleConfirm = () => {
    const orderNumber = generateOrderNumber()
    clearCart()
    navigate('/checkout/success', { state: { orderNumber } })
  }

  return (
    <div>
      <Nav />
      <section className="px-4 lg:px-16 py-8">
        <ol className="flex gap-4 text-sm text-neutral-400 mb-8">
          {STEPS.map((s, i) => (
            <li key={s} className={i === stepIndex ? 'text-primary-500 font-medium' : ''}>{i + 1}. {s}</li>
          ))}
        </ol>
        {step === 'shipping' && <ShippingStep data={data} onChange={handleChange} onNext={goNext} />}
        {step === 'delivery' && <DeliveryStep data={data} onChange={handleChange} onNext={goNext} onBack={goBack} />}
        {step === 'payment' && <PaymentStep data={data} onChange={handleChange} onNext={goNext} onBack={goBack} />}
        {step === 'review' && <ReviewStep data={data} onBack={goBack} onConfirm={handleConfirm} />}
      </section>
      <Footer />
    </div>
  )
}
```
Match the stepper indicator's exact visual style to the Figma reference (all 4 desktop frames share a consistent header/stepper — extract it once from any of them, e.g. `16192:26519`).

- [ ] **Step 3: Implement ShippingStep**

```jsx
import Button from '../../components/ui/Button'

export default function ShippingStep({ data, onChange, onNext }) {
  const { address } = data

  function handleSubmit(e) {
    e.preventDefault()
    if (!address.name || !address.phone || !address.fullAddress) return
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-neutral-900">Alamat Pengiriman</h2>
      <input
        placeholder="Nama penerima"
        value={address.name}
        onChange={(e) => onChange({ address: { ...address, name: e.target.value } })}
        className="border border-neutral-200 rounded-xl px-4 py-3"
      />
      <input
        placeholder="Nomor telepon"
        value={address.phone}
        onChange={(e) => onChange({ address: { ...address, phone: e.target.value } })}
        className="border border-neutral-200 rounded-xl px-4 py-3"
      />
      <textarea
        placeholder="Alamat lengkap"
        value={address.fullAddress}
        onChange={(e) => onChange({ address: { ...address, fullAddress: e.target.value } })}
        className="border border-neutral-200 rounded-xl px-4 py-3"
        rows={3}
      />
      <Button type="submit" variant="primary">Lanjut ke Pengiriman</Button>
    </form>
  )
}
```
Match to `16192:26519` (desktop) / `16209:31025` (mobile); reproduce the "Add Shipping Address" pattern (`16192:26610`/`16209:33364`) as this same inline form (a modal isn't required for the prototype — inline is an acceptable simplification of that Figma state, but field set and labels must match).

- [ ] **Step 4: Implement DeliveryStep**

```jsx
import Button from '../../components/ui/Button'

const DELIVERY_OPTIONS = [
  { id: 'reguler', label: 'Reguler (2-3 hari)', price: 15000 },
  { id: 'express', label: 'Express (1 hari)', price: 35000 },
]

export default function DeliveryStep({ data, onChange, onNext, onBack }) {
  return (
    <div className="max-w-lg flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-neutral-900">Metode Pengiriman</h2>
      {DELIVERY_OPTIONS.map((opt) => (
        <label key={opt.id} className="flex items-center gap-3 border border-neutral-200 rounded-xl px-4 py-3 cursor-pointer">
          <input
            type="radio"
            name="delivery"
            checked={data.deliveryMethod === opt.id}
            onChange={() => onChange({ deliveryMethod: opt.id })}
          />
          <span className="flex-1">{opt.label}</span>
          <span className="text-neutral-500">Rp {opt.price.toLocaleString('id-ID')}</span>
        </label>
      ))}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Kembali</Button>
        <Button variant="primary" disabled={!data.deliveryMethod} onClick={onNext}>Lanjut ke Pembayaran</Button>
      </div>
    </div>
  )
}
```
Match option list styling and copy to `16192:26725`/`16209:34108`.

- [ ] **Step 5: Implement PaymentStep**

```jsx
import Button from '../../components/ui/Button'

const PAYMENT_OPTIONS = [
  { id: 'transfer', label: 'Transfer Bank' },
  { id: 'cod', label: 'Bayar di Tempat (COD)' },
  { id: 'ewallet', label: 'E-Wallet' },
]

export default function PaymentStep({ data, onChange, onNext, onBack }) {
  return (
    <div className="max-w-lg flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-neutral-900">Metode Pembayaran</h2>
      {PAYMENT_OPTIONS.map((opt) => (
        <label key={opt.id} className="flex items-center gap-3 border border-neutral-200 rounded-xl px-4 py-3 cursor-pointer">
          <input
            type="radio"
            name="payment"
            checked={data.paymentMethod === opt.id}
            onChange={() => onChange({ paymentMethod: opt.id })}
          />
          <span className="flex-1">{opt.label}</span>
        </label>
      ))}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Kembali</Button>
        <Button variant="primary" disabled={!data.paymentMethod} onClick={onNext}>Lanjut ke Review</Button>
      </div>
    </div>
  )
}
```
Match to `16192:26809`/`16209:34349` (this reference may also show a "Promo code" field per the metadata — add a disabled/non-functional promo code input if the reference shows one, since it's part of the visual layout).

- [ ] **Step 6: Implement ReviewStep**

```jsx
import Button from '../../components/ui/Button'
import { useCart } from '../../context/CartContext'
import { PRODUCTS } from '../../data/products'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ReviewStep({ data, onBack, onConfirm }) {
  const { items, subtotal } = useCart()
  const rows = items
    .map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.productId) }))
    .filter((r) => r.product)

  return (
    <div className="max-w-lg flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-neutral-900">Review Pesanan</h2>
      <div className="border border-neutral-100 rounded-xl p-4 flex flex-col gap-2 text-sm text-neutral-600">
        <p><strong>{data.address.name}</strong> — {data.address.phone}</p>
        <p>{data.address.fullAddress}</p>
      </div>
      {rows.map(({ productId, qty, product }) => (
        <div key={productId} className="flex justify-between text-sm">
          <span>{product.name} x{qty}</span>
          <span>{formatCurrency(product.price * qty)}</span>
        </div>
      ))}
      <div className="flex justify-between font-semibold text-neutral-900 border-t border-neutral-100 pt-4">
        <span>Total</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Kembali</Button>
        <Button variant="primary" onClick={onConfirm}>Konfirmasi Pesanan</Button>
      </div>
    </div>
  )
}
```
Match to `16192:26922`/`16209:34679`.

- [ ] **Step 7: Add order number utility**

`src/utils/orderNumber.js`:
```js
export function generateOrderNumber() {
  const suffix = Array.from({ length: 8 }, () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase()
  return `ORD-${suffix}`
}
```

- [ ] **Step 8: Verify**

`npm run dev`, add items to cart, go to `/checkout`, step through Shipping (try submitting empty → blocked) → Delivery → Payment → Review, compare each step's layout to its desktop/mobile Figma reference, click "Konfirmasi Pesanan" and confirm navigation to `/checkout/success` with an empty cart afterward.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Implement multi-step Checkout flow matching Figma"
```

---

### Task 14: Checkout Success page

**Files:**
- Modify: `src/pages/CheckoutSuccessPage.jsx`

**Interfaces:**
- Consumes: `useLocation` (React Router) to read `state.orderNumber` passed from Task 13's `handleConfirm`.

- [ ] **Step 1: Fetch Figma references**

Desktop: `nodeId: "16192:27242"` (Checkout - Success). Mobile: `nodeId: "16209:35828"`. Call `get_design_context` for both.

- [ ] **Step 2: Implement**

```jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

export default function CheckoutSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderNumber = location.state?.orderNumber

  if (!orderNumber) {
    navigate('/')
    return null
  }

  return (
    <div>
      <Nav />
      <section className="px-4 lg:px-16 py-20 flex flex-col items-center text-center gap-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Pesanan Berhasil Dibuat!</h1>
        <p className="text-neutral-500">Nomor pesanan Anda:</p>
        <p className="text-lg font-mono font-semibold text-primary-500">{orderNumber}</p>
        <p className="text-neutral-500 max-w-md">Terima kasih telah berbelanja. Kami akan segera memproses pesanan Anda.</p>
        <Link to="/"><Button variant="primary">Kembali ke Home</Button></Link>
      </section>
      <Footer />
    </div>
  )
}
```
Match illustration/icon (download the success checkmark/illustration asset from the Figma reference into `src/assets/checkout/`) and copy layout to `16192:27242`/`16209:35828`.

- [ ] **Step 3: Verify**

`npm run dev`, complete the full flow from `/login` through checkout confirmation, confirm the success page shows a generated order number and that navigating there directly (without state, e.g. by pasting the URL) redirects to `/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Implement Checkout Success page matching Figma"
```

---

### Task 15: Full end-to-end manual QA pass

**Files:** none (verification-only task)

**Interfaces:** none — this task exercises everything built in Tasks 1-14.

- [ ] **Step 1: Fresh-state walkthrough at desktop width (1440px)**

Clear `localStorage`, `npm run dev`, and walk the full path: `/login` (submit dummy credentials) → Home (browse, filter by category) → Search (search + filter) → Product Detail (add to cart) → Cart (adjust qty, delete an item, re-add) → Checkout (all 4 steps) → Success page. Confirm no console errors at any step.

- [ ] **Step 2: Repeat at mobile width (393px)**

Same walkthrough using browser dev tools device toolbar set to 393px width. Confirm every page's mobile layout matches its corresponding mobile Figma node (all node IDs referenced in Tasks 8-14).

- [ ] **Step 3: Fix any visual discrepancies found**

For each discrepancy noted in Steps 1-2, re-fetch the relevant `get_design_context` node and adjust the specific component/page file, then re-verify visually.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "Final QA pass: fix visual discrepancies across full purchase flow"
```

---

## Self-Review Notes

- **Spec coverage:** Login/Register (Task 8), Home (Task 9), Search (Task 10), Product Detail (Task 11), Cart incl. delete confirm (Task 12), Checkout incl. address/delivery/payment/review (Task 13), Order Confirmation (Task 14), responsive desktop+mobile (every page task references both node IDs), mock data/no backend (Tasks 3, 6), currency formatting (Task 3), design token fidelity (Task 2) — all spec sections are covered.
- **Type consistency:** `useCart()` shape (`items`, `addItem`, `updateQty`, `removeItem`, `clearCart`, `subtotal`, `itemCount`) is defined once in Task 6 and used identically in Tasks 7, 9, 11, 12, 13. `useAuth()` shape (`isLoggedIn`, `login`, `logout`) defined in Task 6, used identically in Tasks 7, 8. Product shape defined in Task 3 matches every consumer (`ProductCard`, `CartPage`, `ProductDetailPage`, `ReviewStep`).
- **No placeholders:** every code step contains literal runnable code; every Figma reference step names an exact `nodeId`; the only intentionally-deferred detail is exact hex/token values in Task 2 (which requires a live Figma tool call to obtain, not guessable in advance) and exact illustration/hero image assets (which requires downloading real Figma exports, per the Global Constraints — not invented content).
