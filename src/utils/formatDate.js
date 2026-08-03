// Format an ISO date string to Indonesian locale, e.g. "3 Agustus 2026, 14.30".
// Returns '' for empty or invalid input so callers can render safely.
export function formatDate(iso, opts = {}) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  })
}
