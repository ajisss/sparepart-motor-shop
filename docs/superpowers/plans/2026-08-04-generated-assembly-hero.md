# Generated Assembly Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current homepage hero with the approved near-full-viewport generated naked-bike assembly composition, including five technical sparepart modules, connector drawing, a one-time entrance, restrained ambient motion, and a three-module mobile layout.

**Architecture:** Extract the hero from `HomePage.jsx` into one self-contained `HeroAssemblySection.jsx`. The component owns a private five-item parts definition, the generated PNG, inline SVG connectors/modules, and a single image-readiness state. Namespaced CSS in `src/index.css` provides the reveal, ambient state, responsive geometry, and reduced-motion fallback without adding an animation dependency.

**Tech Stack:** React 19, React Router 7, Tailwind CSS 3, namespaced CSS keyframes, inline SVG, Node's built-in test runner, Node standard-library PNG inspection.

## Global Constraints

- Preserve the current uncommitted **Cara Belanja / Clean Engineering** work in `src/components/home/HowItWorksSection.jsx`, `src/index.css`, `src/pages/HomePage.jsx`, and its tests.
- Use the already approved generated source at `tmp/imagegen/naked-street-bike-transparent.png`; do not regenerate or stylistically alter the motorcycle.
- Keep hero copy and CTA destinations exactly as approved: `/search` and `/lacak`.
- Keep the motorcycle as the only raster visual. Spareparts, connectors, markers, and labels remain inline SVG/HTML.
- Do not add Framer Motion, GSAP, canvas, WebGL, or a reusable animation configuration layer.
- Do not commit `tmp/`; only copy the approved final PNG into `public/hero/`.
- Run each task's focused check before its commit. Run the full test, lint, build, and browser matrix before claiming completion.

---

### Task 1: Promote and verify the approved motorcycle asset

**Files:**
- Create: `public/hero/generated-naked-street-bike.png`
- Create: `tests/hero-assembly.test.js`
- Source only: `tmp/imagegen/naked-street-bike-transparent.png`

- [ ] **Step 1: Add a failing asset contract test**

Create `tests/hero-assembly.test.js` with the asset-path and PNG-header contract first:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const assetPath = `${projectRoot}public/hero/generated-naked-street-bike.png`

test('approved hero motorcycle is a 1672x941 RGBA PNG', () => {
  assert.equal(existsSync(assetPath), true, 'generated hero motorcycle is missing')

  const png = readFileSync(assetPath)
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(png.toString('ascii', 12, 16), 'IHDR')
  assert.equal(png.readUInt32BE(16), 1672)
  assert.equal(png.readUInt32BE(20), 941)
  assert.equal(png[25], 6, 'PNG must use RGBA color type 6')
})
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --test tests/hero-assembly.test.js
```

Expected: FAIL with `generated hero motorcycle is missing`.

- [ ] **Step 3: Copy the approved transparent asset into its production path**

Run:

```bash
mkdir -p public/hero
cp tmp/imagegen/naked-street-bike-transparent.png public/hero/generated-naked-street-bike.png
```

- [ ] **Step 4: Add pixel-level alpha and chroma validation using only Node standard libraries**

Extend `tests/hero-assembly.test.js` with this decoder and validation test:

```js
import { inflateSync } from 'node:zlib'

