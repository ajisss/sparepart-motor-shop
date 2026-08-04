# Clean Engineering Purchase Steps Design

**Date:** 2026-08-04  
**Project:** DMB Moto Shop customer storefront

## Goal

Replace the four generic image placeholders in the homepage **Cara Belanja** section with a connected set of technical illustrations that makes DMB feel like a real sparepart manufacturer. The approved visual direction is **Clean Engineering** with the **M1 Drafting Sequence** motion treatment: precise enough to communicate manufacturing expertise, but restrained enough to preserve the premium black-and-yellow storefront.

## Approved Visual Direction

Each step keeps the existing dark card surface and yellow step number. The placeholder mark is replaced by a unique inline SVG engineering drawing using:

- warm white structural strokes;
- one restrained DMB-yellow functional accent;
- thin grey measurement or callout lines;
- one or two short technical labels;
- generous empty space around the primary object;
- no dense blueprint grid, photorealistic background, texture, or decorative noise.

The four drawings form one visual family but represent different stages:

| Step | Drawing | Yellow accent | Example callouts |
| --- | --- | --- | --- |
| `01` — Pilih sparepart | Gear and fitment target | Inner fitment ring | `FITMENT`, `MATCH` |
| `02` — Checkout & bayar | Payment module/card | Verified transaction module | `SECURE`, `VERIFIED` |
| `03` — Kami proses & kirim | Isometric package and seal | QC path across the package | `QC PASS`, `SEALED` |
| `04` — Lacak sampai tiba | Location pin and tracking target | Live position ring | `LIVE`, `ETA` |

Technical labels support the concept rather than carry essential information. The existing title and description remain the accessible source of meaning.

## Component Design

Extract the current homepage purchase-step section into a focused `HowItWorksSection` component. It owns:

- the four existing step titles and descriptions;
- the responsive step grid;
- the one-time viewport trigger;
- the CTA below the grid.

Create a small `BlueprintStepVisual` component for the illustrated card surface. It accepts a fixed step identifier (`select`, `payment`, `warehouse`, or `tracking`) and the displayed step number. It renders the matching inline SVG and applies shared structural classes to its paths, accents, callouts, and markers.

The SVG source remains in the repository rather than being generated as raster images. Inline SVG is required for crisp scaling, direct stroke animation, theme consistency, and reduced asset weight. No new animation or illustration dependency is added.

## Motion Design

The approved **M1 Drafting Sequence** runs once when the section enters the viewport:

1. The warm-white object strokes draw from start to finish.
2. The yellow functional accent draws shortly afterward.
3. Grey callout lines extend and their labels fade in.
4. Yellow endpoint markers resolve with one restrained pulse.

The default timing is:

| Element | Duration | Start relative to its card |
| --- | ---: | ---: |
| Structural object | `700ms` | `0ms` |
| Yellow accent | `520ms` | `180ms` |
| Callout lines and labels | `240ms` | `500ms` |
| Endpoint pulse | `260ms` | `560ms` |

Cards are staggered by `120ms`, left to right on desktop and DOM order on smaller screens. The last card finishes `1180ms` after the sequence starts. The sequence does not loop and does not replay when the user scrolls away and back.

SVG paths use normalized `pathLength="1"` with `stroke-dasharray` and `stroke-dashoffset`, avoiding hard-coded path lengths. Motion uses CSS keyframes and a single intersection observer; it does not require Framer Motion, GSAP, or another runtime dependency.

## Trigger and State Behavior

The section observes its root with an intersection threshold of `0.25`. On the first intersection:

1. the section receives its active motion state;
2. the observer disconnects immediately;
3. every illustration remains in its final visible state.

The static frame, step number, title, and description are visible before the trigger. Only decorative SVG strokes and labels participate in the reveal, so the section never appears empty or loses functional content.

If `IntersectionObserver` is unavailable, illustrations render directly in their final state.

## Responsive Behavior

Keep the existing grid progression:

- one column on narrow phones;
- two columns from the existing `sm` breakpoint;
- four columns from the existing `lg` breakpoint.

All drawings use a shared `viewBox` and scale with the card. Motion order follows DOM order regardless of visual wrapping.

## Accessibility

- Each SVG is decorative and uses `aria-hidden="true"` because the adjacent heading and description already convey the step.
- Technical labels do not duplicate into the accessibility tree.
- Users with `prefers-reduced-motion: reduce` receive the completed drawing immediately, with no stroke drawing, stagger, or pulse.
- Color is not the sole carrier of meaning: structural shape and adjacent text remain understandable without the yellow accent.
- The existing CTA and heading hierarchy remain unchanged.

## Failure Handling

- A missing illustration variant fails to a simple empty technical frame while the step text remains intact.
- The component uses a fixed internal variant map, preventing arbitrary SVG or markup injection.
- Motion styles are progressive enhancement; failure to run animation leaves the final drawing visible.

## Validation

Automated checks should verify:

- all four purchase steps map to a unique supported illustration variant;
- the section still contains the existing titles, descriptions, and CTA destination;
- the SVGs are decorative and expose no redundant accessible label;
- reduced-motion styling resolves all animated strokes and callouts to their final state.

Implementation verification also includes:

- `npm test`;
- `npm run lint`;
- `npm run build`;
- browser review at narrow phone, two-column, and four-column widths;
- observing that the animation triggers once, remains complete after scrolling back, and does not clip callouts;
- browser emulation of `prefers-reduced-motion: reduce`.

## Out of Scope

- Looping or cursor-reactive animation;
- sound effects;
- dense production-grid backgrounds;
- image generation or raster assets for this section;
- changes to the purchase flow, checkout, tracking, or CTA destination;
- adding a general-purpose animation framework.
