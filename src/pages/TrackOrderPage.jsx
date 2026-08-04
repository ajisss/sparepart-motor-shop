import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import FormField from '../components/ui/FormField'
import SectionBanner from '../components/ui/SectionBanner'
import { useStore } from '../store/StoreProvider'
import { contactMatches } from '../utils/tracking'
import { SECTION_BANNERS } from '../data/sectionBanners'

export default function TrackOrderPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { orders } = useStore()
  const [orderId, setOrderId] = useState(location.state?.orderId || '')
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const id = orderId.trim()
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase())
    if (order && contactMatches(order, contact)) {
      navigate(`/pesanan/${order.id}`, { state: { verified: true } })
      return
    }
    setError('Order ID atau email/HP tidak cocok.')
  }

  return (
    <div>
      <Nav />
      <div className="px-4 pt-6 lg:px-16 lg:pt-10">
        <SectionBanner {...SECTION_BANNERS.tracking} />
      </div>
      <section className="mx-auto flex w-full max-w-[440px] flex-col gap-6 px-4 py-10 lg:py-16">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium text-neutral-900">Masukkan detail pesanan</h2>
          <p className="text-sm text-neutral-600">
            Masukkan Order ID beserta email atau nomor HP yang Anda gunakan saat checkout.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Order ID" htmlFor="orderId">
            <Input
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ORD-XXXXXXXX"
            />
          </FormField>
          <FormField label="Email atau Nomor HP" htmlFor="contact" error={error}>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email@contoh.com atau 08xxxxxxxxxx"
            />
          </FormField>
          <Button type="submit" variant="primary" className="w-full">
            Lacak Pesanan
          </Button>
        </form>
      </section>
      <Footer />
    </div>
  )
}
