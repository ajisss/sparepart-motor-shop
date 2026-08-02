import Button from '../../components/ui/Button'
import PriceTag from '../../components/ui/PriceTag'
import { useCart } from '../../context/CartContext'
import { PRODUCTS } from '../../data/products'
import { formatCurrency } from '../../utils/formatCurrency'
import { DELIVERY_OPTIONS } from './DeliveryStep'
import { PAYMENT_OPTIONS } from './PaymentStep'

export default function ReviewStep({ data, onBack, onConfirm }) {
  const { items, subtotal } = useCart()
  const rows = items
    .map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.productId) }))
    .filter((r) => r.product)

  const delivery = DELIVERY_OPTIONS.find((o) => o.id === data.deliveryMethod)
  const payment = PAYMENT_OPTIONS.find((o) => o.id === data.paymentMethod)
  const shippingCost = delivery?.price ?? 0
  const total = subtotal + shippingCost

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Review pesanan</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Pastikan semua informasi sudah benar sebelum konfirmasi pesanan.
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Informasi pengiriman</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.18px] text-neutral-600">Kontak</span>
            <p className="text-sm font-medium text-neutral-900">{data.address.name}</p>
            <p className="text-sm text-neutral-600">{data.address.phone}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.18px] text-neutral-600">Alamat pengiriman</span>
            <p className="text-sm text-neutral-600">{data.address.fullAddress}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Metode pengiriman</h3>
        {delivery ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900">{delivery.label}</p>
              <p className="text-sm text-neutral-600">{delivery.eta}</p>
            </div>
            <span className="text-sm font-medium text-neutral-900">{formatCurrency(delivery.price)}</span>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">Belum dipilih</p>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Metode pembayaran</h3>
        <p className="text-sm text-neutral-600">{payment ? payment.label : 'Belum dipilih'}</p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Detail produk</h3>
        <div className="flex flex-col gap-3">
          {rows.map(({ productId, qty, product }) => (
            <div key={productId} className="flex gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="size-14 shrink-0 rounded-xl bg-neutral-50 object-cover"
              />
              <div className="flex flex-1 items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                  <p className="text-sm text-neutral-600">Qty {qty}</p>
                </div>
                <PriceTag amount={product.price * qty} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-neutral-100 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Ringkasan pembayaran</h3>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Ongkos kirim</span>
          <span>{shippingCost > 0 ? formatCurrency(shippingCost) : 'Gratis'}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-100 pt-3 font-semibold text-neutral-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
          Kembali
        </Button>
        <Button variant="primary" onClick={onConfirm} className="w-full sm:w-auto">
          Konfirmasi Pesanan
        </Button>
      </div>
    </div>
  )
}
