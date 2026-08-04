import { Link } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import ProductCard from '../components/ui/ProductCard'
import Button from '../components/ui/Button'
import { useHomepage, useProducts } from '../store/hooks'

// Landing page — section composition mirrors a reference long-form landing
// layout (announcement bar → hero → marquee → intent cards → product grid →
// how-it-works → CTA band → why → FAQ → trust row → footer), rebuilt with DMB's
// own content and the black + yellow brand. Token-only, no new dependencies.

const MARQUEE_ITEMS = [
  'Sparepart Original',
  'Garansi Keaslian',
  'Gratis Ongkir 300rb+',
  'Kurir Same Day Bandung',
  'Pembayaran Aman via Midtrans',
  'Kirim Se-Indonesia',
]

const INTENTS = [
  {
    title: 'Servis Rutin',
    desc: 'Oli, busi, kampas rem, filter — stok lengkap untuk perawatan berkala motormu.',
    cta: 'Belanja Part Servis',
    href: '/search?category=mesin',
  },
  {
    title: 'Upgrade Performa',
    desc: 'Knalpot, CDI, koil, hingga part racing untuk dongkrak tenaga dan tampilan.',
    cta: 'Lihat Part Upgrade',
    href: '/search',
  },
  {
    title: 'Ganti Part Rusak',
    desc: 'Aki soak, lampu mati, spion patah? Cari penggantinya yang ori di sini.',
    cta: 'Cari Sparepart',
    href: '/search',
  },
]

const STEPS = [
  { n: '01', title: 'Pilih sparepart', desc: 'Telusuri katalog per kategori atau cari langsung part yang kamu butuhkan.' },
  { n: '02', title: 'Checkout & bayar', desc: 'Isi alamat, pilih ekspedisi, bayar aman lewat simulasi Midtrans Snap.' },
  { n: '03', title: 'Kami proses & kirim', desc: 'Pesanan disiapkan, shipment dibuat, dan nomor resi otomatis terbit.' },
  { n: '04', title: 'Lacak sampai tiba', desc: 'Pantau status pesanan real-time dari halaman Lacak Pesanan atau akunmu.' },
]

const WHY = [
  { n: '01', title: 'Keaslian terjamin', desc: 'Setiap part dijamin original dengan sumber resmi — bukan KW.' },
  { n: '02', title: 'Harga bersahabat', desc: 'Harga bengkel yang jujur, plus promo dan kode ongkir berkala.' },
  { n: '03', title: 'Kirim cepat', desc: 'Diproses hari yang sama, dikirim ke seluruh Indonesia via ekspedisi pilihan.' },
]

const FAQS = [
  { q: 'Apakah semua sparepart di DMB original?', a: 'Ya. Seluruh part yang kami jual dijamin original dengan sumber resmi. Setiap produk mencantumkan merek dan kecocokan motornya.' },
  { q: 'Bagaimana cara melacak pesanan saya?', a: 'Pelanggan terdaftar bisa melihat riwayat & status di halaman Akun. Tamu bisa memakai halaman Lacak Pesanan dengan Order ID + email/HP yang dipakai saat checkout.' },
  { q: 'Metode pembayaran apa yang didukung?', a: 'Pembayaran diproses lewat Midtrans Snap (Virtual Account, GoPay, QRIS). Pada prototipe ini pembayaran disimulasikan.' },
  { q: 'Berapa lama pengiriman?', a: 'Tergantung ekspedisi dan layanan yang dipilih saat checkout — mulai dari Same Day (Bandung) sampai Reguler 2–3 hari ke luar kota.' },
  { q: 'Apakah bisa retur atau refund?', a: 'Bisa. Jika ada kendala pada pesanan, hubungi CS kami dan status refund akan diperbarui pada pesananmu.' },
]

