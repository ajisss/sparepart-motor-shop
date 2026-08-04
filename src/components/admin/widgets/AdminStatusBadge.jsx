// Commerly-styled status badge for the admin surface (uses --adm-* tokens),
// distinct from the storefront StatusBadge which uses the black/gold theme.
const STYLES = {
  'Menunggu pembayaran': ['var(--adm-warning)', 'rgba(255,170,51,0.14)'],
  'Sedang diproses': ['var(--adm-info)', 'rgba(0,81,255,0.10)'],
  'Siap dikirim': ['var(--adm-forest-500)', 'rgba(0,0,0,0.08)'],
  'Dalam pengiriman': ['var(--adm-forest-400)', 'rgba(38,38,38,0.10)'],
  Selesai: ['var(--adm-success)', 'var(--adm-success-bg)'],
  'Refund diproses': ['var(--adm-danger)', 'var(--adm-danger-bg)'],
}

export default function AdminStatusBadge({ status }) {
  const [color, bg] = STYLES[status] || ['var(--adm-muted)', 'var(--adm-bg)']
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color, background: bg }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  )
}
