import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  DotsThree,
  Eye,
  EyeSlash,
  CaretDown,
  Funnel,
  DownloadSimple,
  X,
  Copy,
  ArrowSquareOut,
} from '@phosphor-icons/react'
import { useStore } from '../../store/StoreProvider'
import { formatCurrency } from '../../utils/formatCurrency'
import PageHeader from '../../components/admin/PageHeader'
import { AdminButton, AdminCheckbox, AdminInput } from '../../components/admin/ui/FormControls'
import Dropdown from '../../components/admin/ui/Dropdown'
import StatCard from '../../components/admin/widgets/StatCard'
import StockWidget from '../../components/admin/widgets/StockWidget'
import AIInsightCard from '../../components/admin/widgets/AIInsightCard'
import Sparkline from '../../components/admin/widgets/Sparkline'
import ProductImportModal from '../../components/admin/ProductImportModal'
import { BoxIcon } from '../../components/admin/icons'

const LOW_STOCK_THRESHOLD = 5

const TABS = [
  { key: 'published', label: 'Published' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'hidden', label: 'Hidden' },
  { key: 'under_review', label: 'Under Review' },
]

function StockBadge({ stock }) {
  const cfg =
    stock === 0
      ? ['Out of stock', 'var(--adm-outstock-text)', 'var(--adm-outstock-bg)', 'var(--adm-outstock-border)']
      : stock <= LOW_STOCK_THRESHOLD
        ? ['Low stock', 'var(--adm-lowstock-text)', 'var(--adm-lowstock-bg)', 'var(--adm-lowstock-border)']
        : ['In stock', 'var(--adm-instock-text)', 'var(--adm-instock-bg)', 'var(--adm-instock-border)']
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-[100px] border px-2.5 py-0.5 text-[14px]"
      style={{ color: cfg[1], background: cfg[2], borderColor: cfg[3] }}
    >
      {cfg[0]}
    </span>
  )
}

function nextProductId(products) {
  const nums = products.map((p) => /^p(\d+)$/.exec(p.id)).filter(Boolean).map((m) => Number(m[1]))
  return 'p' + ((nums.length ? Math.max(...nums) : 0) + 1)
}

