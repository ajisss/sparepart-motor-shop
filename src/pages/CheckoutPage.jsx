import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useProducts, usePromos } from '../store/hooks'
import { useStore } from '../store/StoreProvider'
import { computeTotals, validatePromo } from '../utils/checkout'
import OrderSummary from '../components/checkout/OrderSummary'
import Stepper from '../components/checkout/Stepper'
import PaymentModal from '../components/checkout/PaymentModal'
import IdentityStep from './checkout/IdentityStep'
import AddressStep from './checkout/ShippingStep'
import DeliveryStep from './checkout/DeliveryStep'
import ReviewStep from './checkout/ReviewStep'

const STEPS = [
  { id: 'identitas', label: 'Identitas' },
  { id: 'alamat', label: 'Alamat' },
  { id: 'pengiriman', label: 'Pengiriman' },
  { id: 'ringkasan', label: 'Ringkasan' },
]

function buildInitialData(currentUser) {
  const data = {
    mode: null,
    contact: { name: '', phone: '', email: '' },
    address: { recipientName: '', phone: '', line: '', city: '', province: '', postalCode: '' },
    shipping: null,
    promo: null,
  }
  if (currentUser) {
    data.mode = 'account'
    data.contact = {
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      email: currentUser.email || '',
    }
    const def = currentUser.addresses?.find((a) => a.id === currentUser.defaultAddressId)
    if (def) {
      data.address = {
        recipientName: def.recipientName || '',
        phone: def.phone || '',
        line: def.line || '',
        city: def.city || '',
        province: def.province || '',
        postalCode: def.postalCode || '',
      }
    }
  }
  return data
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clearCart, subtotal } = useCart()
  const { currentUser, isLoggedIn } = useAuth()
  const products = useProducts()
  const promos = usePromos()
  const { createOrder } = useStore()

  const [data, setData] = useState(() => buildInitialData(isLoggedIn ? currentUser : null))
  const [step, setStep] = useState(() => (isLoggedIn ? 'alamat' : 'identitas'))
  const [promoError, setPromoError] = useState('')
  const [payOpen, setPayOpen] = useState(false)

  // Guard against landing on /checkout with an empty cart, but only on mount —
  // this must not react to clearCart() being called as part of confirming an
  // order, or it would race with the navigate('/checkout/success') call below
  // and bounce the user to /cart.
  const wasEmptyOnMount = useRef(items.length === 0)
  useEffect(() => {
    if (wasEmptyOnMount.current) {
      navigate('/cart', { replace: true })
    }
  }, [navigate])

  // Prefill exactly once when the user logs in mid-checkout. If they were
  // already logged in at mount, buildInitialData handled it, so this is a no-op.
  const prefilledRef = useRef(isLoggedIn)
  useEffect(() => {
    if (prefilledRef.current || !currentUser) return
    prefilledRef.current = true
    setData((prev) => ({ ...prev, ...buildInitialData(currentUser) }))
  }, [currentUser])

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const goNext = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)].id)
  const goBack = () => setStep(STEPS[Math.max(stepIndex - 1, 0)].id)

  const handleChange = (patch) => setData((prev) => ({ ...prev, ...patch }))

  const handleChooseGuest = () => {
    setData((prev) => ({ ...prev, mode: 'guest' }))
    goNext()
  }

  const handleApplyPromo = (code) => {
    const res = validatePromo(code, promos, subtotal)
    if (res.error) {
      setPromoError(res.error)
      return
    }
    setPromoError('')
    setData((prev) => ({ ...prev, promo: { code: res.promo.code, discount: res.discount } }))
  }

  const handleRemovePromo = () => {
    setPromoError('')
    setData((prev) => ({ ...prev, promo: null }))
  }

  const handlePlaceOrder = (paymentStatus, status) => {
    setPayOpen(false)
    const shippingCost = data.shipping?.cost || 0
    const discount = data.promo?.discount || 0
    const orderItems = items.map((i) => {
      const product = products.find((p) => p.id === i.productId)
      return {
        productId: i.productId,
        sku: product?.sku || '',
        name: product?.name || '',
        price: product?.price || 0,
        qty: i.qty,
      }
    })
    const { total } = computeTotals({ subtotal, shippingCost, discount })
    const order = createOrder({
      userId: currentUser?.id ?? null,
      items: orderItems,
      contact: data.contact,
      address: data.address,
      shipping: data.shipping,
      promo: data.promo,
      subtotal,
      shippingCost,
      discount,
      total,
      paymentStatus,
      status,
    })
    clearCart()
    navigate('/checkout/success', { state: { orderId: order.id, orderNumber: order.id } })
  }

  const handlePaymentResult = (outcome) => {
    if (outcome === 'paid') {
      handlePlaceOrder('paid', 'Sedang diproses')
    } else if (outcome === 'pending') {
      handlePlaceOrder('pending', 'Menunggu pembayaran')
    }
    // 'failed': modal stays open and shows its own inline error; no order is created.
  }

  if (items.length === 0) {
    return null
  }

  const shippingCost = data.shipping?.cost || 0
  const discount = data.promo?.discount || 0
  const { total } = computeTotals({ subtotal, shippingCost, discount })

  return (
    <div>
      <Nav />
      <section className="flex flex-col gap-6 px-4 py-8 lg:flex-row-reverse lg:items-start lg:gap-6 lg:px-16">
        <div className="flex flex-1 flex-col rounded-2xl border border-neutral-100 lg:min-w-0">
          <Stepper steps={STEPS} currentIndex={stepIndex} />
          {step === 'identitas' && (
            <IdentityStep onChooseGuest={handleChooseGuest} onLoggedIn={goNext} />
          )}
          {step === 'alamat' && (
            <AddressStep
              data={data}
              onChange={handleChange}
              onNext={goNext}
              onBack={goBack}
              mode={data.mode}
            />
          )}
          {step === 'pengiriman' && (
            <DeliveryStep data={data} onChange={handleChange} onNext={goNext} onBack={goBack} />
          )}
          {step === 'ringkasan' && (
            <ReviewStep
              data={data}
              onBack={goBack}
              onPay={() => setPayOpen(true)}
              promoApplied={data.promo}
              onApplyPromo={handleApplyPromo}
              onRemovePromo={handleRemovePromo}
              promoError={promoError}
            />
          )}
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-neutral-100 p-6 lg:w-80 lg:shrink-0">
          <h2 className="font-semibold text-neutral-900">Ringkasan Pesanan</h2>
          <OrderSummary
            subtotal={subtotal}
            shippingCost={shippingCost}
            discount={discount}
            total={total}
          />
        </aside>
      </section>
      <PaymentModal
        open={payOpen}
        total={total}
        onClose={() => setPayOpen(false)}
        onResult={handlePaymentResult}
      />
      <Footer />
    </div>
  )
}
