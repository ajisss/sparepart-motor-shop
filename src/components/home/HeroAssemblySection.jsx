import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

const PARTS = [
  { key: 'battery', label: 'BATTERY', code: 'ELC.01', phone: true, className: 'assembly-part--battery', path: 'M5 10h30v22H5zM11 6v4m18-4v4M10 16h8m-4-4v8m9-4h8' },
  { key: 'ignition', label: 'IGNITION', code: 'IGN.02', phone: false, className: 'assembly-part--ignition', path: 'M17 4h10v8l5 7-8 17H12l6-16-6-6zM17 12h10M14 27h14' },
  { key: 'headlamp', label: 'HEADLAMP', code: 'LGT.03', phone: true, className: 'assembly-part--headlamp', path: 'M8 12c8-8 19-8 27 0v16c-8 8-19 8-27 0zM35 15l7-4m-7 10h8m-8 6l7 4' },
  { key: 'brake', label: 'BRAKE', code: 'BRK.04', phone: true, className: 'assembly-part--brake', path: 'M22 5a17 17 0 1 0 0 34 17 17 0 0 0 0-34zm0 7a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm11-4 7 5-4 9-7-4z' },
  { key: 'exhaust', label: 'EXHAUST', code: 'EXH.05', phone: false, className: 'assembly-part--exhaust', path: 'M5 12h23l10 7-10 7H5l7-7zM28 12v14M8 16h20' },
]

const CONNECTORS = [
  { key: 'battery', path: 'M190 108 C305 118 330 238 445 264', target: [445, 264], phone: true },
  { key: 'ignition', path: 'M390 76 C440 130 448 212 493 275', target: [493, 275], phone: false },
  { key: 'headlamp', path: 'M812 108 C765 132 751 192 722 229', target: [722, 229], phone: true },
  { key: 'brake', path: 'M170 334 C254 344 292 339 351 317', target: [351, 317], phone: true },
  { key: 'exhaust', path: 'M828 338 C733 351 645 332 564 306', target: [564, 306], phone: false },
]

export default function HeroAssemblySection() {
  const [mounted, setMounted] = useState(false)
  const [imageState, setImageState] = useState('loading')

  useEffect(() => setMounted(true), [])

  const ready = mounted && imageState !== 'loading'
  const stateClass = `${ready ? 'is-ready' : ''} ${imageState === 'error' ? 'is-fallback' : ''}`

  return (
    <section className="assembly-hero px-4 pt-6 lg:px-16 lg:pt-8">
      <div className={`assembly-hero__surface mx-auto max-w-7xl ${stateClass}`}>
        <div className="assembly-hero__copy">
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
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/search">
              <Button variant="accent" size="lg" className="w-full sm:w-auto">Belanja Sekarang</Button>
            </Link>
            <Link to="/lacak">
              <Button variant="secondary" size="lg" className="w-full !border-neutral-0/40 !bg-transparent !text-neutral-0 hover:!bg-neutral-0/10 sm:w-auto">
                Lacak Pesanan
              </Button>
            </Link>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Didukung Midtrans &amp; Biteship</p>
        </div>

        <div className="assembly-hero__stage">
          <div className="assembly-hero__bike-wrap">
            {imageState !== 'error' && (
              <img
                src="/hero/generated-naked-street-bike.png"
                alt="Ilustrasi motor naked dengan sparepart DMB"
                width="1672"
                height="941"
                decoding="async"
                fetchPriority="high"
                className="assembly-hero__bike"
                onLoad={() => setImageState('loaded')}
                onError={() => setImageState('error')}
              />
            )}
          </div>

          <svg className="assembly-hero__connectors" viewBox="0 0 1000 420" aria-hidden="true" focusable="false">
            {CONNECTORS.map((connector, index) => (
              <g
                key={connector.key}
                className={connector.phone ? '' : 'assembly-hero__desktop-only'}
                style={{
                  '--assembly-line-delay': `${1180 + index * 130}ms`,
                  '--assembly-marker-delay': `${1560 + index * 130}ms`,
                }}
              >
                <path className="assembly-hero__connector-base" d={connector.path} pathLength="1" />
                <path className="assembly-hero__connector-signal" d={connector.path} pathLength="1" />
                <circle
                  className={`assembly-hero__endpoint ${index === 0 ? 'is-ambient' : ''}`}
                  cx={connector.target[0]}
                  cy={connector.target[1]}
                  r="4"
                />
              </g>
            ))}
          </svg>

          {PARTS.map((part, index) => (
            <AssemblyPart key={part.key} part={part} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function AssemblyPart({ part, index }) {
  return (
    <div
      className={`assembly-part ${part.className} ${part.phone ? '' : 'assembly-hero__desktop-only'}`}
      style={{
        '--assembly-part-delay': `${720 + index * 110}ms`,
        '--assembly-drift-delay': `${2400 + index * 410}ms`,
      }}
      aria-hidden="true"
    >
      <div className="assembly-part__meta"><span>{part.code}</span><span>{part.label}</span></div>
      <svg viewBox="0 0 48 44" focusable="false">
        <path d={part.path} pathLength="1" />
      </svg>
    </div>
  )
}