export default function ProductsPage() {
  const { products, categories, updateProduct, deleteProduct, addProduct } = useStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState('published')
  const [q, setQ] = useState('')
  const [selectedCats, setSelectedCats] = useState(new Set())
  const [selectedStockFilter, setSelectedStockFilter] = useState(new Set())
  const [selected, setSelected] = useState(new Set())
  const [confirmDel, setConfirmDel] = useState(null)
  const [showImport, setShowImport] = useState(false)

  const catName = (id) => categories.find((c) => c.id === id)?.name || id

  const stockBucket = (p) => (p.stock === 0 ? 'out' : p.stock <= LOW_STOCK_THRESHOLD ? 'low' : 'in')

  // ---- derived metrics for the widget row --------------------------------
  const stock = useMemo(() => {
    const s = { out: 0, low: 0, in: 0 }
    products.forEach((p) => s[stockBucket(p)]++)
    return s
  }, [products])

  const sparkline = useMemo(() => {
    // Cumulative product count over the last 14 days, from real createdAt data.
    const days = 14
    const now = new Date()
    const sorted = [...products].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    const pts = []
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(day.getDate() - i)
      day.setHours(23, 59, 59, 999)
      pts.push(sorted.filter((p) => new Date(p.createdAt) <= day).length)
    }
    return pts
  }, [products])

  const insights = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = products.filter((p) => new Date(p.createdAt) >= monthStart).length
    const lines = []
    if (stock.low + stock.out > 0) {
      lines.push(`${stock.low + stock.out} sparepart perlu direstok (menipis/habis)`)
    }
    lines.push(`${newThisMonth} produk baru ditambahkan bulan ini`)
    lines.push('Lihat performa penjualan lengkap di Dashboard')
    return lines
  }, [products, stock])

  // ---- filtering ----------------------------------------------------------
  const filtered = products.filter((p) => {
    const matchTab =
      tab === 'published' ? p.published : tab === 'drafts' ? !p.published : false // Hidden/Under Review: not modeled in this POC
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(q.toLowerCase())
    const matchCat = selectedCats.size === 0 || selectedCats.has(p.category)
    const matchStock = selectedStockFilter.size === 0 || selectedStockFilter.has(stockBucket(p))
    return matchTab && matchQ && matchCat && matchStock
  })

  const allChecked = filtered.length > 0 && filtered.every((p) => selected.has(p.id))
  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(filtered.map((p) => p.id)))
  const toggleOne = (id) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleCat = (id) =>
    setSelectedCats((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const duplicateProduct = (p) => {
    addProduct({
      ...p,
      id: nextProductId(products),
      name: p.name + ' (Salinan)',
      sku: p.sku + '-COPY',
      published: false,
      createdAt: new Date().toISOString().slice(0, 10),
    })
  }

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <PageHeader title="Produk" subtitle="Lihat dan kelola semua produk di toko kamu.">
        <AdminButton variant="secondary" onClick={() => setShowImport(true)}>
          <DownloadSimple size={18} /> Import
        </AdminButton>
        <AdminButton onClick={() => navigate('/admin/products/new')}>
          <Plus size={18} weight="bold" /> Tambah Produk
        </AdminButton>
      </PageHeader>

      {/* Widget row */}
      <div className="mb-4 flex flex-wrap gap-4">
        <StatCard
          icon={BoxIcon}
          label="Total Sparepart"
          value={products.length}
          delta={7}
          caption="Dari minggu lalu"
          chart={
            <div className="h-14 w-[240px] max-w-full">
              <Sparkline data={sparkline} color="var(--adm-mint)" />
            </div>
          }
        />
        <div className="w-[366px] max-w-full">
          <StockWidget stock={stock} />
        </div>
        <AIInsightCard insights={insights} />
      </div>

      {/* Table card */}
      <div className="adm-card flex flex-col gap-6 p-6">
        <p className="text-[20px] font-medium text-black">Semua Produk</p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status tabs */}
          <div className="flex items-center gap-1 rounded-[100px] border border-[var(--adm-white-600)] bg-white py-1 pl-1 pr-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex h-[47px] items-center justify-center rounded-[100px] px-5 text-[16px] transition-colors ${
                  tab === t.key ? 'bg-[#f5fcf0] text-black' : 'text-[var(--adm-muted)] hover:text-black'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search / Categories / Filter */}
          <div className="flex items-center gap-3">
            <Dropdown
              trigger={(toggle) => (
                <button onClick={toggle} className="flex size-6 items-center justify-center text-black" aria-label="Cari">
                  <MagnifyingGlass size={22} />
                </button>
              )}
              panel={() => (
                <div className="adm-card w-64 p-3">
                  <AdminInput autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, SKU, brand" />
                </div>
              )}
            />

            <Dropdown
              trigger={(toggle) => (
                <button
                  onClick={toggle}
                  className="flex h-[47px] items-center gap-2 rounded-[100px] border border-[var(--adm-border)] bg-white px-5 text-[18px] text-black"
                >
                  Categories <CaretDown size={16} className="text-[var(--adm-muted)]" />
                </button>
              )}
              align="right"
              panel={() => (
                <div className="adm-card w-56 p-2">
                  <label className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-[var(--adm-bg)]">
                    <AdminCheckbox checked={selectedCats.size === 0} onChange={() => setSelectedCats(new Set())} />
                    <span className="text-[15px] text-black">All</span>
                  </label>
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-[var(--adm-bg)]">
                      <AdminCheckbox checked={selectedCats.has(c.id)} onChange={() => toggleCat(c.id)} />
                      <span className="text-[15px] text-black">{c.name}</span>
                    </label>
                  ))}
                </div>
              )}
            />

            <Dropdown
              trigger={(toggle) => (
                <button
                  onClick={toggle}
                  className="flex h-[47px] items-center gap-2 rounded-[100px] border border-[var(--adm-border)] bg-white px-5 text-[18px] text-black"
                >
                  <Funnel size={18} /> Filter
                </button>
              )}
              align="right"
              panel={() => (
                <div className="adm-card w-56 p-2">
                  {[
                    ['in', 'In stock'],
                    ['low', 'Low stock'],
                    ['out', 'Out of stock'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-[var(--adm-bg)]">
                      <AdminCheckbox
                        checked={selectedStockFilter.has(key)}
                        onChange={() =>
                          setSelectedStockFilter((s) => {
                            const next = new Set(s)
                            if (next.has(key)) next.delete(key)
                            else next.add(key)
                            return next
                          })
                        }
                      />
                      <span className="text-[15px] text-black">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="rounded-[40px] bg-[var(--adm-bg)] text-[16px] text-[var(--adm-muted)]">
                <th className="w-12 rounded-l-[40px] py-4 pl-6">
                  <AdminCheckbox checked={allChecked} onChange={toggleAll} />
                </th>
                <th className="py-4 font-normal">Product Name</th>
                <th className="py-4 font-normal">Category</th>
                <th className="py-4 font-normal">Price</th>
                <th className="py-4 font-normal">Stock</th>
                <th className="py-4 font-normal">Status</th>
                <th className="rounded-r-[40px] py-4 pr-6 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="rounded-[12px]">
                  <td className="py-3.5 pl-6">
                    <AdminCheckbox checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--adm-border-strong)]">
                        <img src={p.images?.[0]} alt={p.name} className="size-full object-cover" />
                      </span>
                      <p className="w-[160px] truncate text-[16px] text-black">{p.name}</p>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-[16px] text-black">{catName(p.category)}</td>
                  <td className="py-3.5 pr-4 text-[16px] text-black">{formatCurrency(p.price)}</td>
                  <td className="py-3.5 pr-4 text-[16px] text-black">{p.stock} pcs</td>
                  <td className="py-3.5 pr-4">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="py-3.5 pr-6">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/admin/products/${p.id}`)}
                        className="flex size-10 items-center justify-center rounded-full border border-[var(--adm-border)] bg-white text-black hover:bg-[var(--adm-bg)]"
                        aria-label="Edit"
                      >
                        <PencilSimple size={20} />
                      </button>
                      <button
                        onClick={() => setConfirmDel(p)}
                        className="flex size-10 items-center justify-center rounded-full border border-[var(--adm-border)] bg-white text-black hover:bg-[var(--adm-bg)]"
                        aria-label="Hapus"
                      >
                        <Trash size={20} />
                      </button>
                      <Dropdown
                        align="right"
                        trigger={(toggle) => (
                          <button
                            onClick={toggle}
                            className="flex size-10 items-center justify-center rounded-full border border-[var(--adm-border)] bg-white text-black hover:bg-[var(--adm-bg)]"
                            aria-label="Lainnya"
                          >
                            <DotsThree size={20} weight="bold" />
                          </button>
                        )}
                        panel={(close) => (
                          <div className="adm-card w-48 p-1">
                            <button
                              onClick={() => {
                                duplicateProduct(p)
                                close()
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] text-black hover:bg-[var(--adm-bg)]"
                            >
                              <Copy size={16} /> Duplikat produk
                            </button>
                            <button
                              onClick={() => {
                                updateProduct(p.id, { published: !p.published })
                                close()
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] text-black hover:bg-[var(--adm-bg)]"
                            >
                              {p.published ? <EyeSlash size={16} /> : <Eye size={16} />}
                              {p.published ? 'Jadikan draft' : 'Publish'}
                            </button>
                            {p.published && (
                              <a
                                href={`/store#/product/${p.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] text-black hover:bg-[var(--adm-bg)]"
                              >
                                <ArrowSquareOut size={16} /> Lihat di toko
                              </a>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[var(--adm-muted)]">
                    {['hidden', 'under_review'].includes(tab)
                      ? 'Status ini belum tersedia pada versi POC ini.'
                      : 'Tidak ada produk yang cocok.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import modal */}
      {showImport && (
        <ProductImportModal
          categories={categories}
          nextId={nextProductId(products)}
          onImport={addProduct}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Delete confirm — Figma-exact icon badge + copy */}
      {confirmDel && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmDel(null)}>
          <div className="adm-card w-full max-w-sm p-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 pb-0">
              <span className="flex size-11 items-center justify-center rounded-full bg-[var(--adm-outstock-bg)] text-[var(--adm-danger)]">
                <Trash size={20} />
              </span>
              <button onClick={() => setConfirmDel(null)} className="flex size-8 items-center justify-center rounded-full hover:bg-[var(--adm-bg)]" aria-label="Tutup">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 pb-6 pt-4">
              <h2 className="text-[18px] font-medium text-black">Hapus Produk</h2>
              <p className="mt-2 text-[14px] text-[var(--adm-muted)]">
                Tindakan ini tidak bisa dibatalkan. Yakin mau hapus "{confirmDel.name}"?
              </p>
            </div>
            <div className="h-px bg-[var(--adm-border)]" />
            <div className="flex justify-end gap-2 p-4">
              <AdminButton variant="secondary" onClick={() => setConfirmDel(null)}>Batal</AdminButton>
              <AdminButton
                variant="danger"
                onClick={() => {
                  deleteProduct(confirmDel.id)
                  setConfirmDel(null)
                }}
              >
                Hapus
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
