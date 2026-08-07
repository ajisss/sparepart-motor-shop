# Product CMS (Neon) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make products/categories editable from the admin dashboard and served to the public storefront from a shared Neon Postgres database.

**Architecture:** Neon Postgres is the single source of truth. Thin Vercel Functions in `/api` expose read-only endpoints (consumed by the storefront) and write endpoints (used by the admin dashboard). Both deployments build from one repo; write endpoints are gated to the admin deployment and the storefront connects with a read-only DB role. The storefront's data hooks fetch from the API instead of the local seed store.

**Tech Stack:** Vite + React 19, react-router 7, Vercel Functions (Node), `@neondatabase/serverless`, Postgres, `node --test`.

**Spec:** `docs/superpowers/specs/2026-08-06-product-cms-neon-design.md`

## Global Constraints

- Product IDs stay `text` (`p1`, `p2`, …), matching the existing seed. No UUID switch.
- Phase 1 stores image **URLs** only (no file upload).
- Category CRUD is out of phase 1 — categories are seeded and read-only in the UI.
- `DATABASE_URL` is server-only. Never `VITE_`-prefixed, never imported into client code.
- Admin write endpoints require the `x-admin-secret` header to equal `process.env.ADMIN_API_SECRET`, and are disabled unless `process.env.APP_TARGET === 'admin'`.
- API product JSON must match the current UI shape: `images: string[]`, `compatibleWith: string[]`, plus scalar fields. No `rating` / `reviewCount` / `testimonials`.
- Follow existing code style (2-space indent, no semicolons, single quotes).

---

## Prerequisite (manual — user's Vercel account, done before Task 3 runs live)

These are one-time provisioning steps the user performs; the code tasks below can be written and unit-tested first, but the live/integration checks need this done.

1. `npm i -g vercel` then `vercel link` (run once per project: storefront + admin).
2. Provision Neon: `vercel integration add neon` (or via the Vercel dashboard Marketplace).
3. In Neon, create two roles: a **read-write** role and a **read-only** role (`GRANT SELECT` only).
4. Set env vars:
   - Storefront project: `DATABASE_URL` = read-only role connection string.
   - Admin project: `DATABASE_URL` = read-write role, `APP_TARGET=admin`, `ADMIN_API_SECRET=<random secret>`.
5. `vercel env pull` in the local repo to get a working `DATABASE_URL` for running the migration/seed and integration checks.

---

## Task 1: Database client + migration SQL

**Files:**
- Create: `api/_lib/db.js`
- Create: `db/migrations/001_init.sql`
- Modify: `package.json` (add `@neondatabase/serverless` dependency)

**Interfaces:**
- Produces: `getSql()` → returns a `@neondatabase/serverless` tagged-template `sql` function built from `process.env.DATABASE_URL`. Throws if the env var is missing.

- [ ] **Step 1: Add the driver**

Run: `npm i @neondatabase/serverless`
Expected: dependency added to `package.json`.

- [ ] **Step 2: Write the DB client**

Create `api/_lib/db.js`:

```js
import { neon } from '@neondatabase/serverless'

let cached = null

// Lazily build one HTTP sql client from DATABASE_URL (server-only env).
export function getSql() {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  cached = neon(url)
  return cached
}
```

- [ ] **Step 3: Write the migration**

Create `db/migrations/001_init.sql`:

```sql
create table if not exists categories (
  id       text primary key,
  slug     text unique not null,
  name     text not null,
  position int  not null default 0
);

create table if not exists products (
  id             text primary key,
  sku            text unique not null,
  name           text not null,
  slug           text not null,
  brand          text,
  category_id    text references categories(id),
  price          int  not null,
  stock          int  not null default 0,
  description    text,
  video_url      text,
  published      boolean not null default true,
  is_featured    boolean not null default false,
  featured_order int,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists products_category_idx on products (category_id);
create index if not exists products_published_idx on products (published);

create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  url        text not null,
  position   int  not null default 0
);
create index if not exists product_images_product_idx on product_images (product_id);

create table if not exists product_compatibility (
  id         uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  model      text not null
);
create index if not exists product_compat_product_idx on product_compatibility (product_id);
```

- [ ] **Step 4: Commit**