function decodeRgbaPng(png) {
  const width = png.readUInt32BE(16)
  const height = png.readUInt32BE(20)
  const idat = []
  let offset = 8

  while (offset < png.length) {
    const length = png.readUInt32BE(offset)
    const type = png.toString('ascii', offset + 4, offset + 8)
    if (type === 'IDAT') idat.push(png.subarray(offset + 8, offset + 8 + length))
    offset += length + 12
    if (type === 'IEND') break
  }

  const packed = inflateSync(Buffer.concat(idat))
  const stride = width * 4
  const pixels = Buffer.alloc(stride * height)

  for (let y = 0; y < height; y += 1) {
    const filter = packed[y * (stride + 1)]
    const rowStart = y * (stride + 1) + 1
    const outStart = y * stride

    for (let x = 0; x < stride; x += 1) {
      const raw = packed[rowStart + x]
      const left = x >= 4 ? pixels[outStart + x - 4] : 0
      const up = y > 0 ? pixels[outStart - stride + x] : 0
      const upLeft = y > 0 && x >= 4 ? pixels[outStart - stride + x - 4] : 0
      let value = raw

      if (filter === 1) value += left
      if (filter === 2) value += up
      if (filter === 3) value += Math.floor((left + up) / 2)
      if (filter === 4) {
        const prediction = left + up - upLeft
        const pa = Math.abs(prediction - left)
        const pb = Math.abs(prediction - up)
        const pc = Math.abs(prediction - upLeft)
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft
      }

      assert.ok(filter >= 0 && filter <= 4, `unsupported PNG filter ${filter}`)
      pixels[outStart + x] = value & 255
    }
  }

  return { width, height, pixels }
}

test('hero motorcycle has transparent corners and no visible chroma-green residue', () => {
  const { width, height, pixels } = decodeRgbaPng(readFileSync(assetPath))
  const alphaAt = (x, y) => pixels[(y * width + x) * 4 + 3]

  assert.deepEqual(
    [alphaAt(0, 0), alphaAt(width - 1, 0), alphaAt(0, height - 1), alphaAt(width - 1, height - 1)],
    [0, 0, 0, 0],
  )

  let visible = 0
  let greenResidue = 0
  for (let index = 0; index < pixels.length; index += 4) {
    const [red, green, blue, alpha] = pixels.subarray(index, index + 4)
    if (alpha <= 12) continue
    visible += 1
    if (green > 145 && green > red * 1.35 && green > blue * 1.2) greenResidue += 1
  }

  const coverage = visible / (width * height)
  assert.ok(coverage > 0.37 && coverage < 0.43, `unexpected subject coverage ${coverage}`)
  assert.equal(greenResidue, 0)
})
```

- [ ] **Step 5: Run the focused test and confirm GREEN**

Run:

```bash
node --test tests/hero-assembly.test.js
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit the production asset and test**

```bash
git add public/hero/generated-naked-street-bike.png tests/hero-assembly.test.js
git commit -m "test: validate generated assembly hero asset"
```

---

### Task 2: Build the semantic hero component and integrate it

**Files:**
- Create: `src/components/home/HeroAssemblySection.jsx`
- Modify: `src/pages/HomePage.jsx:1-140`
- Modify: `src/pages/HomePage.jsx:305-317`
- Modify: `tests/hero-assembly.test.js`

- [ ] **Step 1: Add failing source-contract tests for composition, responsive membership, routes, and accessibility**

Append to `tests/hero-assembly.test.js`:

```js
const componentPath = `${projectRoot}src/components/home/HeroAssemblySection.jsx`

test('hero defines five assembly modules and three phone-safe modules', () => {
  assert.equal(existsSync(componentPath), true, 'HeroAssemblySection component is missing')
  const source = readFileSync(componentPath, 'utf8')
  const partsBlock = source.match(/const PARTS = \[([\s\S]*?)\n\]/)?.[1] ?? ''
  const definitions = partsBlock.match(/key: '(battery|ignition|headlamp|brake|exhaust)'/g) ?? []
  const phoneSafe = partsBlock.match(/phone: true/g) ?? []

  assert.equal(definitions.length, 5)
  assert.equal(new Set(definitions).size, 5)
  assert.equal(phoneSafe.length, 3)
})

test('hero preserves CTA routes and accessible image/decorative layers', () => {
  const source = readFileSync(componentPath, 'utf8')

  assert.match(source, /to="\/search"/)
  assert.match(source, /to="\/lacak"/)
  assert.match(source, /alt="Ilustrasi motor naked dengan sparepart DMB"/)
  assert.match(source, /width="1672"/)
  assert.match(source, /height="941"/)
  assert.match(source, /fetchPriority="high"/)
  assert.ok((source.match(/aria-hidden="true"/g) ?? []).length >= 2)
})

test('homepage renders the extracted hero and removes the savings starburst', () => {
  const homepage = readFileSync(`${projectRoot}src/pages/HomePage.jsx`, 'utf8')

  assert.match(homepage, /<HeroAssemblySection\s*\/>/)
  assert.doesNotMatch(homepage, /StarburstBadge/)
})
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --test tests/hero-assembly.test.js
```

