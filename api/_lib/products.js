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
