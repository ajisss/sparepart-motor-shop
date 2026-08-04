import { Link, Navigate, useSearchParams } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import SectionBanner from '../components/ui/SectionBanner'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../store/hooks'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { SECTION_BANNERS } from '../data/sectionBanners'

const MENU = [
  { key: 'alamat', label: 'Alamat', icon: PinIcon },
  { key: 'pesanan', label: 'Pesanan', icon: BagIcon },
]

export default function AccountPage() {
  const { currentUser } = useAuth()
  const orders = useOrders()
  const [searchParams, setSearchParams] = useSearchParams()

  if (!currentUser) return <Navigate to="/login" replace />

  const requested = searchParams.get('tab')
  const tab = MENU.some((m) => m.key === requested) ? requested : 'pesanan'
  const myOrders = orders.filter((o) => o.userId === currentUser.id)
  const initial = (currentUser.name || '?').charAt(0).toUpperCase()

  return (
    <div>
      <Nav />
      <section className="mx-auto w-full max-w-6xl px-4 py-8 lg:py-12">
        <SectionBanner {...SECTION_BANNERS.account} />

        <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 lg:shrink-0">
            <div className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-neutral-0 p-5">
              {/* Profile info */}
              <div className="flex flex-col items-start gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-neutral-900 text-lg font-semibold text-secondary-600">
                  {initial}
                </span>
                <div className="flex w-full flex-col gap-1 overflow-hidden">
                  <p className="truncate font-medium text-neutral-900">{currentUser.name}</p>
                  <p className="truncate text-sm text-neutral-500">{currentUser.email || '—'}</p>
                  <p className="text-sm text-neutral-500">{currentUser.phone || '—'}</p>
                </div>
              </div>

              <div className="h-px w-full bg-neutral-100" />

              {/* Menu */}
              <nav className="flex flex-col gap-1">
                {MENU.map((m) => {
                  const active = tab === m.key
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSearchParams({ tab: m.key })}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        active
                          ? 'bg-neutral-900 text-neutral-0'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <m.icon />
                      {m.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {tab === 'alamat' && <AddressSection user={currentUser} />}
            {tab === 'pesanan' && <OrdersSection orders={myOrders} />}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

function AddressSection({ user }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-neutral-900">Alamat Tersimpan</h2>
      {!user.addresses.length ? (
        <EmptyState
          title="Belum ada alamat"
          description="Alamat tersimpan akan muncul di sini setelah Anda menyimpannya saat checkout."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {user.addresses.map((a) => (
            <div key={a.id} className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-neutral-0 p-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">{a.recipientName}</span>
                {a.id === user.defaultAddressId && (
                  <span className="rounded-pill bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-800">Default</span>
                )}
              </div>
              <p className="text-neutral-500">{a.phone}</p>
              <p className="text-neutral-500">
                {[a.line, a.city, a.province, a.postalCode].filter(Boolean).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OrdersSection({ orders }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-neutral-900">Pesanan Saya</h2>
      {!orders.length ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan Anda akan muncul di sini setelah Anda menyelesaikan checkout."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/pesanan/${o.id}`}
              className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-0 p-4 transition-colors hover:border-neutral-900"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-mono text-sm font-medium text-neutral-900">{o.id}</span>
                <span className="text-xs text-neutral-500">{formatDate(o.createdAt)}</span>
                <span className="truncate text-sm text-neutral-600">
                  {o.items[0]?.name}
                  {o.items.length > 1 ? ` +${o.items.length - 1} lainnya` : ''}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <StatusBadge status={o.status} />
                <span className="text-sm font-medium text-neutral-900">{formatCurrency(o.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-4 shrink-0" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  )
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-4 shrink-0" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7a3 3 0 016 0" />
    </svg>
  )
}
