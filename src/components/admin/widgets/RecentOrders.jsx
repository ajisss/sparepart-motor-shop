import AdminStatusBadge from './AdminStatusBadge'
import { ArrowRight } from '../icons'
import { formatCurrency } from '../../../utils/formatCurrency'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Latest orders table. Not a literal Figma widget, but the natural companion to
// the Commerly dashboard grid and needed for a real admin overview.
export default function RecentOrders({ orders }) {
  return (
    <div className="adm-card flex flex-col p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--adm-text)]">Pesanan Terbaru</p>
        <a
          href="/admin/orders"
          className="flex items-center gap-1 text-xs font-medium text-[var(--adm-forest-500)] hover:underline"
        >
          Lihat semua <ArrowRight className="size-3.5" />
        </a>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-xs text-[var(--adm-muted)]">
              <th className="pb-3 font-medium">Order ID</th>
              <th className="pb-3 font-medium">Pelanggan</th>
              <th className="pb-3 font-medium">Item</th>
              <th className="pb-3 font-medium">Total</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[var(--adm-border)]">
                <td className="py-3 font-medium text-[var(--adm-ink)]">{o.id}</td>
                <td className="py-3 text-[var(--adm-text)]">{o.customer}</td>
                <td className="py-3 text-[var(--adm-muted)]">{o.itemCount} item</td>
                <td className="py-3 font-medium text-[var(--adm-ink)]">{formatCurrency(o.total)}</td>
                <td className="py-3">
                  <AdminStatusBadge status={o.status} />
                </td>
                <td className="py-3 text-[var(--adm-muted)]">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-sm text-[var(--adm-muted)]">
                  Belum ada pesanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
