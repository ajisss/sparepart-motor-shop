const STATUS_COLORS = {
  'Menunggu pembayaran': 'bg-warning/10 text-warning',
  'Sedang diproses': 'bg-info/10 text-info',
  'Siap dikirim': 'bg-info/10 text-info',
  'Dalam pengiriman': 'bg-primary-100 text-primary-800',
  Selesai: 'bg-success/10 text-success',
  'Refund diproses': 'bg-error/10 text-error',
}

export default function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-neutral-100 text-neutral-800'
  return (
    <span className={`inline-flex items-center rounded-pill px-3 py-1 text-sm font-medium ${cls}`}>
      {status}
    </span>
  )
}
