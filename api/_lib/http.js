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