Expected: FAIL because `HeroAssemblySection.jsx` does not exist and the homepage still renders the inline hero.

- [ ] **Step 3: Create the complete hero component**

Create `src/components/home/HeroAssemblySection.jsx`:

```jsx
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
```

- [ ] **Step 4: Replace the inline homepage hero**

In `src/pages/HomePage.jsx`:

1. Add `import HeroAssemblySection from '../components/home/HeroAssemblySection'` beside the existing home-section import.
2. Replace the complete current `{/* Hero */}` section with `<HeroAssemblySection />`.
3. Delete the complete `StarburstBadge` function near the bottom of the file.
4. Keep the existing `Link` and `Button` imports because later homepage sections still use both.

- [ ] **Step 5: Run the focused test and confirm GREEN**

Run:

```bash
node --test tests/hero-assembly.test.js
```

Expected: all hero tests pass.

- [ ] **Step 6: Commit the semantic component and integration**

```bash
git add src/components/home/HeroAssemblySection.jsx src/pages/HomePage.jsx tests/hero-assembly.test.js
git commit -m "feat: add generated assembly hero structure"
```

---

### Task 3: Add the approved reveal, ambient motion, and responsive geometry

**Files:**
- Modify: `src/index.css`
- Modify: `tests/hero-assembly.test.js`

- [ ] **Step 1: Add a failing CSS contract test**

Append to `tests/hero-assembly.test.js`:

```js
test('hero styles include approved timing, phone pruning, and reduced-motion completion', () => {
  const styles = readFileSync(`${projectRoot}src/index.css`, 'utf8')

  assert.match(styles, /\.assembly-hero__surface\s*\{[^}]*min-height:\s*760px/s)
  assert.match(styles, /min-height:\s*max\(680px,\s*calc\(100svh - 128px\)\)/)
  assert.match(styles, /\.assembly-hero__desktop-only\s*\{[^}]*display:\s*none/s)
  assert.match(styles, /assembly-copy-in\s+600ms/)
  assert.match(styles, /assembly-bike-reveal\s+900ms/)
  assert.match(styles, /assembly-part-in\s+520ms/)
  assert.match(styles, /assembly-line-draw\s+620ms/)
  assert.match(styles, /assembly-signal-flow\s+8s/)
  assert.match(styles, /\.assembly-hero__endpoint\.is-ambient/)
  assert.match(styles, /prefers-reduced-motion:\s*reduce/)
  assert.match(styles, /\.assembly-hero__surface\.is-fallback/)
})
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --test tests/hero-assembly.test.js
```

Expected: FAIL because the namespaced hero CSS does not exist yet.

- [ ] **Step 3: Append the complete namespaced hero styles without disturbing blueprint styles**

Append this block after the existing blueprint keyframes in `src/index.css`:

