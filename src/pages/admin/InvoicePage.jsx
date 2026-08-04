import { useParams, Link, useNavigate } from 'react-router-dom'
import { CaretRight, PaperPlaneTilt, DownloadSimple, Printer, Package } from '@phosphor-icons/react'
import { useStore } from '../../store/StoreProvider'
import dmbLogo from '../../assets/logo-dmb.png'

function fmt(n) { return 'Rp ' + (n || 0).toLocaleString('id-ID') }
function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function InvoicePage() {
  const { id } = useParams()
  const { orders, products } = useStore()

  const order = orders?.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[18px] font-medium text-black">Pesanan tidak ditemukan</p>
        <Link to="/admin/orders" className="mt-4 text-[14px] text-[var(--adm-muted)] hover:text-black">← Kembali ke Pesanan</Link>
      </div>
    )
  }

  const productMap = Object.fromEntries((products || []).map((p) => [p.id, p]))
  const name    = order.contact?.name || order.customer?.name || 'Pelanggan'
  const email   = order.contact?.email || order.customer?.email || '-'
  const addr    = order.shippingAddress
  const addrStr = addr ? `${addr.line}, ${addr.city}, ${addr.province} ${addr.postalCode}` : '-'
  const invId   = `INV-${order.id.slice(-6).toUpperCase()}`

  return (
    <div className="mx-auto max-w-[1000px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--adm-muted)]">
        <Link to="/admin/orders" className="hover:text-black">Pesanan</Link>
        <CaretRight size={13} />
        <Link to={`/admin/orders/${order.id}`} className="hover:text-black">Invoice</Link>
        <CaretRight size={13} />
        <span className="font-mono text-black">{invId}</span>
      </nav>

      <div className="mt-5 flex gap-5">
        {/* Invoice card */}
        <div className="adm-card min-w-0 flex-1 p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <img src={dmbLogo} alt="DMB Moto Shop" className="h-10 w-auto" />
            </div>
            <div className="text-right text-[13px] text-[var(--adm-muted)]">
              <p>Jl. Raya Sparepart No. 1</p>
              <p>Bandung, Jawa Barat 40111</p>
              <p>+62 812 0000 0000</p>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--adm-border)]" />

          {/* Bill to / Ship to / Invoice meta */}
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div>
              <p className="text-[12px] text-[var(--adm-muted)]">Tagihkan ke</p>
              <p className="mt-1 text-[14px] font-semibold text-black">{name}</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--adm-muted)]">{addrStr}</p>
            </div>
            <div>
              <p className="text-[12px] text-[var(--adm-muted)]">Kirim ke</p>
              <p className="mt-1 text-[14px] font-semibold text-black">{name}</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--adm-muted)]">{addrStr}</p>
            </div>
            <div className="text-right">
              {[
                { label: 'Invoice ID', val: invId },
                { label: 'Order ID', val: `#${order.id}` },
                { label: 'Tanggal', val: fmtDate(order.createdAt) },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-end gap-4 text-[13px]">
                  <span className="text-[var(--adm-muted)]">{label}</span>
                  <span className="font-mono font-medium text-black">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--adm-border)]" />

          {/* Items */}
          <div className="mt-6">
            <h2 className="text-[15px] font-semibold text-black">Item Pesanan</h2>
            <div className="mt-4 flex flex-col gap-0">
              {(order.items || []).map((item, i) => {
                const prod = productMap[item.productId]
                return (
                  <div key={i} className="flex items-center gap-4 border-b border-[var(--adm-border)] py-4 last:border-0">
                    {prod?.images?.[0] ? (
                      <img src={prod.images[0]} alt={item.name} className="size-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--adm-bg)]">
                        <Package size={16} className="text-[var(--adm-muted)]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-black">{item.name}</p>
                      <p className="text-[12px] text-[var(--adm-muted)]">{prod?.category ?? 'Sparepart'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-right shrink-0">
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
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="ml-auto mt-4 w-64 flex flex-col gap-2.5">
            {[
              { label: 'Subtotal', val: fmt(order.subtotal) },
              { label: 'Diskon', val: order.discount ? `-${fmt(order.discount)}` : '-' },
              { label: 'Ongkos Kirim', val: fmt(order.shippingCost) },
              { label: 'Asuransi', val: 'Rp 0' },
              { label: 'Pajak', val: 'Rp 0' },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-[14px]">
                <span className="text-[var(--adm-muted)]">{label}</span>
                <span className={label === 'Diskon' && order.discount ? 'font-medium text-[var(--adm-danger)]' : 'text-black'}>{val}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-[var(--adm-border)] pt-2.5 text-[15px] font-semibold text-black">
              <span>Total</span>
              <span>{fmt(order.total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 border-t border-[var(--adm-border)] pt-5 text-center text-[13px] text-[var(--adm-muted)]">
            Jika ada pertanyaan, hubungi kami di <span className="font-medium text-black">support@dmb.com</span>
          </div>
        </div>

        {/* Right action panel */}
        <div className="flex w-[200px] shrink-0 flex-col gap-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--adm-mint)] px-4 py-3 text-[14px] font-medium text-black hover:brightness-95">
            <PaperPlaneTilt size={16} weight="fill" />
            Kirim Invoice
          </button>
          <button
            onClick={() => window.print()}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--adm-border)] bg-white px-4 py-3 text-[14px] font-medium text-black hover:bg-[var(--adm-bg)]"
          >
            <DownloadSimple size={16} />
            Download Invoice
          </button>
          <button
            onClick={() => window.print()}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--adm-border)] bg-white px-4 py-3 text-[14px] font-medium text-black hover:bg-[var(--adm-bg)]"
          >
            <Printer size={16} />
            Cetak Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
