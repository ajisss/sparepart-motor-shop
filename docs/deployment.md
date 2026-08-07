# DMB Moto Shop — Setup & Deployment

Catalog-only storefront + product CMS admin. **One repo → two Vercel projects**, one shared Neon Postgres database.

## Architecture at a glance

```
              same repo, VITE_APP_TARGET picks the build (alias @app)
        ┌──────────────────────────┴──────────────────────────┐
   npm run build                                       npm run build:admin
   (StorefrontApp — public catalog)                    (AdminApp — dashboard)
        │                                                       │
   Vercel Project: STOREFRONT                          Vercel Project: ADMIN
   domainmu.com — no protection                        admin.domainmu.com
   DATABASE_URL = read-only role                       behind Deployment Protection
        └───────────────────────┬───────────────────────────────┘
                                ▼
                     Neon Postgres (shared)
```

- The admin bundle is **structurally excluded** from the storefront build (the `@app` alias resolves to exactly one app). Verified: zero admin code/strings in the storefront bundle.
- Admin write endpoints (`/api/admin/*`) are gated by `APP_TARGET=admin` **and** an `x-admin-secret` header — so even though both deployments ship the same `/api` folder, writes only work on the protected admin deployment.

## Environment variables

### Storefront project
| Var | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | Neon connection string — **read-only role** | Server-only. Storefront never writes. |

Build Command: `npm run build` (default).

### Admin project
| Var | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | Neon connection string — **read-write role** | Server-only. |
| `APP_TARGET` | `admin` | Runtime flag; enables the write endpoints. Required. |
| `ADMIN_API_SECRET` | a long random secret | Write endpoints require header `x-admin-secret` == this. |
| `VITE_ADMIN_SECRET` | **same value** as `ADMIN_API_SECRET` | The admin client sends it as the header. |
| `VITE_ADMIN_EMAIL` | admin login email | The admin account is provisioned from this (not seeded). |
| `VITE_ADMIN_PASSWORD` | admin login password | Without these two, the prod admin build has **no** login. |

Build Command: `npm run build:admin`.

> Note: `VITE_*` vars are compiled into the client bundle. That's acceptable here because the admin bundle is served only from the protected admin deployment. `DATABASE_URL`, `APP_TARGET`, `ADMIN_API_SECRET` are **not** `VITE_`-prefixed and never reach the browser.

### Neon roles (recommended hardening)
Create two Postgres roles in Neon: a read-write role (admin) and a read-only role (`GRANT SELECT` only, storefront). Point each project's `DATABASE_URL` at the matching role. This is the plan's defense-in-depth; a single owner-role string works but is less safe.

## Local development

1. Create `.env.local` (gitignored) at the repo root:
   ```
   DATABASE_URL="postgresql://…neon…/neondb?sslmode=require"
   ADMIN_API_SECRET=devsecret
   VITE_ADMIN_SECRET=devsecret
   ```
   (Local admin login falls back to `admin@dmb.com` / `admin123` in dev; set `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD` to override.)
2. Seed the database (one time, or to reset):
   ```
   node --env-file=.env.local db/seed.mjs
   ```
3. Run:
   - Storefront: `npm run dev` → http://localhost:5173
   - Admin: `npm run dev:admin` → admin at `/admin/<ADMIN_LOGIN_SLUG>`

A dev-only Vite bridge (`dev/api-bridge.js`) serves `/api/*` locally against Neon, so the whole stack runs without Vercel. It is `apply: 'serve'` — never part of a production build.

## Database

- Schema: `db/migrations/001_init.sql` — `categories`, `products`, `product_images`, `product_compatibility`.
- Seed: `db/seed.mjs` — idempotent upsert from `src/data/*.js`. Runs the migration first (statement-by-statement, as Neon's HTTP driver requires).
- Product model has **no** `stock`, `rating`, `reviewCount`, or `testimonials` (catalog has no transactions/reviews).

## Deploy steps (on the Vercel account that owns the projects)

1. `npm i -g vercel` and `vercel login`.
2. Create **two** Vercel projects from this repo (Storefront + Admin), each with the Build Command and env vars above.
3. Admin project → add custom domain `admin.<domain>` and enable **Deployment Protection** (Settings → Deployment Protection: password / Vercel Authentication / IP allowlist).
4. Storefront project → main domain, no protection.
5. Run the seed once against the production Neon branch.

## Pre-launch checklist

- [ ] Change `ADMIN_LOGIN_SLUG` in `src/config/features.js` (default `masuk-dmb`).
- [ ] Set `STORE_WHATSAPP` in `src/config/features.js` (currently a placeholder).
- [ ] Set real `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD` on the admin project.
- [ ] Use a read-only Neon role for the storefront `DATABASE_URL`.
- [ ] (If exposed) rotate the Neon role password.
