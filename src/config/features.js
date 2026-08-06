// Feature flags for the catalog-only phase.
//
// While we rework the storefront into a landing-page catalog, the customer
// commerce + auth flows (login, cart, checkout, account) are hidden. Flip
// CATALOG_ONLY back to false to restore all of them at once — no other code
// needs to change.
export const CATALOG_ONLY = true

// Store WhatsApp used by the "Hubungi" CTA while checkout is disabled.
// Format: country code + number, no "+" or leading 0 (wa.me format).
export const STORE_WHATSAPP = '6281234567890'

// Admin login lives behind a secret slug instead of the guessable
// /admin/login. The admin reaches the sign-in form at /admin/<slug>; a bare
// /admin (logged out) silently redirects home so the panel isn't advertised.
// NOTE: this is obscurity, not real security — the slug ships in the client
// bundle. Real protection stays in the auth guard. Change this to your own
// secret word and don't share it publicly.
export const ADMIN_LOGIN_SLUG = 'masuk-dmb'
