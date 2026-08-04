# Context Banners and Product Imagery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add premium contextual banners to tracking, account, and order-detail pages, then replace all 15 generic product illustrations with unique transparent Studio Photoreal sparepart images generated through GPT Image 2.

**Architecture:** Keep the work frontend-only. A small `SECTION_BANNERS` data module supplies page copy to one shared `SectionBanner` component, while the existing product seed continues to own stable public asset paths. Product imagery is generated on a flat chroma-key background, converted to alpha PNGs locally, and consumed by the existing `images` field.

**Tech Stack:** React 19, React Router 7, Tailwind CSS 3, Vite 8, Node built-in test runner, GPT Image 2 built-in image generation, local chroma-key removal helper.

## Global Constraints

- Preserve the existing black `#0A0A0A`, yellow `#FEC901`, white, and neutral brand palette.
- Generate exactly 15 unique primary product images, one per seeded product.
- Product imagery style is Studio Photoreal with a complete centered object, soft studio lighting, and transparent final background.
- Use the built-in GPT Image 2 path with chroma-key removal; do not switch models for native transparency.
- Add banners only to `/lacak`, `/akun`, and `/pesanan/:id`.
- Do not add dependencies or change order, authentication, cart, checkout, payment, shipping, or tracking authorization behavior.
- Keep one generated gallery angle per product.

---

## File Map

- Create `tests/product-assets.test.js` — asserts the 15 unique product asset mappings, seed version, and final PNG existence.
- Create `tests/section-banners.test.js` — asserts the three approved banner configurations and image mappings.
- Create `src/data/sectionBanners.js` — page-specific banner copy and selected product cutout paths.
- Create `src/components/ui/SectionBanner.jsx` — shared responsive Performance Object banner markup.
- Create `public/products/generated/*.png` — 15 final transparent product assets.
- Modify `package.json` — add the Node built-in `test` script.
- Modify `src/data/products.js` — point each product to its unique generated PNG.
- Modify `src/store/seed.js` — increment the seed version from `2` to `3`.
- Modify `src/components/ui/ProductCard.jsx` — present transparent cutouts with `object-contain`, padding, and restrained yellow halo.
- Modify `src/pages/TrackOrderPage.jsx` — add tracking banner and preserve the tracking form.
- Modify `src/pages/AccountPage.jsx` — add rider-profile banner and preserve account tabs/content.
- Modify `src/pages/OrderDetailPage.jsx` — add order-dossier banner and preserve authorization/order content.

---

### Task 1: Generate and Wire the 15 Product Assets

**Files:**
- Create: `tests/product-assets.test.js`
- Create: `public/products/generated/kampas-rem-depan-nhk.png`
- Create: `public/products/generated/aki-kering-gs-astra.png`
- Create: `public/products/generated/spion-custom-cnc.png`
- Create: `public/products/generated/oli-mesin-shell-advance-10w40.png`
- Create: `public/products/generated/ban-tubeless-irc-90-80-14.png`
- Create: `public/products/generated/busi-iridium-ngk.png`
- Create: `public/products/generated/lampu-led-headlamp-h4.png`
- Create: `public/products/generated/cover-body-set-racing.png`
- Create: `public/products/generated/oli-gardan-yamalube.png`
- Create: `public/products/generated/velg-racing-ring-14.png`
- Create: `public/products/generated/rantai-keteng-honda.png`
- Create: `public/products/generated/kiprok-regulator-rectifier.png`
- Create: `public/products/generated/handguard-set-universal.png`
- Create: `public/products/generated/grease-multi-purpose.png`
- Create: `public/products/generated/ban-tubeless-corsa-80-90-14.png`
- Modify: `package.json`
- Modify: `src/data/products.js`
- Modify: `src/store/seed.js`

**Interfaces:**
- Consumes: `PRODUCTS` from `src/data/products.js`, `VERSION` from `src/store/seed.js`.
- Produces: 15 unique `/products/generated/*.png` primary image paths and `VERSION = 3`.

- [ ] **Step 1: Add the built-in test command**

Add this script to `package.json`:

```json
"test": "node --test"
```

- [ ] **Step 2: Write the failing product asset test**

Create `tests/product-assets.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PRODUCTS } from '../src/data/products.js'
import { VERSION } from '../src/store/seed.js'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))

test('all seeded products use unique generated PNG assets', () => {
  assert.equal(PRODUCTS.length, 15)
  const paths = PRODUCTS.map((product) => product.images[0])
  assert.equal(new Set(paths).size, 15)

  for (const path of paths) {
    assert.match(path, /^\/products\/generated\/[a-z0-9-]+\.png$/)
    assert.equal(existsSync(`${projectRoot}public${path}`), true, `${path} is missing`)
  }
})

test('the store reseeds existing browsers after image mappings change', () => {
  assert.equal(VERSION, 3)
})
```

