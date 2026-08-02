import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import ShippingStep from './checkout/ShippingStep'
import DeliveryStep, { DELIVERY_OPTIONS } from './checkout/DeliveryStep'
import PaymentStep from './checkout/PaymentStep'
import ReviewStep from './checkout/ReviewStep'
import { generateOrderNumber } from '../utils/orderNumber'

const STEPS = [
  { id: 'shipping', label: 'Pengiriman' },
  { id: 'delivery', label: 'Metode Kirim' },
  { id: 'payment', label: 'Pembayaran' },
  { id: 'review', label: 'Review' },
]

function Stepper({ stepIndex }) {
  return (
    <div className="flex flex-col gap-2 border-b border-neutral-100 p-4 lg:p-6">
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center gap-1 last:flex-none">
            <span
              className={`size-2 shrink-0 rounded-full ${
                i <= stepIndex ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
            />
            {i < STEPS.length - 1 && (
              <span className={`h-0.5 flex-1 rounded-full ${i < stepIndex ? 'bg-primary-600' : 'bg-neutral-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-start justify-between text-xs font-medium tracking-[-0.24px] sm:text-sm">
        {STEPS.map((s, i) => (
          <span key={s.id} className={i === stepIndex ? 'text-neutral-900' : 'text-neutral-600'}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clearCart, subtotal, itemCount } = useCart()
  const [step, setStep] = useState('shipping')
  const [data, setData] = useState({
    address: { name: '', phone: '', fullAddress: '' },
    deliveryMethod: null,
    paymentMethod: null,
  })

  // Guard against landing on /checkout with an empty cart, but only on mount —
  // this must not react to clearCart() being called as part of confirming an
  // order (which also happens on this page), or it would race with the
  // navigate('/checkout/success') call below and bounce the user to /cart.
  const wasEmptyOnMount = useRef(items.length === 0)
  useEffect(() => {
    if (wasEmptyOnMount.current) {
      navigate('/cart', { replace: true })
    }
  }, [navigate])

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const goNext = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)].id)
  const goBack = () => setStep(STEPS[Math.max(stepIndex - 1, 0)].id)

  const handleChange = (patch) => setData((prev) => ({ ...prev, ...patch }))

  const handleConfirm = () => {
    const orderNumber = generateOrderNumber()
    clearCart()
    navigate('/checkout/success', { state: { orderNumber } })
  }

  if (items.length === 0) {
    return null
  }

  const shippingCost = DELIVERY_OPTIONS.find((o) => o.id === data.deliveryMethod)?.price ?? 0

  return (
    <div>
      <Nav />
      <section className="flex flex-col gap-6 px-4 py-8 lg:flex-row-reverse lg:items-start lg:gap-6 lg:px-16">
        <div className="flex flex-1 flex-col rounded-2xl border border-neutral-100 lg:min-w-0">
          <Stepper stepIndex={stepIndex} />
          {step === 'shipping' && <ShippingStep data={data} onChange={handleChange} onNext={goNext} />}
          {step === 'delivery' && (
            <DeliveryStep data={data} onChange={handleChange} onNext={goNext} onBack={goBack} />
          )}
          {step === 'payment' && (
            <PaymentStep data={data} onChange={handleChange} onNext={goNext} onBack={goBack} />
          )}
          {step === 'review' && <ReviewStep data={data} onBack={goBack} onConfirm={handleConfirm} />}
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-neutral-100 p-6 lg:w-80 lg:shrink-0">
          <h2 className="font-semibold text-neutral-900">Ringkasan Pesanan</h2>
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Subtotal ({itemCount} produk)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Ongkos kirim</span>
            <span>{data.deliveryMethod ? formatCurrency(shippingCost) : 'Dihitung di langkah berikutnya'}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-4 font-semibold text-primary-600">
            <span>Estimasi total</span>
            <span>{formatCurrency(subtotal + shippingCost)}</span>
          </div>
        </aside>
      </section>
      <Footer />
    </div>
  )
}
