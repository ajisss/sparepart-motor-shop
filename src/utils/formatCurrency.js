export function formatCurrency(amount) {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID')
}
