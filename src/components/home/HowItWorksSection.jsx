import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

const STEPS = [
  { n: '01', variant: 'select', title: 'Pilih sparepart', desc: 'Telusuri katalog per lini produk atau cari langsung part yang kamu butuhkan.' },
  { n: '02', variant: 'payment', title: 'Checkout & bayar', desc: 'Isi alamat, pilih ekspedisi, bayar aman lewat simulasi Midtrans Snap.' },
  { n: '03', variant: 'warehouse', title: 'Kami proses & kirim', desc: 'Pesanan disiapkan langsung dari gudang produsen, resi terbit otomatis.' },
  { n: '04', variant: 'tracking', title: 'Lacak sampai tiba', desc: 'Pantau status pesanan real-time dari halaman Lacak Pesanan atau akunmu.' },
]

export default function HowItWorksSection() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      { threshold: 0.25 },
    )

    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`blueprint-section bg-neutral-900 px-4 py-16 lg:px-16 lg:py-24 ${isVisible ? 'is-visible' : ''}`}
    >
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
          {STEPS.map((step, index) => (
            <article
              key={step.n}
              className="flex flex-col gap-4"
              style={{ '--blueprint-delay': `${index * 120}ms` }}
            >
              <BlueprintStepVisual variant={step.variant} number={step.n} />
              <h3 className="text-lg font-medium text-neutral-0">{step.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-400">{step.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link to="/search">
            <Button variant="accent" size="lg">Mulai Belanja</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function BlueprintStepVisual({ variant, number }) {
  return (
    <div className="blueprint-frame relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-0/10 bg-neutral-0/5">
      <span className="absolute left-3 top-3 z-10 text-sm font-semibold text-secondary-600">{number}</span>
      <span className="absolute right-3 top-3 z-10 text-[8px] font-semibold uppercase tracking-[0.16em] text-neutral-0/25">
        {variantCode(variant)}
      </span>
      <svg
        viewBox="0 0 160 120"
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {illustrationFor(variant)}
      </svg>
      <span aria-hidden="true" className="blueprint-corner blueprint-corner-left" />
      <span aria-hidden="true" className="blueprint-corner blueprint-corner-right" />
    </div>
  )
}

function illustrationFor(variant) {
  switch (variant) {
    case 'select':
      return (
        <>
          <g className="blueprint-stroke" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="72" cy="59" r="27" pathLength="1" />
            <path d="M72 23v9M72 86v10M36 59h9M99 59h11M47 34l7 7M91 78l8 8" pathLength="1" />
          </g>
          <circle className="blueprint-accent" cx="72" cy="59" r="10" pathLength="1" />
          <g className="blueprint-callout">
            <path className="blueprint-callout-line" d="M91 39h46M91 79h34" pathLength="1" />
            <circle className="blueprint-marker" cx="91" cy="39" r="2.2" />
            <circle className="blueprint-marker" cx="91" cy="79" r="2.2" />
            <text x="105" y="35" className="blueprint-callout-label blueprint-callout-label-accent">FITMENT</text>
            <text x="106" y="75" className="blueprint-callout-label">MATCH</text>
          </g>
        </>
      )
    case 'payment':
      return (
        <>
          <g className="blueprint-stroke" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="35" y="36" width="85" height="52" rx="6" pathLength="1" />
            <path d="M35 50h85M47 64h34M47 75h22" pathLength="1" />
          </g>
          <path className="blueprint-accent" d="M95 64h14v12H95zM99 70l3 3 6-7" pathLength="1" />
          <g className="blueprint-callout">
            <path className="blueprint-callout-line" d="M120 43h28M109 76h39" pathLength="1" />
            <circle className="blueprint-marker" cx="120" cy="43" r="2.2" />
            <circle className="blueprint-marker" cx="109" cy="76" r="2.2" />
            <text x="125" y="39" className="blueprint-callout-label blueprint-callout-label-accent">SECURE</text>
            <text x="119" y="72" className="blueprint-callout-label">VERIFIED</text>
          </g>
        </>
      )
    case 'warehouse':
      return (
        <>
          <g className="blueprint-stroke" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 47l37-17 37 17v40l-37 17-37-17zM42 47l37 19 37-19M79 66v38" pathLength="1" />
          </g>
          <path className="blueprint-accent" d="M65 37l38 18v17M99 68l4 4 8-10" pathLength="1" />
          <g className="blueprint-callout">
            <path className="blueprint-callout-line" d="M116 48h32M106 90h40" pathLength="1" />
            <circle className="blueprint-marker" cx="116" cy="48" r="2.2" />
            <circle className="blueprint-marker" cx="106" cy="90" r="2.2" />
            <text x="122" y="44" className="blueprint-callout-label blueprint-callout-label-accent">QC PASS</text>
            <text x="119" y="86" className="blueprint-callout-label">SEALED</text>
          </g>
        </>
      )
    case 'tracking':
      return (
        <>
          <path
            className="blueprint-stroke"
            d="M76 25c-18 0-31 13-31 29 0 23 31 48 31 48s31-25 31-48c0-16-13-29-31-29z"
            pathLength="1"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle className="blueprint-accent" cx="76" cy="54" r="10" pathLength="1" />
          <g className="blueprint-callout">
            <path className="blueprint-callout-line" d="M98 36h49M103 79h34" pathLength="1" />
            <circle className="blueprint-marker" cx="98" cy="36" r="2.2" />
            <circle className="blueprint-marker" cx="103" cy="79" r="2.2" />
            <text x="114" y="32" className="blueprint-callout-label blueprint-callout-label-accent">LIVE</text>
            <text x="114" y="75" className="blueprint-callout-label">ETA</text>
          </g>
        </>
      )
    default:
      return null
  }
}

function variantCode(variant) {
  return {
    select: 'PRT.SEL / 01',
    payment: 'PAY.SEC / 02',
    warehouse: 'WH.QC / 03',
    tracking: 'TRK.LIVE / 04',
  }[variant]
}