const TRUST = [
  { icon: ShieldIcon, title: 'Pembayaran aman', sub: 'Diproses lewat Midtrans' },
  { icon: BoxIcon, title: 'Dikemas rapi', sub: 'Aman sampai tujuan' },
  { icon: TruckIcon, title: 'Kirim 1–3 hari', sub: 'Ekspedisi pilihanmu' },
  { icon: ChatIcon, title: 'CS siap bantu', sub: 'Sebelum & sesudah beli' },
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
          className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 px-6 py-16 lg:min-h-[600px] lg:py-24"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 10%, rgba(254,201,1,0.14), transparent 45%), radial-gradient(circle at 15% 90%, rgba(254,201,1,0.08), transparent 40%)',
          }}
        >
          {/* Discount seal */}
          <div className="absolute right-6 top-6 hidden lg:block">
            <StarburstBadge />
          </div>

          <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-pill border border-neutral-0/20 bg-neutral-0/10 px-3 py-1.5 text-sm text-neutral-0 backdrop-blur">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary-600" />
              Sparepart original, siap kirim hari ini
            </span>
            <h1 className="text-4xl font-medium leading-[1.05] tracking-tight text-neutral-0 lg:text-6xl">
              Sparepart terbaik untuk <span className="text-secondary-600">motor kesayanganmu</span>
            </h1>
            <p className="max-w-xl text-base text-neutral-200 lg:text-lg">
              Dari mesin, kelistrikan, sampai body & aksesoris — semua kebutuhan sparepart motormu,
              original dengan garansi keaslian dan pengiriman cepat.
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
      <Marquee />

      {/* Intent cards */}
      <section className="px-4 py-16 lg:px-16 lg:py-24">
        <h2 className="mb-10 text-center text-3xl font-medium tracking-tight text-neutral-900 lg:text-5xl">
          Satu kebutuhan. Satu motor. Satu part.
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {INTENTS.map((it) => (
            <div key={it.title} className="flex flex-col gap-4 rounded-2xl bg-neutral-900 p-8 text-left">
              <h3 className="text-2xl font-medium text-neutral-0">{it.title}</h3>
              <p className="flex-1 text-sm text-neutral-300">{it.desc}</p>
              <Link to={it.href} className="w-fit">
                <Button variant="accent" size="sm">{it.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section className="px-4 pb-16 lg:px-16 lg:pb-24">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link to="/search">
            <Button variant="primary" size="lg">Lihat Semua Produk</Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-900 px-4 py-16 lg:px-16 lg:py-24">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-600">
            Cara Belanja
          </span>
          <h2 className="max-w-2xl text-3xl font-medium tracking-tight text-neutral-0 lg:text-5xl">
            Dari cari part sampai sampai depan pintu, dalam 4 langkah
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3">
              <span className="text-2xl font-semibold text-secondary-600">{s.n}</span>
              <span className="h-px w-full bg-neutral-0/15" />
              <h3 className="text-lg font-medium text-neutral-0">{s.title}</h3>
              <p className="text-sm text-neutral-400">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link to="/search">
            <Button variant="accent" size="lg">Mulai Belanja</Button>
          </Link>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-secondary-600 px-4 py-16 text-center lg:px-16 lg:py-20">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900/70">
          Motormu, prioritas kami
        </span>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-medium tracking-tight text-neutral-900 lg:text-5xl">
          Siap bikin motormu prima lagi?
        </h2>
        <p className="mt-4 text-neutral-900/80">
          Original • Gratis ongkir 300rb+ • Kirim se-Indonesia • Bandung
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/search">
            <Button variant="primary" size="lg">Belanja Sekarang</Button>
          </Link>
        </div>
      </section>

      {/* Why */}
      <section className="px-4 py-16 lg:px-16 lg:py-24">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <h2 className="max-w-2xl text-3xl font-medium tracking-tight text-neutral-900 lg:text-5xl">
            Kenapa belanja di DMB?
          </h2>
          <p className="max-w-md text-neutral-600">
            Karena mengurus motor harusnya gampang, jujur, dan cepat.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.n} className="flex flex-col gap-3 border-t-2 border-secondary-600 pt-5">
              <span className="text-sm font-semibold text-secondary-800">{w.n}</span>
              <h3 className="text-xl font-medium text-neutral-900">{w.title}</h3>
              <p className="text-sm text-neutral-600">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-16 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
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
      <section className="border-t border-neutral-100 px-4 py-12 lg:px-16">
        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
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
