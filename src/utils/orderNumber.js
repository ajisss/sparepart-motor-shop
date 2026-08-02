export function generateOrderNumber() {
  const suffix = Array.from({ length: 8 }, () => Math.floor(Math.random() * 36).toString(36))
    .join('')
    .toUpperCase()
  return `ORD-${suffix}`
}