- [ ] **Step 3: Run the test and verify RED**

Run: `npm test -- tests/product-assets.test.js`

Expected: FAIL because current products still point to category SVGs and `VERSION` is `2`.

- [ ] **Step 4: Generate one GPT Image 2 source per product**

Use one built-in image generation call for each row below. Apply this exact common prompt around the row-specific subject:

```text
Use case: product-mockup
Asset type: ecommerce motorcycle sparepart catalog cutout
Primary request: Create a realistic studio catalog photograph of <SUBJECT>.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal; one uniform color with no shadows, gradient, texture, floor plane, reflections, or lighting variation.
Style/medium: premium photorealistic product photography, accurate automotive materials and believable construction.
Composition/framing: single complete product, centered, three-quarter catalog view where appropriate, generous even padding, fully inside frame.
Lighting/mood: soft even studio lighting on the object only, crisp readable form.
Constraints: no #00ff00 on the product; no cast shadow; no contact shadow; no reflection; no text; no watermark; no hands; no motorcycle; no surrounding props; no invented brand logo.
```

| Filename | `<SUBJECT>` |
| --- | --- |
| `kampas-rem-depan-nhk.png` | a pair of black motorcycle front brake pads with realistic friction material and metal backing plates |
| `aki-kering-gs-astra.png` | a compact sealed maintenance-free motorcycle battery with black casing and red and black terminals, no label text |
| `spion-custom-cnc.png` | a pair of premium CNC aluminum motorcycle rear-view mirrors with stems, dark metal finish |
| `oli-mesin-shell-advance-10w40.png` | a one-liter motorcycle engine oil bottle with red and yellow color blocking but no words or logos |
| `ban-tubeless-irc-90-80-14.png` | a single black tubeless scooter tire, 90/80-14 proportions, detailed road tread |
| `busi-iridium-ngk.png` | a single iridium motorcycle spark plug with white ceramic insulator and metal threads, no printed text |
| `lampu-led-headlamp-h4.png` | a single H4 motorcycle LED headlight bulb with metal heat sink and compact LED chips |
| `cover-body-set-racing.png` | a coordinated set of sporty motorcycle body fairing panels in glossy black and yellow, arranged as one catalog set |
| `oli-gardan-yamalube.png` | a small motorcycle gear-oil bottle with dark blue and silver color blocking but no words or logos |
| `velg-racing-ring-14.png` | a single lightweight 14-inch motorcycle racing wheel rim with three sporty spokes, satin dark metal |
| `rantai-keteng-honda.png` | a neatly coiled metal motorcycle timing chain with realistic steel links, no packaging |
| `kiprok-regulator-rectifier.png` | a motorcycle regulator rectifier with finned black aluminum heat sink, connector, and short wire lead |
| `handguard-set-universal.png` | a left and right pair of universal motorcycle handguards in black and yellow impact-resistant plastic |
| `grease-multi-purpose.png` | a compact tub of multi-purpose mechanical grease with red and white color blocking, lid closed, no words or logos |
| `ban-tubeless-corsa-80-90-14.png` | a single black tubeless scooter tire, 80/90-14 proportions, distinctive all-weather tread different from the other tire |

- [ ] **Step 5: Convert every chroma-key source to alpha PNG**

For each generated source, run the installed helper with its matching final filename:

```bash
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input /absolute/path/to/generated-source.png \
  --out public/products/generated/<filename>.png \
  --auto-key border \
  --soft-matte \
  --transparent-threshold 12 \
  --opaque-threshold 220 \
  --despill
```

Validate each output with Pillow: mode is `RGBA`, all four corners have alpha `0`, non-transparent coverage is between 8% and 85%, and no subject edge is clipped. If a green fringe remains, rerun that asset once with `--edge-contract 1`.

- [ ] **Step 6: Update all product mappings and seed version**

For product `p1` through `p15`, replace `images` with exactly one matching path:

```js
// p1 through p15, in order
images: ['/products/generated/kampas-rem-depan-nhk.png']
images: ['/products/generated/aki-kering-gs-astra.png']
images: ['/products/generated/spion-custom-cnc.png']
images: ['/products/generated/oli-mesin-shell-advance-10w40.png']
images: ['/products/generated/ban-tubeless-irc-90-80-14.png']
images: ['/products/generated/busi-iridium-ngk.png']
images: ['/products/generated/lampu-led-headlamp-h4.png']
images: ['/products/generated/cover-body-set-racing.png']
images: ['/products/generated/oli-gardan-yamalube.png']
images: ['/products/generated/velg-racing-ring-14.png']
images: ['/products/generated/rantai-keteng-honda.png']
images: ['/products/generated/kiprok-regulator-rectifier.png']
images: ['/products/generated/handguard-set-universal.png']
images: ['/products/generated/grease-multi-purpose.png']
images: ['/products/generated/ban-tubeless-corsa-80-90-14.png']
```

