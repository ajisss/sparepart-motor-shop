# Generated Assembly Hero Design

**Date:** 2026-08-04  
**Project:** DMB Moto Shop customer storefront

## Goal

Transform the homepage hero into DMB's primary signature moment: a near-full-viewport **Centered Blueprint Monument** that presents a generated naked/street motorcycle as the finished system, surrounds it with five sparepart diagrams, and visually connects those parts to their installation points. The hero must communicate that DMB designs and manufactures components without sacrificing headline clarity, CTA prominence, accessibility, or mobile usability.

## Approved Direction

The approved composition is centered and vertically staged:

1. Navigation remains above the hero.
2. Eyebrow, headline, supporting copy, and CTAs occupy the upper center.
3. A generated naked/street motorcycle fills the lower center as the primary visual.
4. Five small vector sparepart modules sit around the motorcycle.
5. Technical connector lines link each module to a plausible installation point.
6. The one-time assembly sequence resolves into restrained ambient signal motion.

The hero keeps DMB's black, warm-white, graphite, and `#FEC901` yellow palette. It retains the current rounded editorial surface and page gutters but expands vertically to fill the available first viewport below the announcement bar and navigation. The current yellow savings starburst is removed because it competes with the assembly composition. The current purchase and tracking CTAs remain unchanged.

## Generated Motorcycle Asset

Only the motorcycle is generated imagery. The approved asset is:

- one realistic naked/street motorcycle;
- complete right-facing side profile with both wheels level;
- accurate visible tank, exposed engine, frame, fork, swingarm, brakes, exhaust, headlamp, handlebars, and mirrors;
- premium technical-ink rendering with graphite, warm-white, and restrained yellow functional accents;
- no rider, separate parts, text, logos, brand marks, watermark, cast shadow, or background scene;
- transparent PNG with generous padding.

The approved preview was created with the built-in image generation path on a flat chroma-key background and converted locally to alpha. The implementation copies the validated transparent result to:

`public/hero/generated-naked-street-bike.png`

The source is `1672 × 941` RGBA, has transparent corners, `39.9%` non-transparent subject coverage, and no detected green residue.

## Sparepart Modules

The surrounding modules remain inline SVG so their strokes and connectors can animate sharply at any size. The five approved modules are:

| Module | Placement | Motorcycle target |
| --- | --- | --- |
| Battery | Upper left | Battery/electrical area beneath the tank |
| Ignition / spark plug | High left-center | Engine ignition area |
| Headlamp | Upper right | Front headlamp assembly |
| Brake system | Lower left | Rear brake/wheel area |
| Exhaust | Lower right | Exhaust and lower-engine junction |

Each module uses a dark technical frame, one concise uppercase label, warm-white strokes, and at most one yellow accent. Modules are illustrative rather than interactive and are hidden from the accessibility tree.

## Content Hierarchy

The hero retains the existing Indonesian storefront content:

- eyebrow: `Produsen sparepart motor · Bandung`;
- headline: `Sparepart motor original, bikinan sendiri`;
- existing supporting paragraph;
- primary CTA: `Belanja Sekarang` → `/search`;
- secondary CTA: `Lacak Pesanan` → `/lacak`.

The headline remains the dominant first read. The motorcycle is the dominant visual read after the copy. Sparepart modules and technical labels are tertiary. No connector line may cross the headline, body copy, or CTAs.

## Motion Choreography

The entrance sequence runs once after the hero has mounted and the motorcycle image is available:

| Phase | Start | Duration | Behavior |
| --- | ---: | ---: | --- |
| Copy entrance | `0ms` | `600ms` | Copy resolves with a short opacity and vertical reveal |
| Motorcycle ink reveal | `240ms` | `900ms` | A left-to-right ink mask exposes the generated motorcycle |
| Sparepart modules | `720ms` | `520ms` each | Modules scale from `0.88` and fade in with `110ms` stagger |
| Connector lines | `1180ms` | `620ms` each | Lines draw toward motorcycle targets with `130ms` stagger |
| Endpoint markers | `1560ms` | `260ms` each | Yellow markers resolve with one restrained pulse |
| Ambient state | `2400ms` onward | Continuous | Very slow signal flow and subtle marker breathing |

Entrance easing uses premium expo-out: `cubic-bezier(0.16, 1, 0.3, 1)`. Connector dash movement is linear because it represents continuous signal flow.

