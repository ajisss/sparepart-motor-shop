import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import OrderSummaryCard from '../components/order/OrderSummaryCard'
import OrderTimeline from '../components/order/OrderTimeline'
import { useOrder } from '../store/hooks'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatDate'

export default function OrderDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const order = useOrder(id)

  const isOwner = !!currentUser && order?.userId === currentUser.id
  const isVerifiedGuest = location.state?.verified === true
  const authorized = !!order && (isOwner || isVerifiedGuest)

  useEffect(() => {
    if (!authorized) navigate('/lacak', { replace: true, state: { orderId: id } })
  }, [authorized, id, navigate])

  if (!authorized) return null

  return (
    <div>
      <Nav />
      <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-8 lg:py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-neutral-900 lg:text-2xl">Detail Pesanan</h1>
          <Link to={isOwner ? '/akun?tab=riwayat' : '/lacak'} className="text-sm text-neutral-600">
            ← Kembali
          </Link>
        </div>

        <OrderSummaryCard order={order} />

        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-0 p-4">
          <h2 className="text-sm font-medium text-neutral-900">Riwayat Status</h2>
          <OrderTimeline history={order.statusHistory} />
        </div>

        {order.tracking && (
          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-0 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-neutral-900">Info Pengiriman</h2>
              <span className="font-mono text-sm text-primary-700">{order.tracking.number}</span>
            </div>
            <p className="text-xs text-neutral-500">Kurir: {order.tracking.courier}</p>
            <ol className="flex flex-col">
              {order.tracking.history.map((h, i) => (
                <li key={i} className="border-l border-neutral-200 pb-4 pl-4 last:pb-0">
                  <p className="text-sm text-neutral-800">{h.status}</p>
                  {h.note && <p className="text-xs text-neutral-500">{h.note}</p>}
                  <p className="text-xs text-neutral-400">{formatDate(h.at)}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}