```css
@layer components {
  .assembly-hero__surface {
    position: relative;
    min-height: 760px;
    overflow: hidden;
    border-radius: 1rem;
    background:
      radial-gradient(circle at 76% 14%, rgb(254 201 1 / 0.13), transparent 34%),
      radial-gradient(circle at 14% 88%, rgb(254 201 1 / 0.07), transparent 38%),
      #171717;
    isolation: isolate;
  }

  .assembly-hero__surface::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image:
      linear-gradient(rgb(255 255 255 / 0.028) 1px, transparent 1px),
      linear-gradient(90deg, rgb(255 255 255 / 0.028) 1px, transparent 1px);
    background-size: 42px 42px;
    content: '';
    mask-image: linear-gradient(to bottom, transparent 8%, black 56%, transparent 100%);
  }

  .assembly-hero__copy {
    position: relative;
    z-index: 20;
    display: flex;
    max-width: 48rem;
    margin-inline: auto;
    padding: 3rem 1.5rem 0;
    flex-direction: column;
    align-items: center;
    gap: 1.15rem;
    text-align: center;
  }

  .assembly-hero__stage {
    position: absolute;
    inset: auto 0 0;
    height: 430px;
  }

  .assembly-hero__bike-wrap {
    position: absolute;
    z-index: 5;
    bottom: 13px;
    left: 50%;
    width: 116%;
    aspect-ratio: 1672 / 941;
    transform: translateX(-50%);
  }

  .assembly-hero__bike {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .assembly-hero__connectors {
    position: absolute;
    z-index: 8;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  .assembly-hero__connector-base,
  .assembly-hero__connector-signal {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .assembly-hero__connector-base {
    stroke: rgb(228 228 231 / 0.28);
    stroke-width: 1.25;
  }

  .assembly-hero__connector-signal {
    stroke: #fec901;
    stroke-dasharray: 0.035 0.965;
    stroke-width: 2;
  }

  .assembly-hero__endpoint {
    fill: #fec901;
    filter: drop-shadow(0 0 7px rgb(254 201 1 / 0.5));
    transform-box: fill-box;
    transform-origin: center;
  }

  .assembly-part {
    position: absolute;
    z-index: 12;
    width: 106px;
    padding: 0.55rem 0.65rem 0.6rem;
    border: 1px solid rgb(255 255 255 / 0.14);
    border-radius: 0.75rem;
    background: rgb(23 23 23 / 0.82);
    box-shadow: 0 12px 36px rgb(0 0 0 / 0.24);
    backdrop-filter: blur(9px);
  }

  .assembly-part__meta {
    display: flex;
    justify-content: space-between;
    color: rgb(161 161 170 / 0.78);
    font-size: 6px;
    font-weight: 650;
    letter-spacing: 0.12em;
  }

  .assembly-part svg {
    width: 100%;
    height: 50px;
    margin-top: 0.25rem;
    fill: none;
    stroke: rgb(244 244 245 / 0.82);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.4;
  }

  .assembly-part--battery { top: 54px; left: 4%; }
  .assembly-part--headlamp { top: 67px; right: 4%; }
  .assembly-part--brake { bottom: 24px; left: 3%; }
  .assembly-part--ignition,
  .assembly-part--exhaust { display: none; }
  .assembly-hero__desktop-only { display: none; }
}

@media (min-width: 640px) {
  .assembly-hero__surface { min-height: 720px; }
  .assembly-hero__copy { padding-top: 3.5rem; }
  .assembly-hero__stage { height: 430px; }
  .assembly-hero__bike-wrap { bottom: -28px; width: 90%; }
  .assembly-hero__desktop-only { display: block; }
  .assembly-part--battery { top: 70px; left: 6%; }
  .assembly-part--ignition { top: 18px; left: 29%; }
  .assembly-part--headlamp { top: 58px; right: 7%; }
  .assembly-part--brake { bottom: 32px; left: 7%; }
  .assembly-part--exhaust { right: 6%; bottom: 32px; }
}

@media (min-width: 1024px) {
  .assembly-hero__surface { min-height: max(680px, calc(100svh - 128px)); }
  .assembly-hero__copy { padding-top: clamp(3.5rem, 7vh, 5.5rem); }
  .assembly-hero__stage { height: clamp(400px, 48vh, 520px); }
  .assembly-hero__bike-wrap { bottom: -48px; width: 72%; }
  .assembly-part { width: 118px; }
  .assembly-part--battery { top: 20%; left: 7%; }
  .assembly-part--ignition { top: 7%; left: 30%; }
  .assembly-part--headlamp { top: 18%; right: 7%; }
  .assembly-part--brake { bottom: 13%; left: 8%; }
  .assembly-part--exhaust { right: 8%; bottom: 13%; }
}

@media (prefers-reduced-motion: no-preference) {
  .assembly-hero__surface:not(.is-ready) .assembly-hero__copy,
  .assembly-hero__surface:not(.is-ready) .assembly-part,
  .assembly-hero__surface:not(.is-ready) .assembly-hero__endpoint { opacity: 0; }

  .assembly-hero__surface:not(.is-ready) .assembly-hero__bike-wrap { clip-path: inset(0 100% 0 0); }

  .assembly-hero__surface:not(.is-ready) .assembly-hero__connector-base,
  .assembly-hero__surface:not(.is-ready) .assembly-hero__connector-signal {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }

  .assembly-hero__surface:not(.is-ready) .assembly-hero__connector-signal { opacity: 0; }

  .assembly-hero__surface.is-ready .assembly-hero__copy {
    animation: assembly-copy-in 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .assembly-hero__surface.is-ready .assembly-hero__bike-wrap {
    animation: assembly-bike-reveal 900ms cubic-bezier(0.16, 1, 0.3, 1) 240ms both;
  }

  .assembly-hero__surface.is-ready .assembly-part {
    animation:
      assembly-part-in 520ms cubic-bezier(0.16, 1, 0.3, 1) var(--assembly-part-delay) both,
      assembly-part-drift 5.6s ease-in-out var(--assembly-drift-delay) infinite alternate;
  }

  .assembly-hero__surface.is-ready .assembly-hero__connector-base {
    animation: assembly-line-draw 620ms cubic-bezier(0.16, 1, 0.3, 1) var(--assembly-line-delay) both;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }

  .assembly-hero__surface.is-ready .assembly-hero__connector-signal {
    animation:
      assembly-signal-in 620ms cubic-bezier(0.16, 1, 0.3, 1) var(--assembly-line-delay) both,
      assembly-signal-flow 8s linear 2400ms infinite;
  }

  .assembly-hero__surface.is-ready .assembly-hero__endpoint {
    animation: assembly-marker-in 260ms cubic-bezier(0.16, 1, 0.3, 1) var(--assembly-marker-delay) both;
  }

  .assembly-hero__surface.is-ready .assembly-hero__endpoint.is-ambient {
    animation: assembly-marker-in 260ms cubic-bezier(0.16, 1, 0.3, 1) 1560ms both, assembly-marker-breathe 3.2s ease-in-out 3s infinite;
  }

  .assembly-hero__surface.is-fallback .assembly-hero__copy,
  .assembly-hero__surface.is-fallback .assembly-part,
  .assembly-hero__surface.is-fallback .assembly-hero__endpoint {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .assembly-hero__surface.is-fallback .assembly-hero__connector-base,
  .assembly-hero__surface.is-fallback .assembly-hero__connector-signal {
    animation: none;
    opacity: 1;
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .assembly-hero__copy,
  .assembly-hero__bike-wrap,
  .assembly-part,
  .assembly-hero__connector-base,
  .assembly-hero__connector-signal,
  .assembly-hero__endpoint {
    animation: none !important;
    clip-path: none !important;
    opacity: 1 !important;
    stroke-dashoffset: 0 !important;
    transform: none;
  }
}

@keyframes assembly-copy-in {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes assembly-bike-reveal {
  from { clip-path: inset(0 100% 0 0); filter: brightness(1.35) contrast(1.08); }
  to { clip-path: inset(0); filter: brightness(1) contrast(1); }
}

@keyframes assembly-part-in {
  from { opacity: 0; transform: translateY(10px) scale(0.88); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes assembly-line-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes assembly-signal-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes assembly-marker-in {
  0% { opacity: 0; transform: scale(0.7); }
  70% { opacity: 1; transform: scale(1.45); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes assembly-part-drift {
  from { translate: 0 -1px; }
  to { translate: 0 2px; }
}

@keyframes assembly-signal-flow {
  to { stroke-dashoffset: -1; }
}

@keyframes assembly-marker-breathe {
  0%, 78%, 100% { transform: scale(1); opacity: 1; }
  88% { transform: scale(1.35); opacity: 0.72; }
}
```

