# Context Banners and Product Imagery Design

**Date:** 2026-08-04  
**Project:** DMB Moto Shop customer storefront

## Goal

Improve the order-tracking and account surfaces with a coherent editorial banner system, then replace the generic category illustrations in product cards with unique photorealistic sparepart imagery. The result must feel more creative and premium without changing the storefront's black, yellow, and neutral brand language.

## Scope

### Context banners

Add banners to these routes:

- `/lacak` — order tracking
- `/akun` — customer account/profile
- `/pesanan/:id` — order detail

Each banner uses the approved **Performance Object** direction:

- dark editorial surface;
- restrained yellow halo and label accents;
- subtle technical grid/details;
- oversized outlined section number;
- one transparent photorealistic sparepart as the visual focus;
- contextual page copy as the primary message;
- a small contextual action or promotion label that never competes with the page task.

The page-specific content is:

| Route | Label | Headline intent | Supporting content | Object |
| --- | --- | --- | --- | --- |
| `/lacak` | `Tracking center / 01` | Track every kilometer of the shipment | Explain that status is available from warehouse to destination | Tire product cutout |
| `/akun` | `Rider profile / 02` | Present the account as the rider's personal space | Mention addresses, orders, and purchase history | Mirror product cutout |
| `/pesanan/:id` | `Order dossier / 03` | Make order information feel precise and complete | Mention status, shipping, and summary | Brake-part product cutout |

The account banner may carry a small `DMB10` promotion label. The tracking and detail banners use functional labels rather than sales-led promotions.

### Product imagery

Generate one unique image for each of the 15 seeded products:

1. Kampas Rem Depan NHK
2. Aki Kering GS Astra
3. Spion Custom CNC
4. Oli Mesin Shell Advance 10W-40
5. Ban Tubeless IRC 90/80-14
6. Busi Iridium NGK
7. Lampu LED Headlamp H4
8. Cover Body Set Racing
9. Oli Gardan Yamalube
10. Velg Racing Ring 14
11. Rantai Keteng Honda
12. Kiprok Regulator Rectifier
13. Handguard Set Universal
14. Grease Multi Purpose
15. Ban Tubeless Corsa 80/90-14

The approved direction is **Studio Photoreal**:

- realistic product-catalog photography;
- three-quarter view unless the product is more recognizable from another catalog-standard angle;
- soft, even studio lighting;
- accurate material cues for rubber, metal, plastic, glass, and fluid containers;
- centered complete object with generous padding;
- no crop, hands, motorcycle, scene, text, watermark, or invented brand marks;
- consistent apparent scale and lighting across the full set.

The requested generation path is GPT Image 2. Since GPT Image 2 does not expose native transparent output, each source is generated on a perfectly flat chroma-key background and converted locally to a transparent PNG. Final files live in `public/products/generated/` with stable product-based filenames.

## Component Design

Create one shared `SectionBanner` component. It accepts only the content needed by the three pages: section number, eyebrow, title, description, optional label, image, and image alt text. The component owns the responsive Performance Object composition, which prevents three page-specific copies of the same markup.

The banner sits directly below `Nav` inside a shared wide page container. Existing functional content keeps its current width:

- tracking form remains narrow and focused below the banner;
- account sidebar/content remains within its current wide account layout;
- order detail cards remain within their current readable width.

On smaller screens, copy stays above the visual hierarchy, the product object scales down and moves behind unused space, and no text overlaps the object or outlined number.

## Product Card Presentation

Update `ProductCard` so transparent product cutouts are displayed with `object-contain` and deliberate internal padding. The image surface uses a light neutral background with a restrained yellow radial accent. Hover interaction remains limited to a small image scale change.

Product data points to the generated PNG as the primary image. The same primary image may appear in product detail and other existing consumers so the catalog remains consistent. No additional gallery angles are generated in this scope.

## Data Flow

The work remains frontend-only:

1. Product seed data provides stable public asset paths.
2. Existing store seeding copies those paths into `localStorage`.
3. `ProductCard`, product detail, navigation previews, cart, and checkout continue reading the existing `images` field.
4. Banner pages import the selected cutouts directly for presentation.

Because existing users may already have store version 2 in `localStorage`, increment the seed version when image paths change so the new assets are visible without requiring a manual browser reset.

No changes are made to order creation, authentication, cart behavior, tracking authorization, or persisted data structure beyond the image-path reseed.

## Accessibility and Failure Handling

- Banner copy uses semantic headings consistent with each page's existing heading structure.
- Decorative grid, number, and halo elements remain hidden from assistive technology.
- Product images keep descriptive alt text based on the product name.
- Banner imagery uses concise object alt text when meaningful and an empty alt when redundant with nearby copy.
- If an image fails to load, the fixed neutral/yellow surface preserves layout and readable content.
- Existing forms, links, and order access behavior remain unchanged.

## Validation

Each generated final asset must be checked for:

- PNG alpha channel present;
- transparent corners;
- plausible non-empty subject coverage;
- no chroma-key fringe;
- no clipped object edges;
- recognizable match to its product name;
- no unwanted text, watermark, or brand hallucination.

Implementation verification includes:

- the smallest automated source-level checks needed for the shared banner contract and the 15 asset mappings;
- `npm run lint`;
- `npm run build`;
- browser review at desktop and mobile widths for all three banner routes, search/home product grids, and one product detail page.

## Out of Scope

- New backend or CMS fields for banners;
- automatic banner rotation;
- new promotion management behavior;
- multiple generated gallery angles per product;
- changes to checkout, payment, shipping, or tracking logic;
- native transparent generation through a different image model.
