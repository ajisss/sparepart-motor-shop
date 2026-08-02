import { useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import CategoryChip from '../components/ui/CategoryChip'
import ProductCard from '../components/ui/ProductCard'
import Button from '../components/ui/Button'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS } from '../data/products'

// Hero "floating cards" mirror the Figma reference's composition (stacked
// preview cards with a pill badge, offset to the side of the headline) but
// use this project's own product placeholder art instead of the Figma
// file's skincare photography, which doesn't belong on a motorcycle
// spare parts shop.
const HERO_HIGHLIGHTS = [
  { product: PRODUCTS.find((p) => p.id === 'p1'), badge: 'Terlaris' },
  { product: PRODUCTS.find((p) => p.id === 'p2'), badge: 'Favorit' },
  { product: PRODUCTS.find((p) => p.id === 'p5'), badge: 'Baru' },
]

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState(null)

  const filtered = activeCategory
    ? PRODUCTS.filter((p) => p.category === activeCategory)
    : PRODUCTS

  return (
    <div>
      <Nav />

      <section className="relative overflow-hidden bg-neutral-900 px-4 py-16 lg:px-16 lg:py-24">
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 700"
          aria-hidden="true"
        >
          <circle cx="1220" cy="80" r="360" className="fill-primary-800" fillOpacity="0.35" />
          <circle cx="120" cy="640" r="300" className="fill-primary-600" fillOpacity="0.18" />
          <circle cx="700" cy="350" r="220" className="fill-none stroke-primary-200" strokeOpacity="0.15" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 flex flex-col items-center gap-12 lg:flex-row lg:items-center">
          <div className="flex w-full flex-1 flex-col items-start gap-6 text-left">
            <div className="flex items-center gap-3 rounded-md border border-neutral-0/20 bg-neutral-0/10 px-3 py-1.5 backdrop-blur">
              <span aria-hidden="true" className="size-1 rounded-full bg-primary-200" />
              <span className="text-sm text-neutral-0">Sparepart original, siap kirim hari ini</span>
            </div>
            <h1 className="max-w-xl text-3xl font-medium leading-tight tracking-tight text-neutral-0 lg:text-5xl">
              Sparepart motor original untuk performa maksimal
            </h1>
            <p className="max-w-md text-neutral-200">
              Dari mesin, kelistrikan, sampai body & aksesoris — semua kebutuhan sparepart motor Anda
              ada di sini, lengkap dengan garansi keaslian.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/search">
                <Button variant="primary">Belanja Sekarang</Button>
              </Link>
              <a href="#kategori">
                <Button
                  variant="secondary"
                  className="!border-neutral-0/50 !bg-transparent !text-neutral-0 hover:!bg-neutral-0/10"
                >
                  Lihat Kategori
                </Button>
              </a>
            </div>
          </div>

          <div className="flex w-full flex-1 justify-start gap-4 overflow-x-auto pb-2 lg:w-auto lg:flex-col lg:overflow-visible lg:pb-0">
            {HERO_HIGHLIGHTS.map(({ product, badge }) => (
              <div
                key={product.id}
                className="relative w-40 shrink-0 overflow-hidden rounded-md bg-neutral-0/95 shadow-lg lg:w-72"
              >
                <div className="aspect-square w-full bg-neutral-100">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <span className="absolute left-3 top-3 rounded-pill bg-primary-200 px-3 py-1 text-xs font-medium uppercase tracking-[0.18px] text-primary-900">
                  {badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kategori" className="flex gap-3 overflow-x-auto px-4 py-8 lg:px-16">
        <CategoryChip label="Semua" active={!activeCategory} onClick={() => setActiveCategory(null)} />
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.name}
            active={activeCategory === c.id}
            onClick={() => setActiveCategory(c.id)}
          />
        ))}
      </section>

      <section className="px-4 py-8 lg:px-16">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">Produk Pilihan</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