Change `src/store/seed.js` to:

```js
export const VERSION = 3
```

- [ ] **Step 7: Run the product asset test and verify GREEN**

Run: `npm test -- tests/product-assets.test.js`

Expected: 2 tests pass, 0 fail.

- [ ] **Step 8: Commit the product asset slice**

```bash
git add package.json tests/product-assets.test.js public/products/generated src/data/products.js src/store/seed.js
git commit -m "feat: add unique product imagery"
```

---

### Task 2: Build the Shared Performance Object Banner

**Files:**
- Create: `tests/section-banners.test.js`
- Create: `src/data/sectionBanners.js`
- Create: `src/components/ui/SectionBanner.jsx`

**Interfaces:**
- Consumes: public product paths created in Task 1.
- Produces: `SECTION_BANNERS` with `tracking`, `account`, and `orderDetail`; default export `SectionBanner(props)`.

- [ ] **Step 1: Write the failing banner configuration test**

Create `tests/section-banners.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { SECTION_BANNERS } from '../src/data/sectionBanners.js'

test('defines the three approved contextual banners', () => {
  assert.deepEqual(Object.keys(SECTION_BANNERS), ['tracking', 'account', 'orderDetail'])
  assert.deepEqual(
    Object.values(SECTION_BANNERS).map(({ number }) => number),
    ['01', '02', '03'],
  )

  for (const banner of Object.values(SECTION_BANNERS)) {
    assert.ok(banner.eyebrow)
    assert.ok(banner.title)
    assert.ok(banner.description)
    assert.match(banner.image, /^\/products\/generated\/.+\.png$/)
  }
})
```

- [ ] **Step 2: Run the banner test and verify RED**

Run: `npm test -- tests/section-banners.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/sectionBanners.js`.

- [ ] **Step 3: Create the exact banner data**

Create `src/data/sectionBanners.js`:

```js
export const SECTION_BANNERS = {
  tracking: {
    number: '01',
    eyebrow: 'Tracking center',
    title: 'Setiap kilometer, tetap terpantau.',
    description: 'Cek status perjalanan sparepart lo dari gudang sampai tujuan.',
    label: 'Lacak sekarang',
    image: '/products/generated/ban-tubeless-irc-90-80-14.png',
    imageAlt: '',
  },
  account: {
    number: '02',
    eyebrow: 'Rider profile',
    title: 'Ruang personal untuk perjalanan lo.',
    description: 'Alamat, pesanan, dan riwayat belanja dalam satu tempat.',
    label: 'DMB10 · Hemat 10%',
    image: '/products/generated/spion-custom-cnc.png',
    imageAlt: '',
  },
  orderDetail: {
    number: '03',
    eyebrow: 'Order dossier',
    title: 'Semua detail, tanpa tebak-tebakan.',
    description: 'Status, pengiriman, dan ringkasan order tersusun presisi.',
    label: 'Order · Live status',
    image: '/products/generated/kampas-rem-depan-nhk.png',
    imageAlt: '',
  },
}
```

- [ ] **Step 4: Create the shared banner component**

Create `src/components/ui/SectionBanner.jsx`:

```jsx
export default function SectionBanner({ number, eyebrow, title, description, label, image, imageAlt = '' }) {
  const titleId = `section-banner-${number}`

  return (
    <section
      aria-labelledby={titleId}
      className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-neutral-900 px-6 py-8 text-neutral-0 lg:px-10 lg:py-12"
    >
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div aria-hidden="true" className="absolute right-6 top-1/2 size-40 -translate-y-1/2 rounded-full bg-secondary-600 lg:right-16 lg:size-56" />
      <div className="relative z-10 max-w-[65%] lg:max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-secondary-600">{eyebrow} / {number}</p>
        <h1 id={titleId} className="mt-3 text-2xl font-medium leading-tight tracking-tight lg:text-4xl">{title}</h1>
        <p className="mt-3 max-w-md text-sm text-neutral-200 lg:text-base">{description}</p>
        {label && <span className="mt-5 inline-flex rounded-pill bg-secondary-600 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-neutral-900">{label}</span>}
      </div>
      <img src={image} alt={imageAlt} className="absolute bottom-[-8%] right-1 z-10 h-[72%] w-[42%] object-contain drop-shadow-2xl lg:right-8 lg:h-[88%]" />
      <span aria-hidden="true" className="absolute -bottom-8 right-2 text-8xl font-medium text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.16)] lg:right-6 lg:text-[10rem]">{number}</span>
    </section>
  )
}
```

- [ ] **Step 5: Run the banner test and verify GREEN**

Run: `npm test -- tests/section-banners.test.js`

