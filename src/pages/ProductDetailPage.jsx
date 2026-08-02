import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import Rating from '../components/ui/Rating'
import PriceTag from '../components/ui/PriceTag'
import QuantitySelector from '../components/ui/QuantitySelector'
import Button from '../components/ui/Button'
import { useCart } from '../context/CartContext'
import { PRODUCTS } from '../data/products'
import { CATEGORIES } from '../data/categories'

// The Figma reference for this screen ("Detail Products - Overview", Vergelle
// skincare template) shows literal lifestyle/product photography for the
// gallery + thumbnails and a "bundle purchase" cross-sell card tied to a
// second skincare SKU. Per project convention (see SearchPage), we don't
// reuse any skincare imagery here — the gallery only ever renders the
// product's own placeholder image (repeated for the thumbnail strip, since
// mock data has a single image per product), and the bundle card is omitted
// since this app's data model has no bundle/cross-sell relationship.
export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [activeThumb, setActiveThumb] = useState(0)

  const product = PRODUCTS.find((p) => p.id === id)

  if (!product) {
    navigate('/')
    return null
  }

  const category = CATEGORIES.find((c) => c.id === product.category)
  const thumbnails = [product.image, product.image, product.image, product.image]

  const handleAddToCart = () => {
    addItem(product.id, qty)
  }

  const handleBuyNow = () => {
    addItem(product.id, qty)
    navigate('/cart')
  }

  return (
    <div>
      <Nav />

      <section className="flex flex-col gap-8 px-4 py-6 lg:flex-row lg:gap-10 lg:px-16 lg:py-10">
        {/* Gallery */}
        <div className="flex flex-col gap-3 lg:w-3/5">
          <div className="aspect-square w-full overflow-hidden rounded-md bg-neutral-50">
            <img
              src={thumbnails[activeThumb]}
              alt={product.name}
              className="size-full object-contain p-10 lg:p-16"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 lg:gap-3">
            {thumbnails.map((thumb, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveThumb(index)}
                aria-label={`Lihat gambar ${index + 1}`}
                className={`aspect-square overflow-hidden rounded-md bg-neutral-50 transition-colors ${
                  activeThumb === index ? 'ring-2 ring-primary-600' : 'ring-1 ring-neutral-100'
                }`}
              >
                <img src={thumb} alt="" className="size-full object-contain p-3" />
              </button>
            ))}
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
                product.stock > 0
                  ? 'bg-primary-100 text-primary-900'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
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
            <QuantitySelector value={qty} max={product.stock} onChange={setQty} />
            <div className="flex flex-1 gap-3">
              <Button variant="secondary" className="flex-1" onClick={handleAddToCart}>
                Tambah ke Keranjang
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleBuyNow}>
                Beli Sekarang
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
