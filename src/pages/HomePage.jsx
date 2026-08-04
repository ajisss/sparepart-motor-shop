import { Link } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import ProductCard from '../components/ui/ProductCard'
import Button from '../components/ui/Button'
import { useHomepage, useProducts } from '../store/hooks'

// Landing page — long-form section composition (announcement → hero → marquee →
// product lines → product grid → how-it-works → CTA band → why → FAQ → trust →
// footer), with DMB's own content as a motorcycle-parts MANUFACTURER (produsen),
// black + yellow brand. Token-only, no new dependencies. Image areas use styled
// placeholders until real photography is available.

const MARQUEE_ITEMS = [
  'Diproduksi Sendiri',
  'Sparepart Original',
  'Garansi Keaslian',
  'Harga Langsung Produsen',
  'Kirim Se-Indonesia',
  'Bandung',
]

const PRODUCT_LINES = [
  {
    title: 'Mesin & Pengereman',
    desc: 'Kampas rem, kopling, part mesin presisi — diproduksi dengan standar QC pabrikan.',
    cta: 'Lihat Lini Mesin',
    href: '/search?category=mesin',
  },
  {
    title: 'Kelistrikan & Pengapian',
    desc: 'Aki, busi, koil, dan komponen kelistrikan yang awet untuk motor harian maupun modifikasi.',
    cta: 'Lihat Kelistrikan',
    href: '/search?category=kelistrikan',
  },
  {
    title: 'Bodi & Aksesoris',
    desc: 'Spion, cover body, hingga aksesoris racing — bikin motormu tampil beda.',
    cta: 'Lihat Aksesoris',
    href: '/search',
  },
]

const STEPS = [
  { n: '01', title: 'Pilih sparepart', desc: 'Telusuri katalog per lini produk atau cari langsung part yang kamu butuhkan.' },
  { n: '02', title: 'Checkout & bayar', desc: 'Isi alamat, pilih ekspedisi, bayar aman lewat simulasi Midtrans Snap.' },
  { n: '03', title: 'Kami proses & kirim', desc: 'Pesanan disiapkan langsung dari gudang produsen, resi terbit otomatis.' },
  { n: '04', title: 'Lacak sampai tiba', desc: 'Pantau status pesanan real-time dari halaman Lacak Pesanan atau akunmu.' },
]

const WHY = [
  { n: '01', title: 'Diproduksi & diuji sendiri' },
  { n: '02', title: 'Harga langsung dari produsen' },
  { n: '03', title: 'Cocok untuk banyak tipe motor' },
]

const FAQS = [
  { q: 'Apakah sparepart DMB original?', a: 'Ya. DMB adalah produsen sparepart motor — setiap part diproduksi dan diuji sendiri dengan standar QC pabrikan, bukan barang KW.' },
  { q: 'Bagaimana cara melacak pesanan saya?', a: 'Pelanggan terdaftar bisa melihat riwayat & status di halaman Akun. Tamu bisa memakai halaman Lacak Pesanan dengan Order ID + email/HP yang dipakai saat checkout.' },
  { q: 'Metode pembayaran apa yang didukung?', a: 'Pembayaran diproses lewat Midtrans Snap (Virtual Account, GoPay, QRIS). Pada prototipe ini pembayaran disimulasikan.' },
  { q: 'Apakah melayani grosir atau reseller?', a: 'Ya. Sebagai produsen, kami melayani pembelian grosir untuk bengkel dan reseller. Hubungi tim kami untuk penawaran harga khusus.' },
  { q: 'Berapa lama pengiriman?', a: 'Tergantung ekspedisi dan layanan yang dipilih saat checkout — mulai Same Day (Bandung) sampai Reguler 2–3 hari ke luar kota.' },
]

const TRUST = [
  { icon: ShieldIcon, title: 'Pembayaran aman', sub: 'Diproses lewat Midtrans' },
  { icon: BoxIcon, title: 'Dikemas rapi', sub: 'Aman sampai tujuan' },
  { icon: TruckIcon, title: 'Kirim 1–3 hari', sub: 'Ekspedisi pilihanmu' },
  { icon: ChatIcon, title: 'Tim siap bantu', sub: 'Sebelum & sesudah beli' },
]

