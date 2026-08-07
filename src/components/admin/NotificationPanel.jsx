import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreProvider'

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return 'Baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}

function buildNotifications(orders) {
  const orderNotifs = orders
    .filter((o) => o.status === 'Menunggu pembayaran' || o.status === 'Sedang diproses')
    .map((o) => ({
      id: `order-${o.id}`,
      tab: 'orders',
      title: 'Pesanan Baru Diterima',
      body: `Ada pesanan baru #${o.id} dari ${o.customer?.name || o.contact?.name || 'pelanggan'}.`,
      at: o.createdAt,
      href: '/admin/orders',
      read: false,
    }))

  const shippedNotifs = orders
    .filter((o) => o.status === 'Dalam pengiriman' || o.status === 'Siap dikirim')
    .slice(0, 3)
    .map((o) => ({
      id: `shipped-${o.id}`,
      tab: 'orders',
      title: 'Pesanan Dikirim',
      body: `Pesanan #${o.id} telah dikirim ke pelanggan.`,
      at: o.createdAt,
      href: '/admin/orders',
      read: true,
    }))

  return [...orderNotifs, ...shippedNotifs]
}

const TABS = ['Semua', 'Pesanan', 'Produk', 'Promosi']

export default function NotificationPanel({ onClose }) {
  const ref = useRef(null)
  const navigate = useNavigate()
  const { orders = [] } = useStore()
  const [tab, setTab] = useState('Semua')
  const [readIds, setReadIds] = useState(new Set())

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const all = buildNotifications(orders)
  const tabMap = { 'Semua': null, 'Pesanan': 'orders', 'Produk': 'products', 'Promosi': 'marketing' }
  const visible = tab === 'Semua' ? all : all.filter((n) => n.tab === tabMap[tab])
  const countFor = (t) => all.filter((n) => n.tab === tabMap[t] && !n.read && !readIds.has(n.id)).length

  function markAllRead() { setReadIds(new Set(all.map((n) => n.id))) }

  function handleClick(item) {
    setReadIds((prev) => new Set([...prev, item.id]))
    navigate(item.href)
    onClose()
  }

  const panel = (
    <div
      ref={ref}
      className="fixed right-3 z-[9999] flex w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      style={{ top: 84, maxHeight: 'calc(100vh - 100px)' }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
        <span className="text-[17px] font-semibold text-black">Notifikasi</span>
        <button onClick={markAllRead} className="text-[13px] font-medium text-[var(--adm-info)] hover:underline">
          Tandai semua dibaca
        </button>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 items-center gap-1 px-4 pb-3">
        <div className="flex items-center gap-1 rounded-full border border-[var(--adm-border)] bg-[var(--adm-bg)] p-1">
          {TABS.map((t) => {
            const count = t !== 'Semua'
              ? countFor(t)
              : all.filter((n) => !n.read && !readIds.has(n.id)).length
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors"
                style={tab === t ? { background: 'rgba(254,201,1,0.25)', color: 'black' } : { color: 'var(--adm-muted)' }}
              >
                {t}
                {count > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <span className="text-3xl">🔔</span>
            <p className="text-[14px] text-[var(--adm-muted)]">Tidak ada notifikasi</p>
          </div>
        ) : (
          <ul>
            {visible.map((item, i) => {
              const isRead = item.read || readIds.has(item.id)
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleClick(item)}
                    className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--adm-bg)]"
                  >
                    <div className="mt-1.5 shrink-0">
                      {isRead
                        ? <div className="size-2" />
                        : <div className="size-2 rounded-full" style={{ background: '#4ade80' }} />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-black">{item.title}</p>
                      <p className="mt-0.5 text-[13px] leading-snug" style={{ color: '#a0a0a0' }}>{item.body}</p>
                    </div>
                    {item.at && (
                      <span className="shrink-0 text-[12px]" style={{ color: '#a0a0a0' }}>{timeAgo(item.at)}</span>
                    )}
                  </button>
                  {i < visible.length - 1 && <div className="mx-5 border-t" style={{ borderColor: '#d4d4d4' }} />}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-[var(--adm-border)]">
        <button
          onClick={() => { navigate('/admin/orders'); onClose() }}
          className="w-full py-4 text-[14px] font-medium text-black hover:bg-[var(--adm-bg)]"
        >
          Lihat semua
        </button>
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}