Expected: 1 test passes, 0 fail.

- [ ] **Step 6: Commit the reusable banner slice**

```bash
git add tests/section-banners.test.js src/data/sectionBanners.js src/components/ui/SectionBanner.jsx
git commit -m "feat: add contextual section banner"
```

---

### Task 3: Integrate Banners and Refine Product Cards

**Files:**
- Modify: `src/pages/TrackOrderPage.jsx`
- Modify: `src/pages/AccountPage.jsx`
- Modify: `src/pages/OrderDetailPage.jsx`
- Modify: `src/components/ui/ProductCard.jsx`

**Interfaces:**
- Consumes: `SectionBanner` and `SECTION_BANNERS` from Task 2; transparent product paths from Task 1.
- Produces: three banner-equipped routes and transparent-safe Product Card presentation.

- [ ] **Step 1: Integrate the tracking banner**

Import the component and config:

```jsx
import SectionBanner from '../components/ui/SectionBanner'
import { SECTION_BANNERS } from '../data/sectionBanners'
```

Immediately after `<Nav />`, add:

```jsx
<div className="px-4 pt-6 lg:px-16 lg:pt-10">
  <SectionBanner {...SECTION_BANNERS.tracking} />
</div>
```

Change the form section's `h1` to an `h2` with copy `Masukkan detail pesanan` so the banner owns the page-level heading.

- [ ] **Step 2: Integrate the account banner**

Import the same component and config. Inside the existing `max-w-6xl` page section, replace the `Akun Saya` heading with:

```jsx
<SectionBanner {...SECTION_BANNERS.account} />
```

Give the existing sidebar/content wrapper `className="mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:gap-8"`.

- [ ] **Step 3: Integrate the order-detail banner**

Import the same component and config. Immediately after `<Nav />`, add the wide banner wrapper used on tracking with `SECTION_BANNERS.orderDetail`. Change the existing `h1` for `Detail Pesanan` to `h2` so the page has one `h1`.

- [ ] **Step 4: Refine Product Card for transparent imagery**

Replace the current image wrapper and image classes in `ProductCard.jsx` with:

```jsx
<div className="relative aspect-square w-full overflow-hidden rounded-md bg-neutral-50">
  <span aria-hidden="true" className="absolute left-1/2 top-1/2 size-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-100/70 blur-2xl" />
  <img
    src={product.images?.[0]}
    alt={product.name}
    className="relative h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
  />
</div>
```

- [ ] **Step 5: Run automated checks**

Run: `npm test`

Expected: 3 tests pass, 0 fail.

Run: `npm run lint`

Expected: exit `0`; the existing intentionally unused password warning may remain if oxlint reports warnings separately.

- [ ] **Step 6: Build the production bundle**

Run: `npm run build`

Expected: Vite build exits `0` and emits the production bundle in `dist/`.

- [ ] **Step 7: Commit route integration and card styling**

```bash
git add src/pages/TrackOrderPage.jsx src/pages/AccountPage.jsx src/pages/OrderDetailPage.jsx src/components/ui/ProductCard.jsx
git commit -m "feat: add premium customer banners"
```

---

### Task 4: Browser and Asset Quality Verification

**Files:**
- Inspect: `public/products/generated/*.png`
- Inspect: `/`, `/search`, `/product/p1`, `/lacak`, `/akun`, `/pesanan/ORD-3F8H1P6C`

**Interfaces:**
- Consumes: complete implementation from Tasks 1–3.
- Produces: verified UI and asset-quality evidence; no new production interface.

- [ ] **Step 1: Validate every alpha PNG programmatically**

Run a Pillow inspection over all 15 files and assert:

```python
assert image.mode == 'RGBA'
assert all(image.getpixel(corner)[3] == 0 for corner in corners)
assert 0.08 <= non_transparent_pixels / total_pixels <= 0.85
```

Expected: 15 files checked, 0 failures.

- [ ] **Step 2: Start the local app**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite reports a local URL and stays running.

- [ ] **Step 3: Verify product presentation**

At desktop and mobile widths, inspect `/`, `/search`, and `/product/p1`. Confirm all visible images load, objects are complete and centered, backgrounds are transparent over the neutral/yellow surface, and Product Card copy remains aligned.

- [ ] **Step 4: Verify all three banner routes**

Inspect `/lacak`. Log in with `budi@dmb.com` and any password, then inspect `/akun` and `/pesanan/ORD-3F8H1P6C`. Confirm banner copy, section number, yellow halo, product cutout, and responsive layout match the approved Performance Object direction without hiding forms, links, tabs, order information, or the back link.

- [ ] **Step 5: Run final fresh verification**

Run:

```bash
npm test
npm run lint
npm run build
git status --short
```

Expected: all tests pass, lint and build exit `0`, and status contains only intentional implementation changes or is clean after commits.
