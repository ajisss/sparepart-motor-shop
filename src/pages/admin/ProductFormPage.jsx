import { useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  UploadSimple, X, CaretDown, Sparkle, ShoppingCart,
  Package, Check, Plus, Minus,
} from '@phosphor-icons/react'
import { useStore } from '../../store/StoreProvider'
import { formatCurrency } from '../../utils/formatCurrency'

const BRANDS = ['NHK', 'GS Astra', 'RCB', 'Shell', 'IRC', 'NGK', 'Osram', 'TDR', 'Yamalube', 'Rossi', 'Honda Genuine', 'Daytona', 'Acerbis', 'AHM', 'Corsa', 'Yamaha Genuine', 'FDR']

const COMPATIBLE = [
  'Honda Vario 125', 'Honda Vario 150', 'Honda Beat', 'Honda Scoopy',
  'Yamaha NMAX', 'Yamaha Aerox', 'Yamaha MX King', 'Yamaha Matic',
  'Suzuki Address', 'Universal', 'Universal 4-tak', 'Universal Matic',
]

const RECOMMENDATION = [
  'Tambah 25–100 karakter untuk nama produk',
  'Tambah minimal 100 karakter atau 1 gambar untuk deskripsi',
  'Tambah minimal 3 gambar',
  'Tambah video produk',
]

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="relative flex shrink-0 items-center rounded-full transition-colors"
      style={{ width: 44, height: 24, background: enabled ? 'var(--adm-mint)' : 'var(--adm-border)' }}
    >
      <span
        className="absolute rounded-full bg-white shadow transition-all"
        style={{ width: 18, height: 18, left: enabled ? 22 : 4 }}
      />
    </button>
  )
}

function Checkbox({ checked, onChange }) {
  return (
    <span
      className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors"
      style={{ background: checked ? 'var(--adm-forest-500)' : 'white', borderColor: checked ? 'var(--adm-forest-500)' : 'var(--adm-border)' }}
      onClick={() => onChange(!checked)}
    >
      {checked && <Check size={10} weight="bold" color="white" />}
    </span>
  )
}

function FieldLabel({ children }) {
  return <p className="mb-1.5 text-[14px] font-medium text-[var(--adm-ink)]">{children}</p>
}

