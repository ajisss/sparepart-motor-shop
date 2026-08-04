import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const assetPath = `${projectRoot}public/hero/generated-naked-street-bike.png`
const componentPath = `${projectRoot}src/components/home/HeroAssemblySection.jsx`

test('approved hero motorcycle is a 1672x941 RGBA PNG', () => {
  assert.equal(existsSync(assetPath), true, 'generated hero motorcycle is missing')

  const png = readFileSync(assetPath)
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(png.toString('ascii', 12, 16), 'IHDR')
  assert.equal(png.readUInt32BE(16), 1672)
  assert.equal(png.readUInt32BE(20), 941)
  assert.equal(png[25], 6, 'PNG must use RGBA color type 6')
})

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
  assert.match(homepage, /className="home-announcement/)
  assert.match(homepage, /<Nav\s+overlay\s*\/>/)
  assert.doesNotMatch(homepage, /StarburstBadge/)
})

test('hero styles include approved timing, phone pruning, and reduced-motion completion', () => {
  const styles = readFileSync(`${projectRoot}src/index.css`, 'utf8')

  assert.match(styles, /\.assembly-hero\s*\{[^}]*margin-top:\s*-72px/s)
  assert.match(styles, /\.assembly-hero__surface\s*\{[^}]*min-height:\s*calc\(100svh - 38px\)/s)
  assert.match(styles, /\.assembly-hero__surface\s*\{[^}]*border-radius:\s*0/s)
  assert.match(styles, /\.assembly-hero__desktop-only\s*\{[^}]*display:\s*none/s)
  assert.match(styles, /assembly-copy-in\s+600ms/)
  assert.match(styles, /assembly-bike-reveal\s+900ms/)
  assert.match(styles, /assembly-part-in\s+520ms/)
  assert.match(styles, /assembly-line-draw\s+620ms/)
  assert.match(styles, /assembly-signal-flow\s+8s/)
  assert.match(styles, /\.assembly-hero__endpoint\.is-ambient/)
  assert.match(styles, /prefers-reduced-motion:\s*reduce/)
  assert.match(styles, /\.assembly-hero__bike-wrap\s*\{\s*transform:\s*translateX\(-50%\);\s*\}/)
  assert.match(styles, /\.assembly-hero__surface\.is-fallback/)
})

test('hero reserves separate grid rows for copy and visual stage', () => {
  const styles = readFileSync(`${projectRoot}src/index.css`, 'utf8')

  assert.match(styles, /\.assembly-hero__surface\s*\{[^}]*display:\s*grid/s)
  assert.match(styles, /\.assembly-hero__surface\s*\{[^}]*grid-template-rows:\s*auto minmax\(260px,\s*1fr\)/s)
  assert.match(styles, /\.assembly-hero__stage\s*\{[^}]*position:\s*relative/s)
  assert.doesNotMatch(styles, /\.assembly-hero__stage\s*\{[^}]*position:\s*absolute/s)
  assert.match(styles, /\.assembly-hero__bike-wrap\s*\{[^}]*height:\s*100%/s)
  assert.match(styles, /\.assembly-part--battery\s*\{\s*top:\s*62px;/)
  assert.match(styles, /\.assembly-part--ignition\s*\{\s*top:\s*80px;/)
})

test('desktop hero overlays its nav without reintroducing page gutters', () => {
  const component = readFileSync(componentPath, 'utf8')
  const styles = readFileSync(`${projectRoot}src/index.css`, 'utf8')
  const nav = readFileSync(`${projectRoot}src/components/layout/Nav.jsx`, 'utf8')

  assert.match(component, /<section className="assembly-hero">/)
  assert.doesNotMatch(component, /assembly-hero px-4/)
  assert.doesNotMatch(component, /max-w-7xl/)
  assert.match(styles, /@media \(min-width:\s*1024px\)[\s\S]*\.assembly-hero\s*\{\s*margin-top:\s*-80px;/)
  assert.match(nav, /export default function Nav\(\{ overlay = false \}\)/)
  assert.match(nav, /overlay && !scrolled/)
})

test('short desktop viewport compacts copy so the full assembly stays on screen', () => {
  const styles = readFileSync(`${projectRoot}src/index.css`, 'utf8')

  assert.match(styles, /@media \(min-width:\s*1024px\) and \(max-height:\s*800px\)/)
  assert.match(styles, /max-height:\s*800px[\s\S]*\.assembly-hero__surface\s*\{[^}]*height:\s*calc\(100svh - 38px\)/s)
  assert.match(styles, /max-height:\s*800px[\s\S]*\.assembly-hero__stage\s*\{[^}]*min-height:\s*0/s)
  assert.match(styles, /max-height:\s*800px[\s\S]*\.assembly-hero__copy h1\s*\{[^}]*font-size:\s*3\.25rem/s)
})

test('desktop callout cards orbit close to the motorcycle and connector starts', () => {
  const component = readFileSync(componentPath, 'utf8')
  const styles = readFileSync(`${projectRoot}src/index.css`, 'utf8')

  assert.match(styles, /\.assembly-part--battery\s*\{[^}]*left:\s*calc\(50% - min\(34vw,\s*560px\)\)/s)
  assert.match(styles, /\.assembly-part--headlamp\s*\{[^}]*right:\s*calc\(50% - min\(34vw,\s*560px\)\)/s)
  assert.match(styles, /\.assembly-part--brake\s*\{[^}]*left:\s*calc\(50% - min\(33vw,\s*540px\)\)/s)
  assert.match(styles, /\.assembly-part--exhaust\s*\{[^}]*right:\s*calc\(50% - min\(33vw,\s*540px\)\)/s)
  assert.match(component, /path: 'M290 108 C350 118 385 238 445 264'/)
  assert.match(component, /path: 'M710 338 C665 351 625 332 564 306'/)
})
