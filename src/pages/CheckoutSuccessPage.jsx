import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

// Abstract, brand-token-only success treatment for the checkout confirmation.
// The Figma reference (`16192:27242` / `16209:35828`) is from a cosmetics
// template and its checkmark/box icons are downloadable raster assets — we
// redraw them as plain SVG built only from this project's tokens instead,
// mirroring the flat treatment already used in AuthHeroPanel and the
// placeholder product SVGs. Copy is rewritten for a spare-parts order instead
// of "your skincare is on its way".
function SuccessCheckIcon() {
  return (
    <div className="relative flex size-20 items-center justify-center lg:size-[140px]">
      <span className="absolute inset-0 rounded-full border border-primary-700/40" />
      <span className="absolute inset-2 rounded-full border border-primary-700/30 lg:inset-4" />
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-800 lg:size-24">
        <svg
          viewBox="0 0 24 24"
          className="size-7 text-primary-200 lg:size-10"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 12.5l5 5L20 6" />
        </svg>
      </span>
    </div>
  )
}

function OrderIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-5 text-primary-900"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 6.5L10 2.5l7.5 4v7L10 17.5l-7.5-4v-7z" />
      <path d="M2.5 6.5L10 10.5l7.5-4" />
      <path d="M10 10.5v7" />
    </svg>
  )
}

export default function CheckoutSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderNumber = location.state?.orderNumber

  // Guard against landing on this route without a real order (e.g. pasting
  // the URL directly). Navigating during render would be a side effect in
  // the render phase, so it's deferred to an effect instead.
  useEffect(() => {
    if (!orderNumber) {
      navigate('/', { replace: true })
    }
  }, [orderNumber, navigate])

  if (!orderNumber) {
    return null
  }

  return (
    <div>
      <Nav />
      <section className="flex justify-center px-4 py-10 lg:px-16 lg:py-20">
        <div className="flex w-full max-w-[504px] flex-col items-center gap-8 rounded-2xl bg-primary-900 p-6 text-center lg:gap-10 lg:p-14">
          <div className="flex flex-col items-center gap-6 lg:gap-8">
            <SuccessCheckIcon />
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-medium tracking-[-0.48px] text-neutral-0 lg:text-[32px] lg:tracking-[-0.64px]">
                Pesanan Berhasil Dibuat
              </h1>
              <p className="max-w-[320px] text-sm leading-relaxed tracking-[-0.28px] text-neutral-200 lg:max-w-[328px] lg:text-base">
                Terima kasih telah berbelanja! Pesanan Anda sedang kami proses dan kabar terbaru akan dikirim lewat email.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-primary-800 bg-neutral-0/5">
            <div className="flex items-center gap-3 border-b border-primary-800 p-4 text-left">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-100 lg:size-12">
                <OrderIcon />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium tracking-[-0.28px] text-neutral-0 lg:text-base">
                  Nomor Pesanan
                </p>
                <p className="font-mono text-sm font-medium tracking-[-0.28px] text-primary-200 lg:text-base">
                  {orderNumber}
                </p>
              </div>
            </div>
            <div className="p-4 text-left text-sm tracking-[-0.28px] text-neutral-200">
              Estimasi tiba dalam 2–4 hari kerja setelah pesanan diproses.
            </div>
          </div>

          <div className="flex w-full flex-col-reverse gap-3 lg:flex-row lg:justify-between">
            <Link to="/" className="lg:w-auto">
              <Button
                variant="secondary"
                className="w-full !border-neutral-0/30 !bg-transparent !text-neutral-0 hover:!bg-neutral-0/10"
              >
                Kembali ke Beranda
              </Button>
            </Link>
            <Link to="/search" className="lg:w-auto">
              <Button variant="primary" className="w-full !bg-neutral-0 !text-primary-900 hover:!bg-neutral-50">
                Belanja Lagi
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