function Input({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      className={`w-full rounded-xl border border-[var(--adm-border)] bg-white px-4 py-2.5 text-[14px] text-[var(--adm-ink)] outline-none placeholder:text-[var(--adm-muted)] focus:border-[var(--adm-forest-500)] ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        className="w-full appearance-none rounded-xl border border-[var(--adm-border)] bg-white px-4 py-2.5 text-[14px] text-[var(--adm-ink)] outline-none focus:border-[var(--adm-forest-500)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      <CaretDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--adm-muted)]" />
    </div>
  )
}

// Image slot placeholder
function ImageSlot({ src, onRemove, main, onClick }) {
  if (src) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] cursor-pointer" onClick={onClick}>
        <img src={src} alt="" className="size-full object-cover" />
        {onRemove && (
          <button
            type="button"
            className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
          >
            <X size={10} />
          </button>
        )}
        {main && (
          <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] text-white">Utama</span>
        )}
      </div>
    )
  }
  return (
    <div
      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--adm-border)] bg-[var(--adm-bg)] cursor-pointer hover:border-[var(--adm-muted)] transition-colors"
      onClick={onClick}
    >
      {main ? (
        <>
          <UploadSimple size={24} className="text-[var(--adm-muted)]" />
          <span className="text-[11px] text-[var(--adm-muted)]">Upload foto</span>
        </>
      ) : (
        <Package size={20} className="text-[var(--adm-border-strong)]" />
      )}
    </div>
  )
}

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, categories, addProduct, updateProduct } = useStore()
  const fileInputRef = useRef(null)
  const [activeImgSlot, setActiveImgSlot] = useState(null)

  const existing = id && id !== 'new' ? products.find((p) => p.id === id) : null

  const [images, setImages] = useState(existing?.images || Array(9).fill(null))
  const [name, setName] = useState(existing?.name || '')
  const [category, setCategory] = useState(existing?.category || '')
  const [brand, setBrand] = useState(existing?.brand || '')
  const [compat, setCompat] = useState(existing?.compatibleWith?.join(', ') || '')
  const [description, setDescription] = useState(existing?.description || '')
  const [aiKeyword, setAiKeyword] = useState('')
  const [aiGenerated, setAiGenerated] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(true)
  const [price, setPrice] = useState(existing?.price || '')
  const [sku, setSku] = useState(existing?.sku || '')
  const [preorder, setPreorder] = useState(false)
  const [addVariations, setAddVariations] = useState(false)
  const [purchaseLimits, setPurchaseLimits] = useState(false)
  const [minPurchase, setMinPurchase] = useState(1)
  const [maxPurchase, setMaxPurchase] = useState(2)

  const isNew = !existing

  // Computed preview image
  const previewImg = images.find(Boolean) || null

  // Recommendation checklist
  const recs = [
    { done: name.length >= 25 && name.length <= 100, label: 'Tambah 25–100 karakter untuk nama produk' },
    { done: description.length >= 100 || images.filter(Boolean).length >= 1, label: 'Tambah minimal 100 karakter atau 1 gambar untuk deskripsi' },
    { done: images.filter(Boolean).length >= 3, label: 'Tambah minimal 3 gambar' },
    { done: false, label: 'Tambah video produk' },
  ]

  const handleImgClick = (idx) => {
    setActiveImgSlot(idx)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || activeImgSlot === null) return
    const url = URL.createObjectURL(file)
    setImages((prev) => {
      const next = [...prev]
      next[activeImgSlot] = url
      return next
    })
    e.target.value = ''
  }

  const removeImg = (idx) =>
    setImages((prev) => { const next = [...prev]; next[idx] = null; return next })

  const handleGenerate = () => {
    if (!aiKeyword.trim()) return
    setDescription(
      `${aiKeyword.trim()} — produk sparepart motor berkualitas tinggi yang dirancang untuk memberikan performa optimal. Dibuat dari bahan pilihan yang tahan lama dan telah melalui uji kualitas ketat. Cocok untuk berbagai jenis motor dan mudah dipasang sendiri.`
    )
    setAiGenerated(true)
    setShowSuggestion(false)
  }

  const handleSave = async (asDraft = false) => {
    const payload = {
      name,
      category,
      brand,
      compatibleWith: compat.split(',').map((s) => s.trim()).filter(Boolean),
      description,
      price: Number(price),
      sku,
      images: images.filter(Boolean),
      videoUrl: '',
      published: !asDraft,
      isFeatured: existing?.isFeatured || false,
      featuredOrder: existing?.featuredOrder ?? null,
    }
    if (isNew) {
      const nums = products.map((p) => /^p(\d+)$/.exec(p.id)).filter(Boolean).map((m) => Number(m[1]))
      await addProduct({ ...payload, id: 'p' + ((nums.length ? Math.max(...nums) : 0) + 1) })
    } else {
      await updateProduct(id, payload)
    }
    navigate('/admin/products')
  }

  const catOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[var(--adm-ink)]">
            {isNew ? 'Tambah Produk' : 'Edit Produk'}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--adm-muted)]">
            <Link to="/admin/products" className="hover:underline">Produk</Link>
            {' / '}
            <span>{isNew ? 'Tambah Produk' : name || 'Edit'}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--adm-border)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--adm-ink)] hover:bg-[var(--adm-bg)]"
          >
            Simpan Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-black"
            style={{ background: 'var(--adm-mint)' }}
          >
            Submit Produk
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ─── Left: Form ─────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          {/* Images */}
          <div className="adm-card p-5">
            <FieldLabel>Gambar</FieldLabel>
            <p className="mb-3 text-[12px] text-[var(--adm-muted)]">
              Dimensi: 600 × 600 px. Maks. 10 MB (hingga 9 file). Format: JPG, JPEG, PNG
            </p>
            <div className="grid grid-cols-4 gap-2">
              {/* Main slot (bigger) */}
              <div className="col-span-1 row-span-2">
                <ImageSlot
                  src={images[0]}
                  onRemove={images[0] ? () => removeImg(0) : null}
                  main
                  onClick={() => handleImgClick(0)}
                />
              </div>
              {/* Thumbnail slots */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ImageSlot
                  key={i}
                  src={images[i]}
                  onRemove={images[i] ? () => removeImg(i) : null}
                  onClick={() => handleImgClick(i)}
                />
              ))}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Basic Info */}
          <div className="adm-card flex flex-col gap-4 p-5">
            <div>
              <FieldLabel>Nama Produk</FieldLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama produk di sini" />
            </div>
            <div>
              <FieldLabel>Kategori</FieldLabel>
              <Select value={category} onChange={setCategory} options={catOptions} placeholder="Pilih kategori" />
            </div>
            <div>
              <FieldLabel>Brand</FieldLabel>
              <Select value={brand} onChange={setBrand} options={BRANDS} placeholder="Pilih brand" />
            </div>
            <div>
              <FieldLabel>Kompatibel Dengan</FieldLabel>
              <Input value={compat} onChange={(e) => setCompat(e.target.value)} placeholder="Contoh: Honda Vario 125, Universal" />
              <p className="mt-1 text-[11px] text-[var(--adm-muted)]">Pisahkan dengan koma</p>
            </div>
          </div>

          {/* Description */}
          <div className="adm-card flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <FieldLabel>Deskripsi</FieldLabel>
              {aiGenerated && (
                <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--adm-mint)' }}>
                  <Sparkle size={12} weight="fill" /> AI Generated
                </span>
              )}
            </div>

            {showSuggestion && (
              <div className="rounded-xl border border-[var(--adm-border)] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--adm-ink)]">
                    <Sparkle size={14} weight="fill" style={{ color: 'var(--adm-mint)' }} />
                    Saran AI
                  </span>
                  <button type="button" onClick={() => setShowSuggestion(false)}>
                    <X size={14} className="text-[var(--adm-muted)]" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-[var(--adm-border)] px-3 py-2 text-[13px] outline-none focus:border-[var(--adm-forest-500)] placeholder:text-[var(--adm-muted)]"
                    placeholder="Kata kunci manfaat, fitur, atau deskripsi"
                    value={aiKeyword}
                    onChange={(e) => setAiKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="rounded-xl px-4 py-2 text-[13px] font-semibold text-black"
                    style={{ background: 'var(--adm-mint)' }}
                  >
                    Generate
                  </button>
                </div>
              </div>
            )}

            <textarea
              className="h-32 w-full rounded-xl border border-[var(--adm-border)] px-4 py-3 text-[14px] text-[var(--adm-ink)] outline-none placeholder:text-[var(--adm-muted)] focus:border-[var(--adm-forest-500)] resize-none"
              placeholder="Masukkan deskripsi produk di sini"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {!showSuggestion && (
              <button
                type="button"
                onClick={() => setShowSuggestion(true)}
                className="flex w-fit items-center gap-1.5 text-[12px]"
                style={{ color: 'var(--adm-info)' }}
              >
                <Sparkle size={12} weight="fill" /> Gunakan saran AI
              </button>
            )}
          </div>

          {/* Video */}
          <div className="adm-card p-5">
            <FieldLabel>Video</FieldLabel>
            <p className="mb-3 text-[12px] text-[var(--adm-muted)]">
              Rasio aspek 9:16 atau 16:9. Maks. 100 MB. Format MP4.
            </p>
            <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--adm-border)] bg-[var(--adm-bg)]">
              <UploadSimple size={20} className="text-[var(--adm-muted)]" />
              <span className="text-[12px] text-[var(--adm-muted)]">Upload video</span>
            </div>
          </div>

          {/* Variations */}
          <div
            className="adm-card flex items-center justify-between gap-4 p-5"
            style={{ background: addVariations ? 'rgba(254,201,1,0.06)' : undefined }}
          >
            <div>
              <p className="text-[14px] font-medium text-[var(--adm-ink)]">Tambah Variasi</p>
              <p className="text-[12px] text-[var(--adm-muted)]">Tambahkan hingga 3 variasi produk (ukuran, warna, material, dll).</p>
            </div>
            <Toggle enabled={addVariations} onChange={setAddVariations} />
          </div>

          {/* Price & Stock */}
          <div className="adm-card flex flex-col gap-4 p-5">
            <p className="text-[15px] font-medium text-[var(--adm-ink)]">Harga</p>

            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox checked={preorder} onChange={setPreorder} />
              <span className="text-[13px] text-[var(--adm-ink)]">Pre-order</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Harga Jual</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--adm-muted)]">Rp</span>
                  <input
                    className="w-full rounded-xl border border-[var(--adm-border)] py-2.5 pl-9 pr-3 text-[14px] outline-none focus:border-[var(--adm-forest-500)]"
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>SKU Produk</FieldLabel>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Contoh: NHK-001" />
              </div>
            </div>

            {/* Purchase Limits */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[var(--adm-ink)]">Batas Pembelian Pelanggan</p>
                  <p className="text-[12px] text-[var(--adm-muted)]">Atur jumlah min & maks pembelian per pesanan.</p>
                </div>
                <Toggle enabled={purchaseLimits} onChange={setPurchaseLimits} />
              </div>

              {purchaseLimits && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Minimum</FieldLabel>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMinPurchase((p) => Math.max(1, p - 1))}
                        className="flex size-8 items-center justify-center rounded-lg border border-[var(--adm-border)]"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        className="w-16 rounded-xl border border-[var(--adm-border)] py-1.5 text-center text-[14px]"
                        type="number"
                        min={1}
                        value={minPurchase}
                        onChange={(e) => setMinPurchase(Number(e.target.value))}
                      />
                      <button
                        type="button"
                        onClick={() => setMinPurchase((p) => p + 1)}
                        className="flex size-8 items-center justify-center rounded-lg border border-[var(--adm-border)]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Maksimum</FieldLabel>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMaxPurchase((p) => Math.max(1, p - 1))}
                        className="flex size-8 items-center justify-center rounded-lg border border-[var(--adm-border)]"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        className="w-16 rounded-xl border border-[var(--adm-border)] py-1.5 text-center text-[14px]"
                        type="number"
                        min={1}
                        value={maxPurchase}
                        onChange={(e) => setMaxPurchase(Number(e.target.value))}
                      />
                      <button
                        type="button"
                        onClick={() => setMaxPurchase((p) => p + 1)}
                        className="flex size-8 items-center justify-center rounded-lg border border-[var(--adm-border)]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Right: Preview + Recommendations ───────────────────────── */}
        <div className="hidden w-[260px] shrink-0 flex-col gap-4 lg:flex">
          {/* Preview card */}
          <div className="adm-card p-4">
            <p className="mb-1 text-[13px] font-medium text-[var(--adm-ink)]">Preview</p>
            <p className="mb-3 text-[11px] text-[var(--adm-muted)]">Tampilan produk kamu.</p>

            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[var(--adm-bg)]">
              {previewImg ? (
                <img src={previewImg} alt="Preview" className="size-full object-cover" />
              ) : (
                <Package size={48} className="text-[var(--adm-border-strong)]" />
              )}
            </div>

            <p className="mt-3 text-[13px] font-medium text-[var(--adm-ink)] line-clamp-2">
              {name || 'Nama Produk'}
            </p>
            {description && (
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--adm-muted)] line-clamp-3">{description}</p>
            )}

            {images.filter(Boolean).length > 1 && (
              <div className="mt-2 flex gap-1">
                {images.filter(Boolean).slice(1, 4).map((src, i) => (
                  <img key={i} src={src} alt="" className="size-9 rounded-lg object-cover border border-[var(--adm-border)]" />
                ))}
              </div>
            )}

            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--adm-border)] py-2 text-[13px] font-medium text-[var(--adm-ink)] hover:bg-[var(--adm-bg)]"
            >
              <ShoppingCart size={15} />
              Beli sekarang
            </button>

            {price && (
              <p className="mt-2 text-center text-[13px] font-semibold text-[var(--adm-ink)]">
                {formatCurrency(Number(price))}
              </p>
            )}
          </div>

          {/* Recommendations */}
          <div className="adm-card p-4">
            <p className="mb-3 text-[13px] font-medium text-[var(--adm-ink)]">Rekomendasi</p>
            <div className="flex flex-col gap-2.5">
              {recs.map((r) => (
                <div key={r.label} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border"
                    style={
                      r.done
                        ? { background: 'var(--adm-success)', borderColor: 'var(--adm-success)' }
                        : { borderColor: 'var(--adm-border)' }
                    }
                  >
                    {r.done && <Check size={8} weight="bold" color="white" />}
                  </span>
                  <span className="text-[11px] leading-relaxed text-[var(--adm-muted)]">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
