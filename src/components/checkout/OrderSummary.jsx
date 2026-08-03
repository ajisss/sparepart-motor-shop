import { formatCurrency } from '../../utils/formatCurrency'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-neutral-600">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  )
}

export default function OrderSummary({ subtotal, shippingCost = 0, discount = 0, total }) {
  return (
    <div className="flex flex-col gap-2">
      <Row label="Subtotal" value={subtotal} />
      {shippingCost > 0 && <Row label="Ongkos kirim" value={shippingCost} />}
      {discount > 0 && (
        <div className="flex items-center justify-between text-success">
          <span>Diskon promo</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="font-medium text-neutral-900">Total</span>
        <span className="text-lg font-medium text-neutral-900">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
