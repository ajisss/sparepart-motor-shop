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
