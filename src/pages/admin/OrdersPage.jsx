import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlass, Package, Truck, CheckCircle, ClipboardText,
  CaretUpDown, FunnelSimple
} from '@phosphor-icons/react'
import { useStore } from '../../store/StoreProvider'
import MiniBars from '../../components/admin/widgets/MiniBars'
import DeltaChip from '../../components/admin/widgets/DeltaChip'

const STATUS_LABELS = {
  'Menunggu pembayaran': { label: 'Menunggu',  color: 'bg-amber-100 text-amber-700' },
  'Sedang diproses':     { label: 'Diproses',  color: 'bg-blue-100 text-blue-700' },
  'Siap dikirim':        { label: 'Siap kirim', color: 'bg-purple-100 text-purple-700' },
  'Dalam pengiriman':    { label: 'Dikirim',   color: 'bg-cyan-100 text-cyan-700' },
  'Selesai':             { label: 'Selesai',   color: 'bg-[#e8f5e0] text-[#2e7d32]' },
  'Refund diproses':     { label: 'Refund',    color: 'bg-red-100 text-red-700' },
}

const FILTERS = ['Semua', 'Menunggu pembayaran', 'Sedang diproses', 'Siap dikirim', 'Dalam pengiriman', 'Selesai', 'Refund diproses']

function fmt(n) { return 'Rp ' + (n || 0).toLocaleString('id-ID') }
function relDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TopStatCard({ icon, label, value, lastWeekVal, delta, chart }) {
  return (
    <div className="adm-card flex flex-col gap-2 p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--adm-bg)]">{icon}</span>
        <span className="text-[13px] text-[var(--adm-muted)]">{label}</span>
      </div>
      <p className="text-[30px] font-bold tracking-tight text-black">{value}</p>
      <div className="flex items-center gap-2 text-[12px] text-[var(--adm-muted)]">
        <DeltaChip value={delta} />
        <span>Dari kemarin</span>
      </div>
      {lastWeekVal && (
        <p className="text-[11px] text-[var(--adm-muted)]">Minggu lalu: <span className="font-medium text-black">{lastWeekVal}</span></p>
      )}
      {chart && <div className="mt-auto pt-2">{chart}</div>}
    </div>
  )
}