- [ ] **Step 4: Run focused tests and inspect generated CSS output**

Run:

```bash
node --test tests/hero-assembly.test.js
npm run build
```

Expected: hero tests pass and Vite build succeeds. Inspect the built CSS to confirm the four inline delay custom properties remain intact; do not add a dependency.

- [ ] **Step 5: Commit motion and responsive behavior**

```bash
git add src/index.css tests/hero-assembly.test.js
git commit -m "feat: animate generated assembly hero"
```

---

### Task 4: Browser QA, failure audit, and full verification

**Files:**
- Modify if required by QA: `src/components/home/HeroAssemblySection.jsx`
- Modify if required by QA: `src/index.css`
- Modify if required by QA: `tests/hero-assembly.test.js`

- [ ] **Step 1: Run the app and inspect the entrance at desktop width**

Run the existing local dev server or start:

```bash
npm run dev
```

At `1440px` wide, reload once and verify:

- headline/eyebrow/CTAs remain the first content read;
- bike is fully visible, level, and centered in the lower composition;
- all five modules are present and no connector crosses copy or buttons;
- starburst is gone;
- copy resolves first, then bike, modules, connectors, and endpoints;
- the entrance does not replay after scrolling away and back;
- bike stays fixed after reveal;
- module drift stays within 3px and no more than one endpoint feels active at once.