```bash
git add api/_lib/db.js db/migrations/001_init.sql package.json package-lock.json
git commit -m "feat: add neon client and product schema migration"
```

---

## Task 2: Product data-access layer (pure, injectable `sql`)

Data-access functions take `sql` as their first argument so they unit-test with a fake. They also shape rows into the UI product object.

**Files:**
- Create: `api/_lib/products.js`
- Test: `tests/products-dataaccess.test.js`

**Interfaces:**
- Consumes: `getSql()` from Task 1 (only at call sites, not inside these functions).
- Produces:
  - `shapeProduct(row, images, compat)` → product object `{ id, sku, name, slug, brand, category, price, stock, description, videoUrl, published, isFeatured, featuredOrder, images, compatibleWith }`
  - `listProducts(sql, { publishedOnly, category, q, featured })` → `Promise<Product[]>`
  - `getProduct(sql, id)` → `Promise<Product | null>`
  - `createProduct(sql, data)` → `Promise<Product>`
  - `updateProduct(sql, id, data)` → `Promise<Product | null>`
  - `deleteProduct(sql, id)` → `Promise<boolean>`
  - `validateProductInput(data)` → `{ ok: true, value } | { ok: false, error }`

- [ ] **Step 1: Write failing tests for shaping + validation**

Create `tests/products-dataaccess.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shapeProduct, validateProductInput } from '../api/_lib/products.js'

test('shapeProduct maps columns and children to UI shape', () => {
  const row = {
    id: 'p1', sku: 'S1', name: 'Kampas', slug: 'kampas', brand: 'NHK',
    category_id: 'mesin', price: 85000, stock: 40, description: 'desc',
    video_url: null, published: true, is_featured: true, featured_order: 1,
  }
  const p = shapeProduct(row, [{ url: 'a.png' }, { url: 'b.png' }], [{ model: 'Vario 125' }])
  assert.equal(p.category, 'mesin')
  assert.equal(p.videoUrl, null)
  assert.equal(p.isFeatured, true)
  assert.deepEqual(p.images, ['a.png', 'b.png'])
  assert.deepEqual(p.compatibleWith, ['Vario 125'])
  assert.equal('rating' in p, false)
})

test('validateProductInput rejects missing required fields', () => {
  const r = validateProductInput({ name: '', price: 1 })
  assert.equal(r.ok, false)
})

test('validateProductInput accepts a valid product', () => {
  const r = validateProductInput({
    id: 'p9', sku: 'S9', name: 'X', brand: 'B', category: 'mesin',
    price: 1000, stock: 5, images: ['a.png'], compatibleWith: ['Vario'],
  })
  assert.equal(r.ok, true)
  assert.equal(r.value.slug, 'x')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/products-dataaccess.test.js`
Expected: FAIL (module has no such exports).

- [ ] **Step 3: Implement `api/_lib/products.js`**