function StatusDistributionBar({ orders }) {
  const pending  = orders.filter((o) => ['Menunggu pembayaran','Sedang diproses'].includes(o.status)).length
  const shipped  = orders.filter((o) => ['Siap dikirim','Dalam pengiriman'].includes(o.status)).length
  const done     = orders.filter((o) => o.status === 'Selesai').length
  const refund   = orders.filter((o) => o.status === 'Refund diproses').length
  const total = (pending + shipped + done + refund) || 1

  const bars = [
    { key: 'p', color: '#FEC901', pct: pending / total, label: 'Diproses', count: pending },
    { key: 's', color: '#22c55e', pct: shipped / total, label: 'Dikirim',  count: shipped },
    { key: 'd', color: '#ef4444', pct: refund / total,  label: 'Refund',   count: refund },
  ]
  // fill remaining with shipped (green)
  const remaining = 1 - pending/total - shipped/total - refund/total

  return (
    <div className="flex flex-col gap-3">
      {/* horizontal bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full gap-px">
        <div style={{ width: `${(pending/total)*100}%`, background: '#FEC901' }} />
        <div style={{ width: `${(done/total)*100}%`,    background: '#22c55e' }} />
        <div style={{ width: `${(refund/total)*100}%`,  background: '#ef4444' }} />
        <div style={{ flex: 1, background: '#e2e2e2' }} />
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--adm-muted)]">
          <span className="size-2 rounded-full bg-[#FEC901]" /> Diproses
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--adm-muted)]">
          <span className="size-2 rounded-full bg-[#22c55e]" /> Dikirim
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--adm-muted)]">
          <span className="size-2 rounded-full bg-[#ef4444]" /> Refund
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { orders = [], products = [] } = useStore()
  const [filter, setFilter] = useState('Semua')
  const [search, setSearch] = useState('')
  const [sort, setSort]     = useState('newest')

  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products])

  const filtered = useMemo(() => {
    let list = [...orders]
    if (filter !== 'Semua') list = list.filter((o) => o.status === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((o) =>
        o.id?.toLowerCase().includes(q) ||
        o.contact?.name?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      if (sort === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt)
      if (sort === 'oldest')  return new Date(a.createdAt) - new Date(b.createdAt)
      if (sort === 'highest') return (b.total || 0) - (a.total || 0)
      if (sort === 'lowest')  return (a.total || 0) - (b.total || 0)
      return 0
    })
    return list
  }, [orders, filter, search, sort])

  const totalOrders = orders.length
  const orderGrowth = -2
  const pending  = orders.filter((o) => ['Menunggu pembayaran','Sedang diproses'].includes(o.status)).length
  const shipped  = orders.filter((o) => ['Siap dikirim','Dalam pengiriman'].includes(o.status)).length
  const refund   = orders.filter((o) => o.status === 'Refund diproses').length

  const miniBarData = [4, 6, 5, 7, 5, 8, 6, 9, 6, 10]

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-semibold text-black">Pesanan</h1>
        <p className="mt-0.5 text-[14px] text-[var(--adm-muted)]">Lihat, proses, dan penuhi pesanan pelanggan.</p>
      </div>

      {/* Top 3 stat cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Total Orders — tall card with background */}
        <div className="adm-card relative flex flex-col gap-3 overflow-hidden p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--adm-bg)]">
              <ClipboardText size={18} className="text-black" />
            </span>
            <span className="text-[13px] text-[var(--adm-muted)]">Total Pesanan</span>
          </div>
          <p className="text-[42px] font-bold tracking-tight text-black">{totalOrders.toLocaleString('id-ID')}</p>
          <div className="flex items-center gap-2">
            <DeltaChip value={7} />
            <span className="text-[12px] text-[var(--adm-muted)]">Dari bulan lalu</span>
          </div>
          {/* Subtle package watermark */}
          <Package size={120} className="absolute -right-6 -bottom-6 text-[var(--adm-border)] opacity-60" />
        </div>

        {/* Order Volume Growth */}
        <TopStatCard
          icon={<Package size={18} className="text-black" />}
          label="Pertumbuhan Volume"
          value={`${orderGrowth}%`}
          lastWeekVal={Math.round(totalOrders * 0.95).toLocaleString('id-ID')}
          delta={-7}
        />

        {/* Average Delivery Time */}
        <TopStatCard
          icon={<Truck size={18} className="text-black" />}
          label="Rata-rata Waktu Kirim"
          value={<span>4.1 <span className="text-[16px] font-normal text-[var(--adm-muted)]">hari</span></span>}
          lastWeekVal="4,8"
          delta={3}
          chart={<MiniBars data={miniBarData} />}
        />
      </div>

      {/* Bottom 3 mini stats + status bar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Pending / Shipped / Canceled */}
        <div className="adm-card p-5">
          <div className="grid grid-cols-3 divide-x divide-[var(--adm-border)]">
            {[
              { label: 'Pesanan Masuk', value: pending, delta: 3 },
              { label: 'Sedang Dikirim', value: shipped, delta: -8 },
              { label: 'Dibatalkan / Refund', value: refund, delta: 3 },
            ].map((s) => (
              <div key={s.label} className="px-4 first:pl-0 last:pr-0">
                <p className="text-[13px] text-[var(--adm-muted)]">{s.label}</p>
                <p className="mt-1 text-[28px] font-bold text-black">{s.value}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <DeltaChip value={s.delta} />
                  <span className="text-[11px] text-[var(--adm-muted)]">Kemarin</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: status distribution bar */}
        <div className="adm-card flex flex-col justify-between p-5">
          <p className="text-[13px] font-medium text-[var(--adm-muted)]">Distribusi Status</p>
          <StatusDistributionBar orders={orders} />
        </div>
      </div>

      {/* Table */}
      <div className="adm-card overflow-hidden p-0">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--adm-border)] px-5 py-4">
          <h2 className="text-[16px] font-semibold text-black">Pesanan Terkini</h2>
          <div className="flex items-center gap-2">
            <label className="flex h-9 items-center gap-2 rounded-full border border-[var(--adm-border)] bg-[var(--adm-bg)] px-3">
              <MagnifyingGlass size={14} className="text-[var(--adm-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pesanan…"
                className="w-36 bg-transparent text-[13px] text-black placeholder:text-[var(--adm-muted)] focus:outline-none"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-full border border-[var(--adm-border)] bg-[var(--adm-bg)] px-3 text-[13px] text-black focus:outline-none"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="highest">Tertinggi</option>
              <option value="lowest">Terendah</option>
            </select>
            <button className="flex h-9 items-center gap-2 rounded-full border border-[var(--adm-border)] bg-[var(--adm-bg)] px-3 text-[13px] text-black hover:bg-white">
              <FunnelSimple size={14} /> Filter
            </button>
          </div>
        </div>

        {/* filter tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[var(--adm-border)] px-4 py-2">
          {FILTERS.map((f) => {
            const count = f === 'Semua' ? orders.length : orders.filter((o) => o.status === f).length
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  filter === f ? 'bg-black text-white' : 'bg-[var(--adm-bg)] text-[var(--adm-muted)] hover:text-black'
                }`}
              >
                {f === 'Semua' ? 'Semua' : STATUS_LABELS[f]?.label ?? f}
                <span className={`rounded-full px-1.5 text-[10px] ${filter === f ? 'bg-white/20 text-white' : 'bg-white text-[var(--adm-muted)]'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--adm-border)] bg-[var(--adm-bg)]">
                <th className="w-8 px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </th>
                {['ID Pesanan','Tanggal','Pelanggan','Produk','Total','Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[var(--adm-muted)]">
                    <span className="flex items-center gap-1">{h} <CaretUpDown size={11} className="opacity-50" /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[14px] text-[var(--adm-muted)]">Tidak ada pesanan</td>
                </tr>
              )}
              {filtered.map((order) => {
                const name = order.contact?.name || order.customer?.name || 'Tamu'
                const items = order.items || []
                const firstItem = items[0]
                const prod = firstItem ? productMap[firstItem.productId] : null
                const badge = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-neutral-100 text-neutral-600' }

                return (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="cursor-pointer border-b border-[var(--adm-border)] transition-colors hover:bg-[var(--adm-bg)]"
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[13px] font-medium text-black">#{String(order.id).slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--adm-muted)]">{relDate(order.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-[var(--adm-mint)]">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-[13px] font-medium text-black">{name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {prod?.images?.[0] && (
                          <img src={prod.images[0]} alt={prod.name} className="size-8 rounded-lg object-cover" />
                        )}
                        <div className="min-w-0">
                          <p className="max-w-[160px] truncate text-[13px] font-medium text-black">{firstItem?.name ?? '-'}</p>
                          {items.length > 1 && <p className="text-[11px] text-[var(--adm-muted)]">+{items.length - 1} lainnya</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-semibold text-black">{fmt(order.total)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.color}`}>{badge.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[var(--adm-border)] px-5 py-3 text-[12px] text-[var(--adm-muted)]">
          Menampilkan {filtered.length} dari {orders.length} pesanan
        </div>
      </div>
    </div>
  )
}
