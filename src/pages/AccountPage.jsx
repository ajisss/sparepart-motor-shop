import { Link, Navigate, useSearchParams } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../store/hooks'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

const TABS = [
  { key: 'profil', label: 'Profil' },
  { key: 'alamat', label: 'Alamat' },
  { key: 'riwayat', label: 'Riwayat' },
]

export default function AccountPage() {
  const { currentUser } = useAuth()
  const orders = useOrders()
  const [searchParams, setSearchParams] = useSearchParams()

  if (!currentUser) return <Navigate to="/login" replace />

  const requested = searchParams.get('tab')
  const tab = TABS.some((t) => t.key === requested) ? requested : 'profil'
  const myOrders = orders.filter((o) => o.userId === currentUser.id)

  return (
    <div>
      <Nav />
      <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-8 lg:py-12">
        <h1 className="text-2xl font-medium text-neutral-900">Akun Saya</h1>

        <div className="flex gap-2 border-b border-neutral-100">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSearchParams({ tab: t.key })}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-primary-600 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profil' && <ProfileTab user={currentUser} />}
        {tab === 'alamat' && <AddressTab user={currentUser} />}
        {tab === 'riwayat' && <HistoryTab orders={myOrders} />}
      </section>
      <Footer />
    </div>
  )
}

function ProfileTab({ user }) {
  const rows = [
    { label: 'Nama', value: user.name },
    { label: 'Email', value: user.email || '—' },
    { label: 'Nomor HP', value: user.phone || '—' },
    { label: 'Metode masuk', value: user.provider === 'google' ? 'Google' : 'Email & password' },
  ]
  return (
    <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-neutral-0">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4 p-4 text-sm">
          <span className="text-neutral-500">{r.label}</span>
          <span className="text-right text-neutral-900">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

function AddressTab({ user }) {
  if (!user.addresses.length) {
    return (
      <EmptyState
        title="Belum ada alamat"
        description="Alamat tersimpan akan muncul di sini setelah Anda menyimpannya saat checkout."
      />
    )
  }
  return (
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
  )
}

function HistoryTab({ orders }) {
  if (!orders.length) {
    return (
      <EmptyState
        title="Belum ada pesanan"
        description="Pesanan Anda akan muncul di sini setelah Anda menyelesaikan checkout."
      />
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {orders.map((o) => (
        <Link
          key={o.id}
          to={`/pesanan/${o.id}`}
          className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-0 p-4 transition-colors hover:border-primary-300"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-sm font-medium text-neutral-900">{o.id}</span>
            <StatusBadge status={o.status} />
          </div>
          <p className="text-xs text-neutral-500">{formatDate(o.createdAt)}</p>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-neutral-600">
              {o.items[0]?.name}
              {o.items.length > 1 ? ` +${o.items.length - 1} lainnya` : ''}
            </span>
            <span className="font-medium text-neutral-900">{formatCurrency(o.total)}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