```js
function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function shapeProduct(row, images = [], compat = []) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    category: row.category_id,
    price: row.price,
    stock: row.stock,
    description: row.description,
    videoUrl: row.video_url,
    published: row.published,
    isFeatured: row.is_featured,
    featuredOrder: row.featured_order,
    images: images.map((i) => i.url),
    compatibleWith: compat.map((c) => c.model),
  }
}

export function validateProductInput(data) {
  const required = ['sku', 'name', 'category', 'price']
  for (const key of required) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      return { ok: false, error: `Field '${key}' wajib diisi.` }
    }
  }
  if (typeof data.price !== 'number' || data.price < 0) {
    return { ok: false, error: "Field 'price' harus angka >= 0." }
  }
  const value = {
    id: data.id,
    sku: String(data.sku),
    name: String(data.name),
    slug: data.slug ? slugify(data.slug) : slugify(data.name),
    brand: data.brand ?? null,
    category: String(data.category),
    price: data.price,
    stock: Number(data.stock ?? 0),
    description: data.description ?? null,
    videoUrl: data.videoUrl ?? null,
    published: data.published ?? true,
    isFeatured: data.isFeatured ?? false,
    featuredOrder: data.featuredOrder ?? null,
    images: Array.isArray(data.images) ? data.images : [],
    compatibleWith: Array.isArray(data.compatibleWith) ? data.compatibleWith : [],
  }
  return { ok: true, value }
}

async function loadChildren(sql, ids) {
  if (ids.length === 0) return { images: {}, compat: {} }
  const imgs = await sql`select product_id, url from product_images
    where product_id = any(${ids}) order by position`
  const compat = await sql`select product_id, model from product_compatibility
    where product_id = any(${ids})`
  const byProduct = (rows) => rows.reduce((acc, r) => {
    (acc[r.product_id] ||= []).push(r)
    return acc
  }, {})
  return { images: byProduct(imgs), compat: byProduct(compat) }
}

export async function listProducts(sql, { publishedOnly = false, category, q, featured } = {}) {
  const rows = await sql`
    select * from products
    where (${!publishedOnly} or published = true)
      and (${category ?? null}::text is null or category_id = ${category ?? null})
      and (${q ?? null}::text is null or name ilike ${'%' + (q ?? '') + '%'})
      and (${featured ?? null}::bool is null or is_featured = ${featured ?? null})
    order by coalesce(featured_order, 999999), created_at desc`
  const ids = rows.map((r) => r.id)
  const { images, compat } = await loadChildren(sql, ids)
  return rows.map((r) => shapeProduct(r, images[r.id] || [], compat[r.id] || []))
}

export async function getProduct(sql, id) {
  const rows = await sql`select * from products where id = ${id}`
  if (rows.length === 0) return null
  const { images, compat } = await loadChildren(sql, [id])
  return shapeProduct(rows[0], images[id] || [], compat[id] || [])
}

async function replaceChildren(sql, id, images, compat) {
  await sql`delete from product_images where product_id = ${id}`
  await sql`delete from product_compatibility where product_id = ${id}`
  for (let i = 0; i < images.length; i++) {
    await sql`insert into product_images (product_id, url, position) values (${id}, ${images[i]}, ${i})`
  }
  for (const model of compat) {
    await sql`insert into product_compatibility (product_id, model) values (${id}, ${model})`
  }
}

export async function createProduct(sql, data) {
  const v = data
  const id = v.id || v.sku.toLowerCase()
  await sql`insert into products
    (id, sku, name, slug, brand, category_id, price, stock, description, video_url, published, is_featured, featured_order)
    values (${id}, ${v.sku}, ${v.name}, ${v.slug}, ${v.brand}, ${v.category}, ${v.price}, ${v.stock},
            ${v.description}, ${v.videoUrl}, ${v.published}, ${v.isFeatured}, ${v.featuredOrder})`
  await replaceChildren(sql, id, v.images, v.compatibleWith)
  return getProduct(sql, id)
}

export async function updateProduct(sql, id, v) {
  const rows = await sql`update products set
    sku = ${v.sku}, name = ${v.name}, slug = ${v.slug}, brand = ${v.brand},
    category_id = ${v.category}, price = ${v.price}, stock = ${v.stock},
    description = ${v.description}, video_url = ${v.videoUrl}, published = ${v.published},
    is_featured = ${v.isFeatured}, featured_order = ${v.featuredOrder}, updated_at = now()
    where id = ${id} returning id`
  if (rows.length === 0) return null
  await replaceChildren(sql, id, v.images, v.compatibleWith)
  return getProduct(sql, id)
}

export async function deleteProduct(sql, id) {
  const rows = await sql`delete from products where id = ${id} returning id`
  return rows.length > 0
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/products-dataaccess.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/products.js tests/products-dataaccess.test.js
git commit -m "feat: product data-access + shaping with tests"
```

---

## Task 3: Seed script + categories data-access

**Files:**
- Create: `db/seed.mjs`
- Create: `api/_lib/categories.js`
- Test: `tests/categories-dataaccess.test.js`

**Interfaces:**
- Produces: `listCategories(sql)` → `Promise<{id, slug, name, position}[]>`

- [ ] **Step 1: Failing test for categories shaping**

Create `tests/categories-dataaccess.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toCategorySeed } from '../api/_lib/categories.js'

test('toCategorySeed adds slug + position', () => {
  const out = toCategorySeed([{ id: 'mesin', name: 'Mesin' }, { id: 'ban-velg', name: 'Ban & Velg' }])
  assert.deepEqual(out[0], { id: 'mesin', slug: 'mesin', name: 'Mesin', position: 0 })
  assert.equal(out[1].position, 1)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/categories-dataaccess.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `api/_lib/categories.js`**

```js
export function toCategorySeed(categories) {
  return categories.map((c, i) => ({ id: c.id, slug: c.id, name: c.name, position: i }))
}

