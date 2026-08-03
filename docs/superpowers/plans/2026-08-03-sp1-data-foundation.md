# SP1 — Shared Data & Domain Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single reactive, localStorage-persisted store (`StoreProvider`) seeded from data files that both the customer storefront and the admin workspace will read/write, and refactor the existing Auth & Cart onto it so the app stays runnable.

**Architecture:** One `StoreProvider` React Context holds the whole domain data object in state, initialized from a seed module and auto-persisted to `localStorage` under `dmb:data`. Domain reads/writes go through hooks (`useProducts`, `useOrders`, …). `AuthProvider` and `CartProvider` nest inside it and read live data from the store. No new pages are built; existing pages must simply keep working.

**Tech Stack:** React 19, Vite 8, React Router 7, Tailwind 3. Plain JS (ESM), React Context + `localStorage`. No new dependencies.

## Global Constraints

- Front-end-only POC prototype for showcase — no real backend, no live Midtrans/Biteship/Google SSO. Everything simulated client-side. Favor "visibly works for a demo" over backend correctness.
- No new runtime dependencies. No test framework is added; pure-logic files are verified with `node`, React/integration with the dev server + browser console.
- localStorage keys (exact): `dmb:data`, `dmb:auth`, `dmb:cart`.
- Order `status` is exactly one of these 6 strings (verbatim): `'Menunggu pembayaran'`, `'Sedang diproses'`, `'Siap dikirim'`, `'Dalam pengiriman'`, `'Selesai'`, `'Refund diproses'`.
- Currency is always rendered via the existing `src/utils/formatCurrency.js`.
- Existing pages (Home, Search, Product Detail, Cart, Checkout, Login, Register, Success) must not error after this plan. They are NOT reshaped here (that is SP2).
- All commands are run from the repo root `/Users/macbook/sparepart-motor-shop`.

---

## File Structure

- `src/data/products.js` — **modify**: extend all 15 products with new fields.
- `src/data/categories.js` — unchanged.
- `src/data/users.js` — **create**: 2 seed users.
- `src/data/promos.js` — **create**: promo codes.
- `src/data/shipping.js` — **create**: couriers + services.
- `src/data/homepage.js` — **create**: banners, featured ids, testimonials.
- `src/store/seed.js` — **create**: assemble `SEED`, `VERSION`, pure `shouldReseed`, and `loadData`/`saveData`/`clearData` localStorage helpers.
- `src/store/StoreProvider.jsx` — **create**: context, state, persistence, mutations.
- `src/store/hooks.js` — **create**: `useStore` + domain read hooks.
- `src/context/AuthContext.jsx` — **modify**: `currentUser` + auth API backed by the store.
- `src/context/CartContext.jsx` — **modify**: subtotal computed from store products.
- `src/App.jsx` — **modify**: wrap providers with `StoreProvider`.
- `src/pages/LoginPage.jsx` — **modify**: call new auth API.
- `src/pages/RegisterPage.jsx` — **modify**: call new auth API.

---

## Task 1: Seed data files

