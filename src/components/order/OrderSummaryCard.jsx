import StatusBadge from '../ui/StatusBadge'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

// Read-only light-theme summary of an order. Mirrors the CheckoutSuccessPage
// block but as a normal card for the detail/tracking surface.
export default function OrderSummaryCard({ order }) {
  const address = order.shippingAddress || {}
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-4">
        <div>
          <p className="font-mono text-sm font-medium text-neutral-900">{order.id}</p>
          <p className="text-xs text-neutral-500">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-2 border-b border-neutral-100 p-4">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-neutral-700">
              {item.name} <span className="text-neutral-400">× {item.qty}</span>
            </span>
            <span className="shrink-0 text-neutral-900">{formatCurrency(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-sm font-medium">
          <span className="text-neutral-900">Total</span>
          <span className="text-primary-700">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-b border-neutral-100 p-4 text-sm">
        <p className="font-medium text-neutral-900">Pengiriman</p>
        <p className="text-neutral-600">
          {order.shipping?.courier} · {order.shipping?.service}
        </p>
        {order.shipping?.etaLabel && <p className="text-neutral-400">{order.shipping.etaLabel}</p>}
      </div>

      <div className="flex flex-col gap-1 p-4 text-sm">
        <p className="font-medium text-neutral-900">Penerima</p>
        <p className="text-neutral-600">{order.contact?.name}</p>
        <p className="text-neutral-400">
          {address.recipientName}
          {address.phone ? ` · ${address.phone}` : ''}
        </p>
        <p className="text-neutral-400">
          {[address.line, address.city, address.province, address.postalCode].filter(Boolean).join(', ')}
        </p>
      </div>
    </div>
  )
}