export async function listCategories(sql) {
  return sql`select id, slug, name, position from categories order by position`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/categories-dataaccess.test.js`
Expected: PASS.

- [ ] **Step 5: Write the seed script**

Create `db/seed.mjs`:

```js
// Seeds Neon from the existing static data. Idempotent (upsert by id).
// Run after the migration: `node db/seed.mjs`
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'
import { PRODUCTS } from '../src/data/products.js'
import { CATEGORIES } from '../src/data/categories.js'
import { toCategorySeed } from '../api/_lib/categories.js'
import { validateProductInput } from '../api/_lib/products.js'

const sql = neon(process.env.DATABASE_URL)

async function run() {
  // migration
  const ddl = readFileSync(new URL('./migrations/001_init.sql', import.meta.url), 'utf8')
  await sql.query(ddl)

  for (const c of toCategorySeed(CATEGORIES)) {
    await sql`insert into categories (id, slug, name, position)
      values (${c.id}, ${c.slug}, ${c.name}, ${c.position})
      on conflict (id) do update set slug = excluded.slug, name = excluded.name, position = excluded.position`
  }

  for (const raw of PRODUCTS) {
    const v = validateProductInput({
      id: raw.id, sku: raw.sku, name: raw.name, brand: raw.brand, category: raw.category,
      price: raw.price, stock: raw.stock, description: raw.description, videoUrl: raw.videoUrl,
      published: raw.published, isFeatured: raw.isFeatured, images: raw.images,
      compatibleWith: raw.compatibleWith,
    })
    if (!v.ok) { console.error('skip', raw.id, v.error); continue }
    const p = v.value
    const id = p.id
    await sql`insert into products
      (id, sku, name, slug, brand, category_id, price, stock, description, video_url, published, is_featured, featured_order)
      values (${id}, ${p.sku}, ${p.name}, ${p.slug}, ${p.brand}, ${p.category}, ${p.price}, ${p.stock},
              ${p.description}, ${p.videoUrl}, ${p.published}, ${p.isFeatured}, ${p.featuredOrder})
      on conflict (id) do update set
        sku = excluded.sku, name = excluded.name, slug = excluded.slug, brand = excluded.brand,
        category_id = excluded.category_id, price = excluded.price, stock = excluded.stock,
        description = excluded.description, video_url = excluded.video_url, published = excluded.published,
        is_featured = excluded.is_featured`
    await sql`delete from product_images where product_id = ${id}`
    await sql`delete from product_compatibility where product_id = ${id}`
    for (let i = 0; i < p.images.length; i++) {
      await sql`insert into product_images (product_id, url, position) values (${id}, ${p.images[i]}, ${i})`
    }
    for (const m of p.compatibleWith) {
      await sql`insert into product_compatibility (product_id, model) values (${id}, ${m})`
    }
  }
  console.log('seed done')
}

run().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 6: (After provisioning) run migration + seed live**

Run: `vercel env pull && node db/seed.mjs`
Expected: `seed done`, and `select count(*) from products` matches `PRODUCTS.length`.

- [ ] **Step 7: Commit**

```bash
git add db/seed.mjs api/_lib/categories.js tests/categories-dataaccess.test.js
git commit -m "feat: category data-access + seed script"
```

---

## Task 4: Shared request helpers (json, error, admin auth)

**Files:**
- Create: `api/_lib/http.js`
- Test: `tests/http.test.js`

**Interfaces:**
- Produces:
  - `json(res, status, body)` — writes a JSON response
  - `requireAdmin(req)` → `{ ok: true } | { ok: false, status, error }` — enforces `APP_TARGET==='admin'` and the `x-admin-secret` header

- [ ] **Step 1: Failing test**

Create `tests/http.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requireAdmin } from '../api/_lib/http.js'

test('requireAdmin fails when APP_TARGET is not admin', () => {
  delete process.env.APP_TARGET
  const r = requireAdmin({ headers: {} })
  assert.equal(r.ok, false)
  assert.equal(r.status, 404)
})

test('requireAdmin fails on bad secret', () => {
  process.env.APP_TARGET = 'admin'
  process.env.ADMIN_API_SECRET = 'right'
  const r = requireAdmin({ headers: { 'x-admin-secret': 'wrong' } })
  assert.equal(r.ok, false)
  assert.equal(r.status, 401)
})

test('requireAdmin passes with correct target + secret', () => {
  process.env.APP_TARGET = 'admin'
  process.env.ADMIN_API_SECRET = 'right'
  const r = requireAdmin({ headers: { 'x-admin-secret': 'right' } })
  assert.equal(r.ok, true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/http.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `api/_lib/http.js`**

```js
export function json(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

// Admin write endpoints only exist on the admin deployment (APP_TARGET=admin)
// and require the shared secret header. On the storefront deployment this
// returns 404 so the endpoint appears not to exist.
export function requireAdmin(req) {
  if (process.env.APP_TARGET !== 'admin') return { ok: false, status: 404, error: 'Not found' }
  const secret = req.headers['x-admin-secret']
  if (!secret || secret !== process.env.ADMIN_API_SECRET) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }
  return { ok: true }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/http.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/http.js tests/http.test.js
git commit -m "feat: api http helpers + admin auth guard"
```

---

## Task 5: Public read endpoints

**Files:**
- Create: `api/products/index.js`, `api/products/[id].js`, `api/categories/index.js`
- Modify: `vercel.json` (exclude `/api` from the SPA rewrite)

**Interfaces:**
- Consumes: `getSql`, `listProducts`, `getProduct`, `listCategories`, `json`.

- [ ] **Step 1: Fix the SPA rewrite so `/api/*` is not swallowed**

Modify `vercel.json`:

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: `GET /api/products`**

Create `api/products/index.js`:

```js
import { getSql } from '../_lib/db.js'
import { listProducts } from '../_lib/products.js'
import { json } from '../_lib/http.js'

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://x')
    const products = await listProducts(getSql(), {
      publishedOnly: true,
      category: url.searchParams.get('category') || undefined,
      q: url.searchParams.get('q') || undefined,
      featured: url.searchParams.get('featured') === 'true' ? true : undefined,
    })
    json(res, 200, { products })
  } catch (e) {
    json(res, 500, { error: String(e.message || e) })
  }
}
```

- [ ] **Step 3: `GET /api/products/[id]`**

Create `api/products/[id].js`:

```js
import { getSql } from '../_lib/db.js'
import { getProduct } from '../_lib/products.js'
import { json } from '../_lib/http.js'

export default async function handler(req, res) {
  try {
    const id = req.query?.id || new URL(req.url, 'http://x').pathname.split('/').pop()
    const product = await getProduct(getSql(), id)
    if (!product) return json(res, 404, { error: 'Produk tidak ditemukan' })
    json(res, 200, { product })
  } catch (e) {
    json(res, 500, { error: String(e.message || e) })
  }
}
```

- [ ] **Step 4: `GET /api/categories`**

Create `api/categories/index.js`:

```js
import { getSql } from '../_lib/db.js'
import { listCategories } from '../_lib/categories.js'
import { json } from '../_lib/http.js'

export default async function handler(req, res) {
  try {
    const categories = await listCategories(getSql())
    json(res, 200, { categories })
  } catch (e) {
    json(res, 500, { error: String(e.message || e) })
  }
}
```

- [ ] **Step 5: (After provisioning) verify live**

Run: `vercel dev` then `curl localhost:3000/api/products | head`
Expected: JSON with a `products` array; `curl localhost:3000/api/categories` returns 5 categories.

- [ ] **Step 6: Commit**

```bash
git add api/products api/categories vercel.json
git commit -m "feat: public read endpoints for products + categories"
```

---

## Task 6: Admin write endpoints

**Files:**
- Create: `api/admin/products/index.js` (GET all + POST), `api/admin/products/[id].js` (PUT + DELETE)

**Interfaces:**
- Consumes: `requireAdmin`, `getSql`, `listProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `validateProductInput`, `json`.

- [ ] **Step 1: `GET /api/admin/products` + `POST`**

Create `api/admin/products/index.js`:

```js
import { getSql } from '../../_lib/db.js'
import { listProducts, createProduct, validateProductInput } from '../../_lib/products.js'
import { json, requireAdmin } from '../../_lib/http.js'

async function readBody(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  return JSON.parse(Buffer.concat(chunks).toString() || '{}')
}

export default async function handler(req, res) {
  const auth = requireAdmin(req)
  if (!auth.ok) return json(res, auth.status, { error: auth.error })
  try {
    if (req.method === 'GET') {
      const products = await listProducts(getSql(), { publishedOnly: false })
      return json(res, 200, { products })
    }
    if (req.method === 'POST') {
      const v = validateProductInput(await readBody(req))
      if (!v.ok) return json(res, 400, { error: v.error })
      const product = await createProduct(getSql(), v.value)
      return json(res, 201, { product })
    }
    json(res, 405, { error: 'Method not allowed' })
  } catch (e) {
    json(res, 500, { error: String(e.message || e) })
  }
}
```

- [ ] **Step 2: `PUT` + `DELETE /api/admin/products/[id]`**

Create `api/admin/products/[id].js`:

```js
import { getSql } from '../../_lib/db.js'
import { updateProduct, deleteProduct, validateProductInput } from '../../_lib/products.js'
import { json, requireAdmin } from '../../_lib/http.js'

async function readBody(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  return JSON.parse(Buffer.concat(chunks).toString() || '{}')
}

export default async function handler(req, res) {
  const auth = requireAdmin(req)
  if (!auth.ok) return json(res, auth.status, { error: auth.error })
  const id = req.query?.id || new URL(req.url, 'http://x').pathname.split('/').pop()
  try {
    if (req.method === 'PUT') {
      const v = validateProductInput(await readBody(req))
      if (!v.ok) return json(res, 400, { error: v.error })
      const product = await updateProduct(getSql(), id, v.value)
      if (!product) return json(res, 404, { error: 'Produk tidak ditemukan' })
      return json(res, 200, { product })
    }
    if (req.method === 'DELETE') {
      const ok = await deleteProduct(getSql(), id)
      if (!ok) return json(res, 404, { error: 'Produk tidak ditemukan' })
      return json(res, 200, { ok: true })
    }
    json(res, 405, { error: 'Method not allowed' })
  } catch (e) {
    json(res, 500, { error: String(e.message || e) })
  }
}
```

- [ ] **Step 3: (After provisioning) verify auth gating**

Run: on the storefront deployment, `curl -X POST .../api/admin/products` → expect 404. On admin without header → 401. With header → creates.

- [ ] **Step 4: Commit**

```bash
git add api/admin
git commit -m "feat: protected admin product write endpoints"
```

---

## Task 7: Client fetch layer

**Files:**
- Create: `src/lib/api.js` (public reads), `src/lib/adminApi.js` (admin writes)
- Test: `tests/api-client.test.js`

**Interfaces:**
- Produces (`src/lib/api.js`): `fetchProducts(params)`, `fetchProduct(id)`, `fetchCategories()` — all return parsed data, throw on non-2xx.
- Produces (`src/lib/adminApi.js`): `adminListProducts()`, `adminCreateProduct(data)`, `adminUpdateProduct(id, data)`, `adminDeleteProduct(id)` — send `x-admin-secret` from `import.meta.env.VITE_ADMIN_SECRET` (admin build only; used only for local dev / same-origin calls behind Deployment Protection).

- [ ] **Step 1: Failing test (mocked fetch)**

Create `tests/api-client.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchProducts } from '../src/lib/api.js'

test('fetchProducts returns products array on 200', async () => {
  global.fetch = async () => ({ ok: true, json: async () => ({ products: [{ id: 'p1' }] }) })
  const out = await fetchProducts()
  assert.deepEqual(out, [{ id: 'p1' }])
})

test('fetchProducts throws on non-2xx', async () => {
  global.fetch = async () => ({ ok: false, status: 500, json: async () => ({ error: 'x' }) })
  await assert.rejects(() => fetchProducts())
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/api-client.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/api.js`**

```js
async function getJson(url) {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Request gagal (${res.status})`)
  return body
}

export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const body = await getJson(`/api/products${qs ? `?${qs}` : ''}`)
  return body.products
}

export async function fetchProduct(id) {
  const body = await getJson(`/api/products/${id}`)
  return body.product
}

export async function fetchCategories() {
  const body = await getJson('/api/categories')
  return body.categories
}
```

- [ ] **Step 4: Implement `src/lib/adminApi.js`**

```js
const SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

async function send(url, method, data) {
  const res = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json', 'x-admin-secret': SECRET },
    body: data ? JSON.stringify(data) : undefined,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Request gagal (${res.status})`)
  return body
}

export async function adminListProducts() {
  return (await send('/api/admin/products', 'GET')).products
}
export async function adminCreateProduct(data) {
  return (await send('/api/admin/products', 'POST', data)).product
}
export async function adminUpdateProduct(id, data) {
  return (await send(`/api/admin/products/${id}`, 'PUT', data)).product
}
export async function adminDeleteProduct(id) {
  return (await send(`/api/admin/products/${id}`, 'DELETE')).ok
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/api-client.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/api.js src/lib/adminApi.js tests/api-client.test.js
git commit -m "feat: client fetch layer for products api"
```

---

## Task 8: Refactor storefront hooks to fetch from the API

Move products/categories out of the seed store. `useProducts`/`useProduct`/`useCategories` fetch from the API and expose loading/error, while keeping the data shape identical.

**Files:**
- Modify: `src/store/hooks.js`
- Modify: `src/store/seed.js` (drop `products`, `categories` from the seed — leave orders/users/etc.)
- Modify consumers for loading/empty states: `src/pages/HomePage.jsx`, `src/pages/SearchPage.jsx`, `src/pages/ProductDetailPage.jsx`

**Interfaces:**
- Consumes: `fetchProducts`, `fetchProduct`, `fetchCategories` (Task 7).
- Produces: `useProducts()` → `{ products, loading, error }`; `useProduct(id)` → `{ product, loading, error }`; `useCategories()` → `{ categories, loading, error }`.

> **Note for the implementer:** these hooks currently return raw arrays. Changing them to `{ products, loading, error }` means every consumer must destructure. Grep for `useProducts(`, `useProduct(`, `useCategories(` across `src` and update each call site (storefront pages, `Nav.jsx`, admin pages that read products). Admin read pages may instead use `adminListProducts()` — see Task 9.

- [ ] **Step 1: Reimplement the three hooks**

In `src/store/hooks.js`, replace the product/category hooks:

```js
import { useState, useEffect } from 'react'
import { fetchProducts, fetchProduct, fetchCategories } from '../lib/api.js'

export function useProducts(params) {
  const [state, setState] = useState({ products: [], loading: true, error: null })
  const key = JSON.stringify(params || {})
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fetchProducts(params)
      .then((products) => alive && setState({ products, loading: false, error: null }))
      .catch((error) => alive && setState({ products: [], loading: false, error }))
    return () => { alive = false }
  }, [key])
  return state
}

export function useProduct(id) {
  const [state, setState] = useState({ product: null, loading: true, error: null })
  useEffect(() => {
    let alive = true
    setState({ product: null, loading: true, error: null })
    fetchProduct(id)
      .then((product) => alive && setState({ product, loading: false, error: null }))
      .catch((error) => alive && setState({ product: null, loading: false, error }))
    return () => { alive = false }
  }, [id])
  return state
}

export function useCategories() {
  const [state, setState] = useState({ categories: [], loading: true, error: null })
  useEffect(() => {
    let alive = true
    fetchCategories()
      .then((categories) => alive && setState({ categories, loading: false, error: null }))
      .catch((error) => alive && setState({ categories: [], loading: false, error }))
    return () => { alive = false }
  }, [])
  return state
}
```

- [ ] **Step 2: Drop products/categories from the seed**

In `src/store/seed.js`, remove `products: PRODUCTS` and `categories: CATEGORIES` from `buildSeed()` and their imports. Bump `VERSION`. Leave orders/users/promos/shipping/homepage untouched.

- [ ] **Step 3: Update consumers to destructure + handle loading**

For each of `HomePage.jsx`, `SearchPage.jsx`, `ProductDetailPage.jsx`, and any other call site found by grep, change e.g. `const products = useProducts()` → `const { products, loading, error } = useProducts()` and render a simple loading and error state. Example for `ProductDetailPage.jsx`:

```jsx
const { product, loading, error } = useProduct(id)
if (loading) return (<div><Nav /><p className="p-16 text-center text-neutral-500">Memuat…</p><Footer /></div>)
if (error) return (<div><Nav /><p className="p-16 text-center text-neutral-500">Gagal memuat produk.</p><Footer /></div>)
if (!product) { /* existing not-found EmptyState */ }
```

- [ ] **Step 4: (After provisioning) verify storefront reads from API**

Run: `vercel dev`, open the home + a product page. Products render from Neon. Stop one product's `published=false` in DB → it disappears from the list.

- [ ] **Step 5: Commit**

```bash
git add src/store/hooks.js src/store/seed.js src/pages/HomePage.jsx src/pages/SearchPage.jsx src/pages/ProductDetailPage.jsx
git commit -m "feat: storefront reads products/categories from api"
```

---

## Task 9: Wire admin dashboard to the write API

Point the admin product screens at `adminApi`, and drop the removed review fields from the form.

**Files:**
- Modify: `src/pages/admin/ProductsPage.jsx`, `src/pages/admin/ProductFormPage.jsx`
- Modify: any admin hook/store read of products to use `adminListProducts()`

**Interfaces:**
- Consumes: `adminListProducts`, `adminCreateProduct`, `adminUpdateProduct`, `adminDeleteProduct` (Task 7).

- [ ] **Step 1: List page loads from admin API**

In `ProductsPage.jsx`, replace the store read with a fetch:

```jsx
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(true)
useEffect(() => {
  adminListProducts().then((p) => { setProducts(p); setLoading(false) }).catch(() => setLoading(false))
}, [])
```

Wire the delete action to `adminDeleteProduct(id)` then refresh the list.

- [ ] **Step 2: Form create/update via API + drop review fields**

In `ProductFormPage.jsx`: on submit call `adminCreateProduct` or `adminUpdateProduct`. Load the edit target with `fetchProduct(id)`. Remove any inputs bound to `rating`, `reviewCount`, or `testimonials` (these no longer exist in the schema).

- [ ] **Step 3: (After provisioning) verify end to end**

Run: on the admin dev server, create a product → it appears in the list; open the storefront → the product shows; edit its name in admin → storefront reflects it after reload; delete → it disappears.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/ProductsPage.jsx src/pages/admin/ProductFormPage.jsx
git commit -m "feat: admin dashboard product CRUD via api"
```

---

## Task 10: Full-flow verification + docs

**Files:**
- Modify: `README` or `docs/` note on running with Neon (env vars, seed command)

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: all `node --test` files pass.

- [ ] **Step 2: Manual full-flow (after provisioning)**

Admin: create → edit → delete a product; toggle `is_featured`. Storefront: home featured list, search, product detail all reflect DB state. Confirm `/api/admin/*` returns 404 on the storefront deployment.

- [ ] **Step 3: Document env + seed**

Add a short section to the repo docs: required env vars per project (`DATABASE_URL`, `APP_TARGET`, `ADMIN_API_SECRET`, `VITE_ADMIN_SECRET`), and `node db/seed.mjs` to seed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: neon env + seed instructions"
```

---

## Self-Review notes

- **Spec coverage:** schema (T1), data-access/shaping no-reviews (T2), seed (T3), auth/security gating (T4, T6), public reads (T5), admin writes (T6), hook seam (T8), admin wiring + drop review fields (T9), testing (T2/T3/T4/T7 unit + T5/T8/T9 integration), phasing/URL-only images (Global Constraints). Image upload + landing-copy CMS explicitly deferred.
- **Placeholders:** none — every code step has real code. Consumer edits in T8/T9 reference the exact grep targets.
- **Type consistency:** product shape (`images: string[]`, `compatibleWith`, `category`, `videoUrl`, `isFeatured`) is defined in T2 `shapeProduct` and consumed unchanged by hooks/UI. `requireAdmin` return shape consistent across T4/T5/T6. Hook return shape `{ products, loading, error }` consistent T8/consumers.
- **Known risk:** T8 changes hook return types — every call site must be updated in the same task or the build breaks. The task step calls this out and instructs a grep sweep.
