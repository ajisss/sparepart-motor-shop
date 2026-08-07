export function toCategorySeed(categories) {
  return categories.map((c, i) => ({ id: c.id, slug: c.id, name: c.name, position: i }))
}

export async function listCategories(sql) {
  return sql`select id, slug, name, position from categories order by position`
}