The ambient state is deliberately quiet:

- modules drift no more than `3px` over `5–6s` alternate cycles;
- connector dash travel takes at least `8s` per loop;
- only one endpoint marker pulses at a time;
- pulse scale is capped at `1.45` and never flashes more than once every `3s`;
- the motorcycle remains fixed after its reveal.

The hero never blocks navigation or CTA interaction while motion is active.

## Component Design

Extract the existing homepage hero into a focused `HeroAssemblySection` component. It owns:

- the existing hero copy and links;
- one-time entrance state;
- the generated motorcycle image;
- the five fixed sparepart module definitions;
- connector geometry and endpoint markers.

A small local `AssemblyPart` component renders each fixed vector module. Part definitions stay private to the hero because no other page consumes them. Motion uses CSS keyframes plus a single mounted/ready state; no animation library or general-purpose configuration layer is added.

The motorcycle image includes intrinsic `width` and `height`, `decoding="async"`, and high fetch priority because it is a primary above-the-fold asset. The headline and CTAs render independently of the image, so a slow image never delays essential content.

## Responsive Behavior

Desktop (`lg` and above):

- hero uses `min-height: max(680px, calc(100svh - 128px))` within the existing page gutters;
- copy occupies the upper center;
- motorcycle occupies `72%` of the hero width in the lower center;
- all five sparepart modules remain visible.

Tablet (`sm` through `lg`):

- copy width expands to avoid awkward headline wrapping;
- hero has a minimum height of `720px`;
- motorcycle occupies `90%` of the hero width;
- connector geometry scales with the shared SVG view box;
- all five modules and their approved labels remain visible.

Narrow phone (below `sm`):

- hero uses a `760px` minimum-height vertical composition;
- headline and CTAs remain above the visual stage;
- motorcycle uses `116%` of the hero content width and is clipped by the hero surface, never by the page viewport;
- only battery, headlamp, and brake modules remain visible;
- ignition and exhaust modules are removed from the small-screen presentation to prevent collisions;
- CTA buttons stack using the existing behavior.

## Accessibility and Reduced Motion

- The motorcycle has concise alt text: `Ilustrasi motor naked dengan sparepart DMB`.
- All vector sparepart modules, labels, connector lines, and endpoint markers use `aria-hidden="true"`.
- Essential meaning remains in the headline and supporting paragraph.
- Under `prefers-reduced-motion: reduce`, the motorcycle and modules render immediately in their completed positions; all mask movement, drift, signal travel, stagger, and pulses are disabled.
- Motion never becomes the only way to understand that modules relate to the motorcycle; the final connector lines remain visible.
- Focus order and button behavior remain unchanged.

## Failure Handling

- If the motorcycle image fails, the hero keeps its copy, CTAs, background, and sparepart modules without collapsing layout.
- A fixed aspect-ratio visual stage prevents layout shift while the image loads.
- Motion begins only after the component is mounted and the image is ready; image failure resolves directly to the static fallback state.
- Narrow phones render only the three connector lines belonging to battery, headlamp, and brake; larger breakpoints render all five.

## Validation

Automated checks should verify:

- the generated PNG exists, is RGBA, has transparent corners, and contains no meaningful chroma-green residue;
- the hero defines exactly five desktop modules and three narrow-phone modules;
- the two existing CTA destinations remain `/search` and `/lacak`;
- the motorcycle image has alt text and all decorative vector layers are hidden from assistive technology;
- reduced-motion styles resolve the hero to its static final state.

Implementation verification includes:

- `npm test`;
- `npm run lint`;
- `npm run build`;
- browser review at `390px`, `768px`, and `1440px` widths;
- observing the full entrance once and confirming it does not replay after scroll;
- observing at least one ambient cycle for collisions or distracting repetition;
- browser emulation of `prefers-reduced-motion: reduce`;
- checking that the headline, CTAs, and motorcycle remain readable against the dark hero surface.

## Out of Scope

- Generating separate sparepart images;
- WebGL, canvas particles, cursor-following motion, or scroll-jacking;
- interactive hotspots or clickable sparepart modules;
- changing hero copy, CTA destinations, navigation, marquee, or later homepage sections;
- autoplay sound;
- replacing the Clean Engineering treatment in the **Cara Belanja** section.
