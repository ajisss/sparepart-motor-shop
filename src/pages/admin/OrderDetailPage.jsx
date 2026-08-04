import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CaretDown, Printer, CaretRight, DotsThree, MapPin, Package, Truck } from '@phosphor-icons/react'
import { useStore } from '../../store/StoreProvider'

const STATUS_OPTS = [
  'Menunggu pembayaran','Sedang diproses','Siap dikirim','Dalam pengiriman','Selesai','Refund diproses',
]
const STATUS_COLORS = {
  'Menunggu pembayaran': 'bg-amber-100 text-amber-700',
  'Sedang diproses':     'bg-blue-100 text-blue-700',
  'Siap dikirim':        'bg-purple-100 text-purple-700',
  'Dalam pengiriman':    'bg-cyan-100 text-cyan-700',
  'Selesai':             'bg-[#e8f5e0] text-[#2e7d32]',
  'Refund diproses':     'bg-red-100 text-red-700',
}

function fmt(n) { return 'Rp ' + (n || 0).toLocaleString('id-ID') }
function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { orders, products, updateOrderStatus } = useStore()

  const order = orders?.find((o) => o.id === id)
  const [statusOpen, setStatusOpen] = useState(false)

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[18px] font-medium text-black">Pesanan tidak ditemukan</p>
        <Link to="/admin/orders" className="mt-4 text-[14px] text-[var(--adm-muted)] hover:text-black">← Kembali ke Pesanan</Link>
      </div>
    )
  }

  const productMap = Object.fromEntries((products || []).map((p) => [p.id, p]))
  const name    = order.contact?.name || order.customer?.name || 'Tamu'
  const email   = order.contact?.email || order.customer?.email || '-'
  const phone   = order.contact?.phone || order.customer?.phone || '-'
  const addr    = order.shippingAddress
  const addrStr = addr ? `${addr.line}, ${addr.city}, ${addr.province} ${addr.postalCode}` : '-'
  const invId   = `INV-${order.id.slice(-6).toUpperCase()}`

  function changeStatus(s) {
    updateOrderStatus?.(order.id, s)
    setStatusOpen(false)
  }

  const statusColor = STATUS_COLORS[order.status] ?? 'bg-neutral-100 text-neutral-600'

  return (
    <div className="mx-auto max-w-[1100px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--adm-muted)]">
        <Link to="/admin/orders" className="hover:text-black">Pesanan</Link>
        <CaretRight size={13} />
        <span className="text-black">Detail</span>
        <CaretRight size={13} />
        <span className="font-mono text-black">#{order.id}</span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-semibold text-black">Detail Pesanan</h1>
        <div className="flex items-center gap-2">
          {/* Status picker */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-[var(--adm-border)] bg-white px-4 py-2 text-[14px] font-medium text-black hover:bg-[var(--adm-bg)]"
            >
              <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${statusColor}`}>{order.status}</span>
              <CaretDown size={14} />
            </button>
            {statusOpen && (
              <div className="adm-card absolute right-0 z-20 mt-2 w-52 overflow-hidden p-1">
                {STATUS_OPTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] hover:bg-[var(--adm-bg)] ${order.status === s ? 'font-semibold text-black' : 'text-[var(--adm-muted)]'}`}
                  >
                    <span className={`size-2 rounded-full ${STATUS_COLORS[s]?.split(' ')[0]}`} />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link
            to={`/admin/orders/${order.id}/invoice`}
            className="flex items-center gap-2 rounded-full bg-[var(--adm-mint)] px-4 py-2 text-[14px] font-medium text-black hover:brightness-95"
          >
            <Printer size={16} />
            Cetak Invoice
          </Link>
        </div>
      </div>

      {/* Meta bar */}
      <div className="adm-card mt-5 grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
        {[
          { label: 'Status', val: <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${statusColor}`}>{order.status}</span> },
          { label: 'Tanggal', val: fmtDate(order.createdAt) },
          { label: 'Invoice ID', val: <span className="font-mono">{invId}</span> },
          { label: 'Jumlah Item', val: `${(order.items || []).reduce((s, i) => s + i.qty, 0)} item` },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-[12px] text-[var(--adm-muted)]">{label}</p>
            <div className="mt-1 text-[14px] font-medium text-black">{val}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-5">
        {/* Left col */}
        <div className="min-w-0 flex-1 flex flex-col gap-5">
          {/* Order items */}
          <div className="adm-card p-5">
            <h2 className="text-[16px] font-semibold text-black">Item Pesanan</h2>
            <div className="mt-4 flex flex-col gap-0">
              {(order.items || []).map((item, i) => {
                const prod = productMap[item.productId]
                return (
                  <div key={i} className="flex items-center gap-4 border-b border-[var(--adm-border)] py-4 last:border-0">
                    <input type="checkbox" className="shrink-0 rounded" />
                    {prod?.images?.[0] && (
                      <img src={prod.images[0]} alt={item.name} className="size-12 rounded-xl object-cover shrink-0" />
                    )}
                    {!prod?.images?.[0] && (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--adm-bg)]">
                        <Package size={20} className="text-[var(--adm-muted)]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-black">{item.name}</p>
                      <p className="text-[12px] text-[var(--adm-muted)]">{prod?.category ?? 'Sparepart'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-right shrink-0">
                      <div>
                        <p className="text-[11px] text-[var(--adm-muted)]">SKU</p>
                        <p className="text-[13px] font-mono text-black">{item.sku}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[var(--adm-muted)]">Harga</p>
                        <p className="text-[13px] text-black">{item.qty}×{fmt(item.price)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[var(--adm-muted)]">Total</p>
                        <p className="text-[13px] font-semibold text-black">{fmt(item.price * item.qty)}</p>
                      </div>
                    </div>
                    <button className="shrink-0 flex size-7 items-center justify-center rounded-full hover:bg-[var(--adm-bg)]">
                      <DotsThree size={18} className="text-[var(--adm-muted)]" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order summary */}
          <div className="adm-card p-5">
            <h2 className="text-[16px] font-semibold text-black">Ringkasan Pesanan</h2>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { label: 'Subtotal', val: fmt(order.subtotal) },
                { label: 'Diskon', val: order.discount ? `-${fmt(order.discount)}` : '-' },
                { label: 'Ongkos Kirim', val: fmt(order.shippingCost) },
                { label: 'Asuransi', val: 'Rp 0' },
                { label: 'Pajak', val: 'Rp 0' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between text-[14px]">
                  <span className="text-[var(--adm-muted)]">{label}</span>
                  <span className={label === 'Diskon' && order.discount ? 'font-medium text-[var(--adm-danger)]' : 'text-black'}>{val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-[var(--adm-border)] pt-3 text-[15px] font-semibold text-black">
                <span>Total</span>
                <span>{fmt(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="w-[260px] shrink-0 flex flex-col gap-5">
          {/* Customer */}
          <div className="adm-card p-5">
            <h2 className="text-[15px] font-semibold text-black">Detail Pelanggan</h2>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { label: 'Nama', val: name },
                { label: 'Email', val: email },
                { label: 'Telepon', val: phone },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <span className="text-[13px] text-[var(--adm-muted)]">{label}</span>
                  <span className="text-right text-[13px] font-medium text-black">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="adm-card p-5">
            <h2 className="text-[15px] font-semibold text-black">Alamat</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--adm-muted)]">
                  <MapPin size={13} /> Alamat Pengiriman
                </div>
                <p className="mt-1.5 text-[13px] leading-snug text-black">{addrStr}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--adm-muted)]">
                  <MapPin size={13} /> Alamat Penagihan
                </div>
                <p className="mt-1.5 text-[13px] leading-snug text-black">{addrStr}</p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="adm-card p-5">
            <h2 className="text-[15px] font-semibold text-black">Informasi Pengiriman</h2>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { label: 'Jenis', val: order.shipping?.service ?? 'Regular' },
                { label: 'Kurir', val: order.shipping?.courier ?? '-' },
                { label: 'No. Resi', val: order.tracking?.number ?? '-' },
                { label: 'Status', val: order.status },
                { label: 'Est. Tiba', val: order.shipping?.etaLabel ?? '-' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Truck size={13} className="shrink-0 text-[var(--adm-muted)]" />
                    <span className="text-[13px] text-[var(--adm-muted)]">{label}</span>
                  </div>
                  <span className="text-right text-[13px] font-medium text-black">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
