import { Link } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import CategoryChip from '../components/ui/CategoryChip'
import ProductCard from '../components/ui/ProductCard'
import Button from '../components/ui/Button'
import { useHomepage, useProducts, useCategories } from '../store/hooks'

export default function HomePage() {
  const homepage = useHomepage()
  const products = useProducts()
  const categories = useCategories()

  const publishedProducts = products.filter((p) => p.published)

  const activeBanners = [...homepage.banners]
    .filter((b) => b.active)
    .sort((a, b) => a.order - b.order)
  const banner = activeBanners[0]

  const featured = homepage.featuredProductIds
    .map((id) => publishedProducts.find((p) => p.id === id))
    .filter(Boolean)

  const headline = banner?.headline ?? 'Sparepart motor original untuk performa maksimal'
  const subtext =
    banner?.subtext ??
    'Dari mesin, kelistrikan, sampai body & aksesoris — semua kebutuhan sparepart motor Anda ada di sini, lengkap dengan garansi keaslian.'
  const ctaHref = banner?.ctaHref ?? '/search'
  const ctaLabel = banner?.ctaLabel ?? 'Belanja Sekarang'

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
              <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary-600" />
              <span className="text-sm text-neutral-0">Sparepart original, siap kirim hari ini</span>
            </div>
            <h1 className="max-w-xl text-3xl font-medium leading-tight tracking-tight text-neutral-0 lg:text-5xl">
              {headline}
            </h1>
            <p className="max-w-md text-neutral-200">{subtext}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to={ctaHref}>
                <Button variant="accent">{ctaLabel}</Button>
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

          {banner?.image && (
            <div className="flex w-full flex-1 justify-start gap-4 overflow-x-auto pb-2 lg:w-auto lg:flex-col lg:overflow-visible lg:pb-0">
              <div className="relative w-64 shrink-0 overflow-hidden rounded-md bg-neutral-0/95 shadow-lg lg:w-96">
                <div className="aspect-square w-full bg-neutral-100">
                  <img src={banner.image} alt={headline} className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="kategori" className="flex gap-3 overflow-x-auto px-4 py-8 lg:px-16">
        <Link to="/search">
          <CategoryChip label="Semua" />
        </Link>
        {categories.map((c) => (
          <Link key={c.id} to={`/search?category=${c.id}`}>
            <CategoryChip label={c.name} />
          </Link>
        ))}
      </section>

      <section className="px-4 py-8 lg:px-16">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">Produk Terbaru</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-neutral-25 px-4 py-8 lg:px-16">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">Apa Kata Pelanggan</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homepage.testimonials.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 rounded-md border border-neutral-100 bg-neutral-0 p-5 shadow-sm"
            >
              <span aria-hidden="true" className="text-primary-800 text-sm leading-none">
                {'★'.repeat(t.rating)}
                {'☆'.repeat(Math.max(0, 5 - t.rating))}
              </span>
              <p className="text-sm text-neutral-800">{t.text}</p>
              <span className="text-sm font-medium text-neutral-900">{t.author}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