export default function HomePage() {
  const homepage = useHomepage()
  const products = useProducts()

  const publishedProducts = products.filter((p) => p.published)
  const featured = homepage.featuredProductIds
    .map((id) => publishedProducts.find((p) => p.id === id))
    .filter(Boolean)

  return (
    <div>
      {/* Announcement bar */}
      <div className="bg-neutral-900 px-4 py-2.5 text-center text-xs font-medium tracking-wide text-neutral-0 lg:text-sm">
        🔥 Promo Launch — Gratis ongkir untuk pembelian di atas Rp300.000. Pakai kode{' '}
        <span className="font-semibold text-secondary-600">ONGKIR</span>
      </div>

      <Nav />

      {/* Hero */}
      <section className="px-4 pt-6 lg:px-16 lg:pt-8">
        <div
          className="relative mx-auto flex min-h-[520px] max-w-7xl items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 px-6 py-20 lg:min-h-[600px] lg:py-28"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 10%, rgba(254,201,1,0.14), transparent 45%), radial-gradient(circle at 15% 90%, rgba(254,201,1,0.08), transparent 40%)',
          }}
        >
          <div className="absolute right-6 top-6 hidden lg:block">
            <StarburstBadge />
          </div>

          <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-pill border border-neutral-0/20 bg-neutral-0/10 px-3 py-1.5 text-sm text-neutral-0 backdrop-blur">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary-600" />
              Produsen sparepart motor · Bandung
            </span>
            <h1 className="text-4xl font-medium leading-[1.05] tracking-tight text-neutral-0 lg:text-6xl">
              Sparepart motor original, <span className="text-secondary-600">bikinan sendiri</span>
            </h1>
            <p className="max-w-xl text-base text-neutral-200 lg:text-lg">
              DMB memproduksi sparepart motor berkualitas — dari mesin, kelistrikan, sampai bodi &amp;
              aksesoris. Langsung dari produsen ke tanganmu, dengan garansi keaslian.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/search">
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  Belanja Sekarang
                </Button>
              </Link>
              <Link to="/lacak">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full !border-neutral-0/40 !bg-transparent !text-neutral-0 hover:!bg-neutral-0/10 sm:w-auto"
                >
                  Lacak Pesanan
                </Button>
              </Link>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
              Didukung Midtrans &amp; Biteship
            </p>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="mt-16 lg:mt-24">
        <Marquee />
      </div>

      {/* Product lines */}
      <section className="px-4 py-16 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mx-auto mb-12 max-w-3xl text-center text-3xl font-medium tracking-tight text-neutral-900 lg:mb-16 lg:text-5xl">
            Diproduksi untuk setiap lini motormu.
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {PRODUCT_LINES.map((it) => (
              <div key={it.title} className="flex flex-col gap-4 rounded-2xl bg-neutral-900 p-8">
                <h3 className="text-2xl font-medium text-neutral-0">{it.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-neutral-300">{it.desc}</p>
                <Link to={it.href} className="w-fit">
                  <Button variant="accent" size="sm">{it.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="px-4 pb-16 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center lg:mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-800">
              Produk Terbaru
            </span>
            <h2 className="max-w-2xl text-3xl font-medium tracking-tight text-neutral-900 lg:text-5xl">
              Part pilihan yang paling dicari
            </h2>
            <p className="max-w-md text-neutral-600">
              Kurasi sparepart original terlaris — siap kirim, cocok untuk motor harian maupun modifikasi.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-14 flex justify-center">
            <Link to="/search">
              <Button variant="primary" size="lg">Lihat Semua Produk</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-900 px-4 py-16 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col items-center gap-3 text-center lg:mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-600">
              Cara Belanja
            </span>
            <h2 className="max-w-2xl text-3xl font-medium tracking-tight text-neutral-0 lg:text-5xl">
              Dari cari part sampai depan pintu, dalam 4 langkah
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-4">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-neutral-0/10 bg-neutral-0/5">
                  <PlaceholderMark />
                  <span className="absolute left-3 top-3 text-sm font-semibold text-secondary-600">{s.n}</span>
                </div>
                <h3 className="text-lg font-medium text-neutral-0">{s.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex justify-center">
            <Link to="/search">
              <Button variant="accent" size="lg">Mulai Belanja</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden bg-secondary-600 px-4 py-20 text-center lg:px-16">
        <CtaOrnaments />
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900/70">
            Motormu, prioritas kami
          </span>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-neutral-900 lg:text-5xl">
            Siap upgrade motormu dengan part original?
          </h2>
          <p className="mt-4 text-neutral-900/80">
            Diproduksi sendiri • Gratis ongkir 300rb+ • Kirim se-Indonesia • Bandung
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/search">
              <Button variant="primary" size="lg">Belanja Sekarang</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose us — big numbered image cards */}
      <section className="px-4 py-16 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center lg:mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-800">
              Kenapa DMB
            </span>
            <h2 className="max-w-2xl text-3xl font-medium tracking-tight text-neutral-900 lg:text-5xl">
              Kenapa pilih sparepart DMB?
            </h2>
            <p className="max-w-md text-neutral-600">
              Karena mengurus motor harusnya gampang, jujur, dan cepat — langsung dari produsennya.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {WHY.map((w) => (
              <div
                key={w.n}
                className="group relative flex aspect-[4/5] items-end overflow-hidden rounded-2xl bg-neutral-100"
              >
                <PlaceholderMark large />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/85 via-neutral-900/20 to-transparent" />
                <div className="relative z-10 flex flex-col gap-1 p-6">
                  <span className="text-sm font-semibold text-secondary-600">{w.n}</span>
                  <h3 className="text-2xl font-medium leading-tight text-neutral-0">{w.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-16 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center lg:mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-800">
              Pertanyaan Umum
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-neutral-900 lg:text-4xl">
              Masih ragu? Ini jawabannya.
            </h2>
          </div>
          <div className="flex flex-col">
            {FAQS.map((f) => (
              <details key={f.q} className="group border-b border-neutral-200 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-neutral-900">
                  {f.q}
                  <span className="flex size-6 shrink-0 items-center justify-center text-xl text-secondary-800 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="border-t border-neutral-100 px-4 py-14 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <span className="flex size-11 items-center justify-center rounded-full bg-secondary-100 text-secondary-800">
                <Icon />
              </span>
              <span className="font-medium text-neutral-900">{title}</span>
              <span className="text-sm text-neutral-600">{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee (repeat) */}
      <Marquee />

      <Footer />
    </div>
  )
}

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="overflow-hidden bg-secondary-600 py-3">
      <div className="flex w-max animate-marquee items-center gap-6 whitespace-nowrap pr-6 motion-reduce:animate-none">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-6 text-sm font-semibold uppercase tracking-wide text-neutral-900">
            {t}
            <span aria-hidden="true" className="text-neutral-900/40">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Neutral image placeholder mark, used until real photography is supplied.
function PlaceholderMark({ large }) {
  return (
    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-400">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={large ? 'size-9' : 'size-6'} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M21 16l-5-5-6 6-3-3-4 4" />
      </svg>
      <span className="text-[10px] uppercase tracking-[0.2em]">Gambar</span>
    </span>
  )
}

function StarburstBadge() {
  return (
    <div className="relative flex size-24 items-center justify-center">
      <span className="absolute inset-0 rounded-[28%] bg-secondary-600" />
      <span className="absolute inset-0 rotate-45 rounded-[28%] bg-secondary-600" />
      <span className="relative flex size-16 flex-col items-center justify-center rounded-full bg-neutral-900 text-center">
        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-0">Hemat</span>
        <span className="text-lg font-semibold leading-none text-secondary-600">50rb</span>
      </span>
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <path d="M3 7l9 4 9-4M12 11v10" />
    </svg>
  )
}
function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16v11H8l-4 3V5z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  )
}

// Decorative sparepart-themed vector ornaments for the CTA band background.
// Dark shapes at low opacity — behind the content, non-interactive.
function CtaOrnaments() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-neutral-900">
      <Gear teeth={10} className="absolute -left-12 -top-12 size-44 opacity-[0.07]" />
      <Gear teeth={14} className="absolute -bottom-20 left-10 size-64 opacity-[0.05]" />
      <Gear teeth={9} className="absolute right-1/4 -top-16 size-32 opacity-[0.06]" />
      <HexNut className="absolute right-10 top-10 size-16 rotate-12 opacity-[0.09]" />
      <HexNut className="absolute left-8 bottom-10 size-10 -rotate-6 opacity-[0.08]" />
      <Wrench className="absolute -right-4 -bottom-6 size-48 -rotate-12 opacity-[0.07]" />
      <Chain className="absolute right-16 bottom-16 w-40 opacity-[0.06]" />
    </div>
  )
}

function Gear({ teeth = 10, className = '' }) {
  const angles = Array.from({ length: teeth }, (_, i) => (i * 360) / teeth)
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      {angles.map((a, i) => (
        <rect key={i} x="46" y="3" width="8" height="16" rx="2" fill="currentColor" transform={`rotate(${a} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="30" strokeWidth="7" />
      <circle cx="50" cy="50" r="12" strokeWidth="6" />
    </svg>
  )
}

function HexNut({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" aria-hidden="true">
      <polygon points="50,6 89,28 89,72 50,94 11,72 11,28" />
      <circle cx="50" cy="50" r="18" />
    </svg>
  )
}

function Wrench({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function Chain({ className = '' }) {
  return (
    <svg viewBox="0 0 120 34" className={className} fill="none" stroke="currentColor" strokeWidth="4" aria-hidden="true">
      <rect x="3" y="7" width="30" height="20" rx="10" />
      <rect x="27" y="7" width="30" height="20" rx="10" />
      <rect x="51" y="7" width="30" height="20" rx="10" />
      <rect x="75" y="7" width="30" height="20" rx="10" />
    </svg>
  )
}