- [ ] **Step 2: Inspect tablet and phone geometry**

At `768px`, verify all five modules remain legible without overlapping the bike or copy.

At `390px`, verify:

- hero clips the 116%-wide bike within its rounded surface, not the page;
- only battery, headlamp, and brake modules/connectors remain;
- both CTAs stack and stay easy to tap;
- no horizontal page scroll appears;
- the next marquee begins below the completed hero.

- [ ] **Step 3: Inspect reduced motion and image failure**

Emulate `prefers-reduced-motion: reduce` and reload. Verify copy, motorcycle, all breakpoint-appropriate modules, connectors, and endpoints appear immediately with no drift, reveal, dash travel, or pulse.

Temporarily change the image URL in browser devtools to a missing file. Verify the fixed stage height remains, copy/CTAs/modules/connectors remain visible, and there is no repeated animation loop or collapsed layout. Revert the devtools-only change.

- [ ] **Step 4: Run full project verification**

Run:

```bash
npm test
npm run lint
npm run build
git status --short
```

Expected:

- all tests pass, including the existing product and Clean Engineering tests;
- lint exits successfully; report any pre-existing warnings separately instead of hiding them;
- production build succeeds;
- `tmp/` remains untracked and is not included in any commit;
- only deliberate hero fixes from QA remain unstaged.

- [ ] **Step 5: Commit any QA corrections**

If QA required source changes:

```bash
git add src/components/home/HeroAssemblySection.jsx src/index.css tests/hero-assembly.test.js
git commit -m "fix: polish assembly hero responsiveness"
```

If QA required no source changes, skip this commit.

- [ ] **Step 6: Final diff audit**

Run:

```bash
git diff HEAD~3 -- src/components/home/HeroAssemblySection.jsx src/pages/HomePage.jsx src/index.css tests/hero-assembly.test.js
git log --oneline -5
```

Confirm the diff changes only the hero and the intentional production asset/test surface, while retaining the already approved Clean Engineering section.
