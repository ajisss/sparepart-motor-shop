// Discount amount (Rupiah) for a subtotal + promo, or 0 if ineligible.
export function applyPromo(subtotal, promo) {
  if (!promo || !promo.active) return 0
  if (subtotal < (promo.minSpend || 0)) return 0
  if (promo.type === 'percent') return Math.round((subtotal * promo.value) / 100)
  if (promo.type === 'fixed') return Math.min(promo.value, subtotal)
  return 0
}

// Validate a code against the promo list for a subtotal.
// Returns { promo, discount } on success or { error } on failure.
export function validatePromo(code, promos, subtotal) {
  const normalized = String(code || '').trim().toUpperCase()
  if (!normalized) return { error: 'Masukkan kode promo.' }
  const promo = promos.find((p) => p.code.toUpperCase() === normalized)
  if (!promo || !promo.active) return { error: 'Kode promo tidak valid.' }
  if (subtotal < (promo.minSpend || 0)) {
    return { error: `Minimum belanja Rp ${(promo.minSpend || 0).toLocaleString('id-ID')} untuk kode ini.` }
  }
  return { promo, discount: applyPromo(subtotal, promo) }
}

// Final total (never negative).
export function computeTotals({ subtotal, shippingCost = 0, discount = 0 }) {
  return { total: Math.max(0, subtotal + shippingCost - discount) }
}