**Files:**
- Modify: `src/data/products.js`
- Create: `src/data/users.js`, `src/data/promos.js`, `src/data/shipping.js`, `src/data/homepage.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `PRODUCTS: Product[]` (15 items) with fields `id, sku, name, brand, category, price, stock, images: string[], videoUrl: string, description, compatibleWith: string[], rating, reviewCount, testimonials: {id,author,rating,text,date}[], published: boolean, isFeatured: boolean, createdAt: string`.
  - `USERS: User[]` with `id, name, email, phone, password, provider, addresses: Address[], defaultAddressId`.
  - `PROMOS: Promo[]` with `code, type, value, minSpend, active`.
  - `SHIPPING: { couriers: {id,name,services:{id,name,cost,etaLabel}[]}[] }`.
  - `HOMEPAGE: { banners:[], featuredProductIds: string[], testimonials:[] }`.

- [ ] **Step 1: Replace `src/data/products.js` with the extended seed**

```js
export const PRODUCTS = [
  { id: 'p1', sku: 'NHK-MSN-001', name: 'Kampas Rem Depan NHK', brand: 'NHK', price: 85000, category: 'mesin', compatibleWith: ['Honda Vario 125', 'Honda Vario 150'], rating: 4.6, reviewCount: 128, stock: 40, images: ['/products/mesin.svg', '/products/mesin.svg'], videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Kampas rem depan berkualitas tinggi untuk performa pengereman optimal.', testimonials: [ { id: 't1', author: 'Andi', rating: 5, text: 'Pakem banget, pemasangan gampang.', date: '2026-06-12' }, { id: 't2', author: 'Rudi', rating: 4, text: 'Kualitas oke buat harga segini.', date: '2026-06-20' } ], published: true, isFeatured: true, createdAt: '2026-05-01' },
  { id: 'p2', sku: 'GSA-KLS-002', name: 'Aki Kering GS Astra', brand: 'GS Astra', price: 320000, category: 'kelistrikan', compatibleWith: ['Yamaha NMAX', 'Yamaha Aerox'], rating: 4.8, reviewCount: 96, stock: 25, images: ['/products/kelistrikan.svg', '/products/kelistrikan.svg'], videoUrl: '', description: 'Aki kering bebas perawatan dengan daya tahan lama.', testimonials: [], published: true, isFeatured: true, createdAt: '2026-05-02' },
  { id: 'p3', sku: 'RCB-BDY-003', name: 'Spion Custom CNC', brand: 'RCB', price: 145000, category: 'body-aksesoris', compatibleWith: ['Universal'], rating: 4.3, reviewCount: 54, stock: 60, images: ['/products/body-aksesoris.svg', '/products/body-aksesoris.svg'], videoUrl: '', description: 'Spion custom bahan aluminium CNC, ringan dan kokoh.', testimonials: [], published: true, isFeatured: false, createdAt: '2026-05-03' },
  { id: 'p4', sku: 'SHL-OLI-004', name: 'Oli Mesin Shell Advance 10W-40', brand: 'Shell', price: 65000, category: 'oli-pelumas', compatibleWith: ['Universal 4-tak'], rating: 4.7, reviewCount: 210, stock: 100, images: ['/products/oli-pelumas.svg', '/products/oli-pelumas.svg'], videoUrl: '', description: 'Oli mesin sintetik untuk perlindungan mesin maksimal.', testimonials: [ { id: 't3', author: 'Bagas', rating: 5, text: 'Mesin lebih halus setelah ganti.', date: '2026-07-01' } ], published: true, isFeatured: true, createdAt: '2026-05-04' },
  { id: 'p5', sku: 'IRC-BNV-005', name: 'Ban Tubeless IRC 90/80-14', brand: 'IRC', price: 275000, category: 'ban-velg', compatibleWith: ['Honda Beat', 'Honda Scoopy'], rating: 4.5, reviewCount: 77, stock: 30, images: ['/products/ban-velg.svg', '/products/ban-velg.svg'], videoUrl: '', description: 'Ban tubeless dengan grip optimal di jalan basah maupun kering.', testimonials: [], published: true, isFeatured: false, createdAt: '2026-05-05' },
  { id: 'p6', sku: 'NGK-MSN-006', name: 'Busi Iridium NGK', brand: 'NGK', price: 55000, category: 'mesin', compatibleWith: ['Universal'], rating: 4.9, reviewCount: 302, stock: 150, images: ['/products/mesin.svg', '/products/mesin.svg'], videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Busi iridium untuk pembakaran lebih sempurna dan hemat bahan bakar.', testimonials: [ { id: 't4', author: 'Dewi', rating: 5, text: 'Tarikan jadi lebih enteng.', date: '2026-07-10' }, { id: 't5', author: 'Fajar', rating: 5, text: 'Awet dan irit, recommended.', date: '2026-07-15' } ], published: true, isFeatured: true, createdAt: '2026-05-06' },
  { id: 'p7', sku: 'OSR-KLS-007', name: 'Lampu LED Headlamp H4', brand: 'Osram', price: 195000, category: 'kelistrikan', compatibleWith: ['Universal'], rating: 4.4, reviewCount: 88, stock: 45, images: ['/products/kelistrikan.svg', '/products/kelistrikan.svg'], videoUrl: '', description: 'Lampu LED terang dengan konsumsi daya rendah.', testimonials: [], published: true, isFeatured: false, createdAt: '2026-05-07' },
  { id: 'p8', sku: 'TDR-BDY-008', name: 'Cover Body Set Racing', brand: 'TDR', price: 450000, category: 'body-aksesoris', compatibleWith: ['Yamaha MX King'], rating: 4.2, reviewCount: 31, stock: 15, images: ['/products/body-aksesoris.svg', '/products/body-aksesoris.svg'], videoUrl: '', description: 'Set body cover racing untuk tampilan sporty.', testimonials: [], published: true, isFeatured: false, createdAt: '2026-05-08' },
  { id: 'p9', sku: 'YML-OLI-009', name: 'Oli Gardan Yamalube', brand: 'Yamalube', price: 25000, category: 'oli-pelumas', compatibleWith: ['Yamaha Matic'], rating: 4.6, reviewCount: 145, stock: 200, images: ['/products/oli-pelumas.svg', '/products/oli-pelumas.svg'], videoUrl: '', description: 'Oli gardan khusus motor matic Yamaha.', testimonials: [], published: true, isFeatured: false, createdAt: '2026-05-09' },
  { id: 'p10', sku: 'RSI-BNV-010', name: 'Velg Racing Ring 14', brand: 'Rossi', price: 850000, category: 'ban-velg', compatibleWith: ['Honda Beat', 'Honda Vario'], rating: 4.7, reviewCount: 42, stock: 10, images: ['/products/ban-velg.svg', '/products/ban-velg.svg'], videoUrl: '', description: 'Velg racing ringan dengan desain sporty 3-palang.', testimonials: [ { id: 't6', author: 'Gilang', rating: 5, text: 'Ringan, motor jadi lincah.', date: '2026-07-20' } ], published: true, isFeatured: true, createdAt: '2026-05-10' },
  { id: 'p11', sku: 'HND-MSN-011', name: 'Rantai Keteng Honda', brand: 'Honda Genuine', price: 75000, category: 'mesin', compatibleWith: ['Honda Beat', 'Honda Vario'], rating: 4.5, reviewCount: 66, stock: 55, images: ['/products/mesin.svg', '/products/mesin.svg'], videoUrl: '', description: 'Rantai keteng original untuk kelancaran timing mesin.', testimonials: [], published: true, isFeatured: false, createdAt: '2026-05-11' },
  { id: 'p12', sku: 'DYT-KLS-012', name: 'Kiprok Regulator Rectifier', brand: 'Daytona', price: 165000, category: 'kelistrikan', compatibleWith: ['Universal'], rating: 4.3, reviewCount: 39, stock: 33, images: ['/products/kelistrikan.svg', '/products/kelistrikan.svg'], videoUrl: '', description: 'Kiprok performa tinggi untuk kestabilan pengisian aki.', testimonials: [], published: true, isFeatured: false, createdAt: '2026-05-12' },
  { id: 'p13', sku: 'ACB-BDY-013', name: 'Handguard Set Universal', brand: 'Acerbis', price: 210000, category: 'body-aksesoris', compatibleWith: ['Universal'], rating: 4.1, reviewCount: 22, stock: 40, images: ['/products/body-aksesoris.svg', '/products/body-aksesoris.svg'], videoUrl: '', description: 'Pelindung tangan universal untuk keamanan berkendara.', testimonials: [], published: true, isFeatured: false, createdAt: '2026-05-13' },
  { id: 'p14', sku: 'AHM-OLI-014', name: 'Grease Multi Purpose', brand: 'AHM', price: 18000, category: 'oli-pelumas', compatibleWith: ['Universal'], rating: 4.4, reviewCount: 58, stock: 120, images: ['/products/oli-pelumas.svg', '/products/oli-pelumas.svg'], videoUrl: '', description: 'Gemuk multi fungsi untuk pelumasan komponen bearing dan rantai.', testimonials: [], published: true, isFeatured: false, createdAt: '2026-05-14' },
  { id: 'p15', sku: 'CRS-BNV-015', name: 'Ban Tubeless Corsa 80/90-14', brand: 'Corsa', price: 230000, category: 'ban-velg', compatibleWith: ['Universal Matic'], rating: 4.2, reviewCount: 29, stock: 50, images: ['/products/ban-velg.svg', '/products/ban-velg.svg'], videoUrl: '', description: 'Ban tubeless harga terjangkau dengan daya cengkeram baik.', testimonials: [], published: true, isFeatured: true, createdAt: '2026-05-15' },
]
```

- [ ] **Step 2: Create `src/data/users.js`**

```js
export const USERS = [
  {
    id: 'u1',
    name: 'Budi Santoso',
    email: 'budi@dmb.com',
    phone: '081234567890',
    password: 'password',
    provider: 'password',
    addresses: [
      { id: 'a1', recipientName: 'Budi Santoso', phone: '081234567890', line: 'Jl. Merdeka No. 10, RT 02/RW 03', city: 'Bandung', province: 'Jawa Barat', postalCode: '40111' },
    ],
    defaultAddressId: 'a1',
  },
  {
    id: 'u2',
    name: 'Sari Wulandari',
    email: 'sari@dmb.com',
    phone: '081298765432',
    password: 'password',
    provider: 'password',
    addresses: [],
    defaultAddressId: null,
  },
]
```

- [ ] **Step 3: Create `src/data/promos.js`**

```js
export const PROMOS = [
  { code: 'DMB10', type: 'percent', value: 10, minSpend: 100000, active: true },
  { code: 'ONGKIR', type: 'fixed', value: 15000, minSpend: 0, active: true },
  { code: 'HEMAT50K', type: 'fixed', value: 50000, minSpend: 300000, active: true },
]
```

- [ ] **Step 4: Create `src/data/shipping.js`**

```js
export const SHIPPING = {
  couriers: [
    { id: 'jne', name: 'JNE', services: [
      { id: 'reg', name: 'Regular', cost: 15000, etaLabel: '2–3 hari' },
      { id: 'yes', name: 'Same Day', cost: 35000, etaLabel: 'Hari ini' },
    ] },
    { id: 'sicepat', name: 'SiCepat', services: [
      { id: 'reg', name: 'Regular', cost: 13000, etaLabel: '2–4 hari' },
      { id: 'best', name: 'Same Day', cost: 32000, etaLabel: 'Hari ini' },
    ] },
    { id: 'anteraja', name: 'AnterAja', services: [
      { id: 'reg', name: 'Regular', cost: 14000, etaLabel: '2–3 hari' },
      { id: 'instant', name: 'Instant', cost: 45000, etaLabel: '1–3 jam' },
    ] },
  ],
}
```

- [ ] **Step 5: Create `src/data/homepage.js`**

```js
export const HOMEPAGE = {
  banners: [
    { id: 'b1', image: '/products/mesin.svg', headline: 'Sparepart Ori, Harga Bersahabat', subtext: 'Diskon spesial untuk part mesin pilihan.', ctaLabel: 'Belanja Sekarang', ctaHref: '/search', active: true, order: 1 },
    { id: 'b2', image: '/products/ban-velg.svg', headline: 'Upgrade Tampilan Motormu', subtext: 'Ban & velg racing dengan promo ongkir.', ctaLabel: 'Lihat Koleksi', ctaHref: '/search', active: true, order: 2 },
  ],
  featuredProductIds: ['p1', 'p2', 'p4', 'p6', 'p10', 'p15'],
  testimonials: [
    { id: 'h1', author: 'Andi Pratama', text: 'Barang cepat sampai dan original. Langganan!', rating: 5 },
    { id: 'h2', author: 'Sinta Dewi', text: 'Harga bersaing, CS ramah. Recommended.', rating: 5 },
    { id: 'h3', author: 'Rizky Maulana', text: 'Pilihan part lengkap, checkout gampang.', rating: 4 },
  ],
}
```

- [ ] **Step 6: Verify all seed files load and have the expected shape**

Run:
```bash
node --input-type=module -e "
import { PRODUCTS } from './src/data/products.js';
import { USERS } from './src/data/users.js';
import { PROMOS } from './src/data/promos.js';
import { SHIPPING } from './src/data/shipping.js';
import { HOMEPAGE } from './src/data/homepage.js';
const featured = PRODUCTS.filter(p => p.isFeatured).map(p => p.id);
console.assert(PRODUCTS.length === 15, 'expected 15 products');
console.assert(PRODUCTS.every(p => p.sku && Array.isArray(p.images) && 'videoUrl' in p && Array.isArray(p.testimonials) && p.published === true && typeof p.isFeatured === 'boolean'), 'product shape');
console.assert(USERS.length === 2 && USERS[0].defaultAddressId === 'a1' && USERS[1].defaultAddressId === null, 'users');
console.assert(PROMOS.length === 3 && SHIPPING.couriers.length === 3, 'promos/shipping');
console.assert(JSON.stringify(HOMEPAGE.featuredProductIds) === JSON.stringify(featured), 'homepage featured matches product flags');
console.log('OK featured:', featured.join(','));
"
```
Expected: prints `OK featured: p1,p2,p4,p6,p10,p15` with no assertion errors.

- [ ] **Step 7: Commit**

```bash
git add src/data/products.js src/data/users.js src/data/promos.js src/data/shipping.js src/data/homepage.js
git commit -m "feat(sp1): extend product seed and add users/promos/shipping/homepage seed data"
```

---

## Task 2: Seed module (assemble, version, persistence helpers)

**Files:**
- Create: `src/store/seed.js`

**Interfaces:**
- Consumes: `PRODUCTS`, `CATEGORIES`, `USERS`, `PROMOS`, `SHIPPING`, `HOMEPAGE` from `src/data/*`.
- Produces:
  - `VERSION: number` (seed schema version).
  - `buildSeed(): Data` — returns a fresh deep copy of the full data object `{ version, products, categories, users, orders, promos, shipping, homepage }` (`orders` starts `[]`).
  - `shouldReseed(raw: string | null): boolean` — pure; true if `raw` is null/invalid JSON or its `version !== VERSION`.
  - `loadData(): Data` — read `localStorage['dmb:data']`; if `shouldReseed`, build seed, save it, return it; else return parsed.
  - `saveData(data: Data): void` — write JSON to `localStorage['dmb:data']`.
  - `clearData(): Data` — build seed, save, return it (used by `resetStore`).

- [ ] **Step 1: Create `src/store/seed.js`**

```js
import { PRODUCTS } from '../data/products'
import { CATEGORIES } from '../data/categories'
import { USERS } from '../data/users'
import { PROMOS } from '../data/promos'
import { SHIPPING } from '../data/shipping'
import { HOMEPAGE } from '../data/homepage'

export const VERSION = 1
const STORAGE_KEY = 'dmb:data'

export function buildSeed() {
  return structuredClone({
    version: VERSION,
    products: PRODUCTS,
    categories: CATEGORIES,
    users: USERS,
    orders: [],
    promos: PROMOS,
    shipping: SHIPPING,
    homepage: HOMEPAGE,
  })
}

export function shouldReseed(raw) {
  if (!raw) return true
  try {
    const parsed = JSON.parse(raw)
    return parsed?.version !== VERSION
  } catch {
    return true
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (shouldReseed(raw)) {
    const seed = buildSeed()
    saveData(seed)
    return seed
  }
  return JSON.parse(raw)
}

export function clearData() {
  const seed = buildSeed()
  saveData(seed)
  return seed
}
```

- [ ] **Step 2: Verify the pure parts (`buildSeed`, `shouldReseed`) in node**

Run:
```bash
node --input-type=module -e "
import { buildSeed, shouldReseed, VERSION } from './src/store/seed.js';
const seed = buildSeed();
console.assert(seed.version === VERSION, 'version');
console.assert(seed.products.length === 15 && Array.isArray(seed.orders) && seed.orders.length === 0, 'seed shape');
console.assert(shouldReseed(null) === true, 'null reseeds');
console.assert(shouldReseed('not json') === true, 'bad json reseeds');
console.assert(shouldReseed(JSON.stringify({ version: 999 })) === true, 'wrong version reseeds');
console.assert(shouldReseed(JSON.stringify({ version: VERSION })) === false, 'matching version keeps');
console.log('OK seed module');
"
```
Expected: prints `OK seed module` with no assertion errors. (`loadData`/`saveData`/`clearData` touch `localStorage` and are verified in Task 3 via the browser.)

- [ ] **Step 3: Commit**

```bash
git add src/store/seed.js
git commit -m "feat(sp1): add seed module with version-gated reseed and persistence helpers"
```

---

## Task 3: StoreProvider, hooks, and app wiring

**Files:**
- Create: `src/store/StoreProvider.jsx`, `src/store/hooks.js`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `loadData`, `saveData`, `clearData` from `src/store/seed.js`; `generateOrderNumber` from `src/utils/orderNumber.js`.
- Produces a context value from `useStore()`:
  - `data: Data`
  - convenience slices: `products, categories, users, orders, promos, shipping, homepage`
  - product mutations: `addProduct(product)`, `updateProduct(id, patch)`, `deleteProduct(id)`
  - user mutations: `addUser(user) → user`, `updateUser(id, patch)`, `setDefaultAddress(userId, address) → Address` (adds the address to the user and sets it default)
  - order mutations: `createOrder(orderInput) → order` (assigns `id` via `generateOrderNumber()`, `createdAt`, initial `statusHistory`), `updateOrderStatus(id, status, extra = {})`
  - homepage mutation: `updateHomepage(patch)`
  - `resetStore()` — reseed and replace state
- Produces read hooks in `hooks.js`: `useProducts()`, `useProduct(id)`, `useCategories()`, `useOrders()`, `useOrder(id)`, `usePromos()`, `useShipping()`, `useHomepage()`.

- [ ] **Step 1: Create `src/store/StoreProvider.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { loadData, saveData, clearData } from './seed'
import { generateOrderNumber } from '../utils/orderNumber'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  // Products
  const addProduct = (product) =>
    setData((d) => ({ ...d, products: [...d.products, product] }))
  const updateProduct = (id, patch) =>
    setData((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  const deleteProduct = (id) =>
    setData((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) }))

  // Users
  const addUser = (user) => {
    setData((d) => ({ ...d, users: [...d.users, user] }))
    return user
  }
  const updateUser = (id, patch) =>
    setData((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }))
  const setDefaultAddress = (userId, address) => {
    setData((d) => ({
      ...d,
      users: d.users.map((u) =>
        u.id === userId
          ? { ...u, addresses: [...u.addresses, address], defaultAddressId: address.id }
          : u,
      ),
    }))
    return address
  }

  // Orders
  const createOrder = (orderInput) => {
    const order = {
      ...orderInput,
      id: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: orderInput.status, at: new Date().toISOString() }],
    }
    setData((d) => ({ ...d, orders: [order, ...d.orders] }))
    return order
  }
  const updateOrderStatus = (id, status, extra = {}) =>
    setData((d) => ({
      ...d,
      orders: d.orders.map((o) =>
        o.id === id
          ? { ...o, ...extra, status, statusHistory: [...o.statusHistory, { status, at: new Date().toISOString() }] }
          : o,
      ),
    }))

  // Homepage
  const updateHomepage = (patch) =>
    setData((d) => ({ ...d, homepage: { ...d.homepage, ...patch } }))

  const resetStore = () => setData(clearData())

  const value = {
    data,
    products: data.products,
    categories: data.categories,
    users: data.users,
    orders: data.orders,
    promos: data.promos,
    shipping: data.shipping,
    homepage: data.homepage,
    addProduct,
    updateProduct,
    deleteProduct,
    addUser,
    updateUser,
    setDefaultAddress,
    createOrder,
    updateOrderStatus,
    updateHomepage,
    resetStore,
  }

  // Dev convenience: allow resetting the demo store from the browser console.
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__dmbReset = resetStore
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
```

- [ ] **Step 2: Create `src/store/hooks.js`**

```js
import { useStore } from './StoreProvider'

export function useProducts() {
  return useStore().products
}

export function useProduct(id) {
  return useStore().products.find((p) => p.id === id) || null
}

export function useCategories() {
  return useStore().categories
}

export function useOrders() {
  return useStore().orders
}

export function useOrder(id) {
  return useStore().orders.find((o) => o.id === id) || null
}

export function usePromos() {
  return useStore().promos
}

export function useShipping() {
  return useStore().shipping
}

export function useHomepage() {
  return useStore().homepage
}
```

- [ ] **Step 3: Wrap the app with `StoreProvider` in `src/App.jsx`**

Add the import and make `StoreProvider` the outermost provider (inside `BrowserRouter`):

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './store/StoreProvider'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
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
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
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
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Verify seeding and reset in the browser**

Run: `npm run dev`
Then in the browser at the dev URL, open DevTools console and run:
```js
JSON.parse(localStorage['dmb:data']).products.length   // expect 15
JSON.parse(localStorage['dmb:data']).version           // expect 1
window.__dmbReset()                                     // reseeds
JSON.parse(localStorage['dmb:data']).orders.length     // expect 0
```
Expected: no red errors in the console; values as noted. Stop the dev server (Ctrl-C) when done.

- [ ] **Step 5: Commit**

```bash
git add src/store/StoreProvider.jsx src/store/hooks.js src/App.jsx
git commit -m "feat(sp1): add StoreProvider, domain hooks, and wire providers"
```

---

## Task 4: Refactor CartContext onto the store

**Files:**
- Modify: `src/context/CartContext.jsx`

**Interfaces:**
- Consumes: `useStore()` (for `products`).
- Produces: same public API as before — `{ items, addItem, updateQty, removeItem, clearCart, subtotal, itemCount }` — but `subtotal` is computed from store products instead of the static `PRODUCTS` import. Item shape stays `[{ productId, qty }]`. Storage key stays `dmb:cart`.

- [ ] **Step 1: Replace `src/context/CartContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/StoreProvider'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { products } = useStore()

  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem('dmb:cart')
    return raw ? JSON.parse(raw) : []
  })

  useEffect(() => {
    localStorage.setItem('dmb:cart', JSON.stringify(items))
  }, [items])

  const addItem = (productId, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { productId, qty }]
    })
  }

  const updateQty = (productId, qty) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty } : i)))
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => {
      const product = products.find((p) => p.id === i.productId)
      return product ? sum + product.price * i.qty : sum
    }, 0)
  }, [items, products])

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

- [ ] **Step 2: Verify cart still works in the browser**

Run: `npm run dev`
Then: open the app, add a product to the cart from a product page, open the cart page, confirm the item appears and the subtotal is correct. In the console:
```js
JSON.parse(localStorage['dmb:cart'])   // expect [{ productId, qty }]
```
Expected: cart shows the item, subtotal matches price × qty, no console errors. Stop the dev server when done.

- [ ] **Step 3: Commit**

```bash
git add src/context/CartContext.jsx
git commit -m "refactor(sp1): compute cart subtotal from store products and use dmb:cart key"
```

---

## Task 5: Refactor AuthContext and Login/Register pages

**Files:**
- Modify: `src/context/AuthContext.jsx`
- Modify: `src/pages/LoginPage.jsx`
- Modify: `src/pages/RegisterPage.jsx`

**Interfaces:**
- Consumes: `useStore()` (`users`, `addUser`).
- Produces the auth context value from `useAuth()`:
  - `currentUser: User | null`
  - `isLoggedIn: boolean` (derived, `!!currentUser`)
  - `login(email, password) → { ok: boolean, error?: string }` — finds a user by email (case-insensitive); any password is accepted for the POC; sets session.
  - `loginWithGoogle() → { ok: true }` — logs in as a dummy Google user (created via `addUser` if not present).
  - `register({ name, email, phone, password }) → { ok: boolean, error?: string }` — adds a user via `addUser` and logs in; errors if email already exists.
  - `logout()` — clears session.
- Session persistence: `localStorage['dmb:auth']` holds `currentUserId`.

- [ ] **Step 1: Replace `src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { useStore } from '../store/StoreProvider'

const AuthContext = createContext(null)

const GOOGLE_USER = {
  id: 'u-google',
  name: 'Google User',
  email: 'google.user@gmail.com',
  phone: '',
  password: '',
  provider: 'google',
  addresses: [],
  defaultAddressId: null,
}

export function AuthProvider({ children }) {
  const { users, addUser } = useStore()

  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('dmb:auth') || null)

  useEffect(() => {
    if (currentUserId) localStorage.setItem('dmb:auth', currentUserId)
    else localStorage.removeItem('dmb:auth')
  }, [currentUserId])

  const currentUser = users.find((u) => u.id === currentUserId) || null

  const login = (email, password) => {
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (!user) return { ok: false, error: 'Email tidak ditemukan.' }
    // POC: any password is accepted.
    setCurrentUserId(user.id)
    return { ok: true }
  }

  const loginWithGoogle = () => {
    const existing = users.find((u) => u.id === GOOGLE_USER.id)
    if (!existing) addUser(GOOGLE_USER)
    setCurrentUserId(GOOGLE_USER.id)
    return { ok: true }
  }

  const register = ({ name, email, phone, password }) => {
    if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      return { ok: false, error: 'Email sudah terdaftar.' }
    }
    const user = {
      id: 'u' + (users.length + 1) + '-' + email.split('@')[0],
      name,
      email,
      phone: phone || '',
      password: password || '',
      provider: 'password',
      addresses: [],
      defaultAddressId: null,
    }
    addUser(user)
    setCurrentUserId(user.id)
    return { ok: true }
  }

  const logout = () => setCurrentUserId(null)

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoggedIn: !!currentUser, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

- [ ] **Step 2: Read the current Login and Register pages**

Run:
```bash
sed -n '1,200p' src/pages/LoginPage.jsx
sed -n '1,200p' src/pages/RegisterPage.jsx
```
Note how they currently call `login()` / navigate, and which fields they collect, so the next step preserves their layout and only swaps the auth calls.

- [ ] **Step 3: Update `LoginPage.jsx` to use the new API**

Wire the email + password inputs to `login(email, password)` and the Google button to `loginWithGoogle()`. On `{ ok: true }` navigate to `/` (or the page's existing post-login target); on `{ ok: false }` show `error` in the page's existing error area. Keep all existing markup/styling; change only the submit handler and (if present) the Google button handler. Concretely, the submit handler becomes:

```jsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')
const { login, loginWithGoogle } = useAuth()
const navigate = useNavigate()

const handleSubmit = (e) => {
  e.preventDefault()
  const res = login(email, password)
  if (res.ok) navigate('/')
  else setError(res.error)
}

const handleGoogle = () => {
  loginWithGoogle()
  navigate('/')
}
```
Bind `value`/`onChange` of the existing email and password inputs to these state vars, render `{error && <p ...>{error}</p>}` in the existing error slot, and attach `handleGoogle` to the existing Google button if there is one.

- [ ] **Step 4: Update `RegisterPage.jsx` to use the new API**

Wire the form to `register({ name, email, phone, password })`. On `{ ok: true }` navigate to `/`; on `{ ok: false }` show `error`. Keep existing markup; change only the submit handler:

```jsx
const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
const [error, setError] = useState('')
const { register } = useAuth()
const navigate = useNavigate()

const handleSubmit = (e) => {
  e.preventDefault()
  const res = register(form)
  if (res.ok) navigate('/')
  else setError(res.error)
}
```
Bind the existing inputs to `form` fields via `onChange={(e) => setForm({ ...form, [field]: e.target.value })}` and render `{error && ...}` in the existing error slot. If the register form does not collect `phone`, omit it (the store treats it as optional).

- [ ] **Step 5: Verify auth flows in the browser**

Run: `npm run dev`. Then:
1. Go to `/login`, enter `budi@dmb.com` + any password, submit → lands on `/`, console `JSON.parse(localStorage['dmb:auth'])` shows `u1`.
2. Enter an unknown email → shows "Email tidak ditemukan."
3. Click Google login (if present) → logs in as `u-google`.
4. Go to `/register`, register a new email → logs in; registering an existing email shows "Email sudah terdaftar."
5. Trigger logout (via whatever control the nav exposes, or `localStorage.removeItem('dmb:auth')` + reload) → back to logged-out state.

Expected: each flow behaves as described, no console errors. Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add src/context/AuthContext.jsx src/pages/LoginPage.jsx src/pages/RegisterPage.jsx
git commit -m "refactor(sp1): back auth with store users, add google/register, wire login/register pages"
```

---

## Task 6: Full-app smoke check and cleanup

**Files:**
- Modify (only if a break is found): any component still calling the old auth API (`login()` with no args, or reading a removed boolean shape) or the old `cart`/`auth` localStorage keys.

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces: a runnable app with no console errors across all existing routes.

- [ ] **Step 1: Find lingering references to the old APIs/keys**

Run:
```bash
grep -rn "localStorage.getItem('auth')\|localStorage.getItem('cart')\|'auth'\|'cart'" src || true
grep -rn "isLoggedIn\|login(\|logout(\|useAuth\|useCart" src/components src/pages || true
```
Review each hit. The only expected `login(` calls are the new `login(email, password)` in `LoginPage`. Any component that called the old zero-arg `login()` (e.g. a demo button) must be updated to either navigate to `/login` or call `login('budi@dmb.com', 'x')`. Components that only read `isLoggedIn` or call `logout()` need no change (both still exist).

- [ ] **Step 2: Fix any breaks found**

For each problematic call site, apply the minimal change to match the new API (navigate to `/login`, or pass credentials). Do not reshape layouts — this is SP2's job. If Step 1 found nothing, skip.

- [ ] **Step 3: Smoke-test every route in the browser**

Run: `npm run dev`. Visit each route and confirm it renders without console errors:
`/`, `/search`, `/product/p1`, `/cart`, `/checkout`, `/checkout/success`, `/login`, `/register`.
Then confirm the seeded store is intact:
```js
Object.keys(JSON.parse(localStorage['dmb:data']))  // version, products, categories, users, orders, promos, shipping, homepage
```
Expected: all routes render, no red console errors, store keys present. Stop the dev server when done.

- [ ] **Step 4: Run the linter**

Run: `npm run lint`
Expected: no errors. Fix any that were introduced by this plan (unused imports from the old `PRODUCTS` import in `CartContext`, etc.).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(sp1): smoke-fix lingering old auth/cart references and lint clean"
```

---

## Self-Review

**Spec coverage:**
- Store architecture (single `StoreProvider`, `dmb:data`/`dmb:auth`/`dmb:cart`, provider tree, hooks, `resetStore`) → Tasks 2–3. ✓
- Entity models (Product extended, User+Address, Order, Promo, Shipping, HomepageContent) → Task 1 seed shapes + Task 3 mutation shapes (`createOrder`/`updateOrderStatus` build the Order shape incl. `statusHistory`). ✓
- Seed data plan (extend 15 products, 2 users, promos, 3 couriers, homepage) → Task 1. ✓
- Refactor Auth (`currentUser`, `login/loginWithGoogle/register/logout`, derived `isLoggedIn`) → Task 5. ✓
- Refactor Cart (subtotal from store, same shape) → Task 4. ✓
- Keep existing pages runnable + minimal Login/Register edits → Tasks 5–6. ✓
- Verification / DoD (dev server clean, login/logout/cart work, `dmb:data` seeded, `resetStore`, hooks return data) → Task 3 Step 4, Task 4 Step 2, Task 5 Step 5, Task 6 Step 3. ✓
- No new dependencies; 6 order statuses verbatim → Global Constraints, honored throughout. ✓

**Placeholder scan:** No TBD/TODO. Login/Register steps show the exact handler code rather than deferring, and reference the read step (Task 5 Step 2) to preserve existing markup. ✓

**Type consistency:** `useStore()` value keys match between Provider (Task 3) and consumers (`useStore().products` in hooks; `useStore()` `users`/`addUser` in Auth; `products` in Cart). Order mutations produce `status` + `statusHistory` consistent with the spec's Order shape. `createOrder`/`updateOrderStatus`/`addUser`/`setDefaultAddress` signatures are defined once and referenced consistently. ✓

**Note on `new Date().toISOString()`:** used inside `StoreProvider` mutations (runtime app code, not the workflow-script sandbox) — this is standard app code and is correct here.
