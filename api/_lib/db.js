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
