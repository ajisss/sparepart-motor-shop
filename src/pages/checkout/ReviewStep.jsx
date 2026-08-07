import Button from '../../components/ui/Button'
import OrderSummary from '../../components/checkout/OrderSummary'
import PromoInput from '../../components/checkout/PromoInput'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../store/hooks'
import { formatCurrency } from '../../utils/formatCurrency'
import { computeTotals } from '../../utils/checkout'

export default function ReviewStep({
  data,
  onBack,
  onPay,
  promoApplied,
  onApplyPromo,
  onRemovePromo,
  promoError,
}) {
  const { items, subtotal } = useCart()
  const { products } = useProducts()

  const rows = items
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) }))
    .filter((r) => r.product)

  const { contact, address, shipping } = data
  const shippingCost = shipping?.cost || 0
  const discount = promoApplied?.discount || 0
  const { total } = computeTotals({ subtotal, shippingCost, discount })

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Ringkasan pesanan</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Periksa kembali data sebelum menyelesaikan pembayaran.
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Penerima</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.18px] text-neutral-600">Kontak</span>
            <p className="text-sm font-medium text-neutral-900">
              {address.recipientName || contact.name}
            </p>
            <p className="text-sm text-neutral-600">{contact.phone || address.phone}</p>
            {contact.email && <p className="text-sm text-neutral-600">{contact.email}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.18px] text-neutral-600">Alamat</span>
            <p className="text-sm text-neutral-600">
              {address.line}, {address.city}, {address.province} {address.postalCode}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Pengiriman</h3>
        {shipping ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {shipping.courier} — {shipping.service}
              </p>
              <p className="text-sm text-neutral-600">{shipping.etaLabel}</p>
            </div>
            <span className="text-sm font-medium text-neutral-900">
              {formatCurrency(shipping.cost)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">Belum dipilih</p>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Detail produk</h3>
        <div className="flex flex-col gap-3">
          {rows.map(({ productId, qty, product }) => (
            <div key={productId} className="flex gap-3">
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="size-14 shrink-0 rounded-xl bg-neutral-50 object-cover"
              />
              <div className="flex flex-1 items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                  <p className="text-sm text-neutral-600">Qty {qty}</p>
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  {formatCurrency(product.price * qty)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Kode promo</h3>
        <PromoInput
          applied={promoApplied}
          onApply={onApplyPromo}
          onRemove={onRemovePromo}
          error={promoError}
        />
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Ringkasan pembayaran</h3>
        <OrderSummary
          subtotal={subtotal}
          shippingCost={shippingCost}
          discount={discount}
          total={total}
        />
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
          Kembali
        </Button>
        <Button variant="primary" onClick={onPay} className="w-full sm:w-auto">
          Bayar
        </Button>
      </div>
    </div>
  )
}
