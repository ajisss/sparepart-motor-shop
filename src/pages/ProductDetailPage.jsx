import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import Rating from '../components/ui/Rating'
import PriceTag from '../components/ui/PriceTag'
import QuantitySelector from '../components/ui/QuantitySelector'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Carousel from '../components/ui/Carousel'
import { useCart } from '../context/CartContext'
import { useProduct, useCategories } from '../store/hooks'

function toEmbedUrl(url) {
  const match = url.match(/[?&]v=([^&]+)/)
  const id = match ? match[1] : null
  return id ? `https://www.youtube.com/embed/${id}` : url
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const categories = useCategories()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const product = useProduct(id)

  if (!product) {
    return (
      <div>
        <Nav />
        <EmptyState
          title="Produk tidak ditemukan"
          description="Produk yang kamu cari tidak tersedia atau sudah dihapus."
          actionLabel="Cari Produk Lain"
          onAction={() => navigate('/search')}
        />
        <Footer />
      </div>
    )
  }

  const category = categories.find((c) => c.id === product.category)
  const hasStock = product.stock > 0

  const handleAddToCart = () => {
    addItem(product.id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addItem(product.id, qty)
    navigate('/checkout')
  }

  return (
    <div>
      <Nav />

      <section className="flex flex-col gap-8 px-4 py-6 lg:flex-row lg:gap-10 lg:px-16 lg:py-10">
        {/* Gallery */}
        <div className="flex flex-col gap-3 lg:w-3/5">
          <Carousel images={product.images} alt={product.name} />

          {product.videoUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-md bg-neutral-50">
              <iframe
                src={toEmbedUrl(product.videoUrl)}
                title={`Video ${product.name}`}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-neutral-900">Ulasan Pelanggan</h3>
            {product.testimonials.length === 0 ? (
              <p className="text-sm text-neutral-600">Belum ada ulasan.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {product.testimonials.map((t) => (
                  <li key={t.id} className="rounded-md border border-neutral-100 p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-900">{t.author}</span>
                      <span className="text-xs text-neutral-500">{t.date}</span>
                    </div>
                    <Rating value={t.rating} />
                    <p className="mt-1 text-sm text-neutral-600">{t.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5 lg:w-2/5">
          <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.18px] text-neutral-600">
            <Link to="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            {category && (
              <>
                <Link to="/search">{category.name}</Link>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span className="text-neutral-900">Detail Produk</span>
          </div>
          <div className="border-t border-neutral-100" />

          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center rounded-md bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-900">
              {product.brand}
            </span>
            <h1 className="text-xl font-medium leading-tight tracking-tight text-neutral-900 lg:text-[32px]">
              {product.name}
            </h1>
          </div>
          <div className="border-t border-neutral-100" />

          <div className="flex items-center justify-between">
            <PriceTag amount={product.price} />
            <span
              className={`rounded-pill px-4 py-1 text-xs font-medium uppercase tracking-[0.18px] ${
                hasStock
                  ? 'bg-primary-100 text-primary-900'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {hasStock ? `Stok: ${product.stock}` : 'Stok habis'}
            </span>
          </div>
          <div className="border-t border-neutral-100" />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-neutral-900">Tentang Produk</h3>
              <p className="text-sm text-neutral-600">{product.description}</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-900">Kompatibel dengan:</h3>
              <ul className="flex flex-wrap gap-2">
                {product.compatibleWith.map((m) => (
                  <li key={m} className="rounded-md bg-primary-25 px-2.5 py-1.5 text-xs font-medium text-primary-800">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-100" />

          <Rating value={product.rating} reviewCount={product.reviewCount} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <QuantitySelector value={qty} min={1} max={hasStock ? product.stock : 1} onChange={setQty} />
            <div className="flex flex-1 gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!hasStock}
              >
                {added ? 'Ditambahkan ✓' : 'Tambah ke Keranjang'}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={!hasStock}
              >
                Checkout Sekarang
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
