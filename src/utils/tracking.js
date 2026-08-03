// Whether a guest tracking query (email OR phone) matches an order's contact.
// Case-insensitive, trimmed. Returns false for a missing order or empty query.
export function contactMatches(order, query) {
  if (!order) return false
  const q = String(query || '').trim().toLowerCase()
  if (!q) return false
  const email = String(order.contact?.email || '').trim().toLowerCase()
  const phone = String(order.contact?.phone || '').trim().toLowerCase()
  return q === email || q === phone
}
