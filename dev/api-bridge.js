// Dev-only bridge: serve the /api Vercel Functions during `vite` dev so the app
// runs full-stack locally (UI + API + Neon) without Vercel. In production these
// files are served natively by Vercel and this bridge never runs (apply:'serve').

const ROUTES = [
  { re: /^\/api\/products\/([^/]+)\/?$/, file: '/api/products/[id].js', param: 'id' },
  { re: /^\/api\/products\/?$/, file: '/api/products/index.js' },
  { re: /^\/api\/categories\/?$/, file: '/api/categories/index.js' },
  { re: /^\/api\/admin\/products\/([^/]+)\/?$/, file: '/api/admin/products/[id].js', param: 'id' },
  { re: /^\/api\/admin\/products\/?$/, file: '/api/admin/products/index.js' },
]

export function apiBridge() {
  return {
    name: 'dev-api-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()
        const route = ROUTES.find((r) => r.re.test(url.pathname))
        if (!route) return next()
        const m = url.pathname.match(route.re)
        req.query = Object.fromEntries(url.searchParams)
        if (route.param && m[1]) req.query[route.param] = decodeURIComponent(m[1])
        try {
          const mod = await server.ssrLoadModule(route.file)
          await mod.default(req, res)
        } catch (e) {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: String((e && e.message) || e) }))
        }
      })
    },
  }
}
