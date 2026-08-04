# Design Tokens (extracted from Figma)

Source: Figma file `g5t7sM0rQDvppxhMIyRnAF`, node `16191:42118` ("Home" desktop frame).
Extracted via `mcp__plugin_figma_figma__get_variable_defs` (primary source) and
`mcp__plugin_figma_figma__get_design_context` on sub-nodes (button, product card)
for values not exposed as variables (border radius, shadow).

Reference this file instead of hard-coding hex values.

> **Rebrand (2026-08):** the palette moved from the original Figma green to the
> DMB **black + yellow** motorsport identity. Primary = black (actions, emphasis,
> dark surfaces); Secondary = yellow `#FEC901` (accents: ratings, active chips,
> badges, highlights on dark surfaces). Neutrals were de-tinted to pure grey.

## Primary (brand black) — actions, emphasis, dark surfaces

Strong shades (600–900) are black; light shades (25–300) are near-neutral greys
for subtle surfaces/borders.

| Token | Hex |
|---|---|
| primary-25 | #F4F4F5 |
| primary-100 | #E4E4E7 |
| primary-200 | #D4D4D8 |
| primary-300 | #A1A1AA |
| primary-600 (base) | #000000 |
| primary-700 (hover) | #262626 |
| primary-800 | #171717 |
| primary-900 | #000000 |

## Secondary (brand yellow `#FEC901`) — accents

Yellow is illegible as text on white; use it as a background (with dark text),
as accent marks (rating stars), or as text/fills on dark surfaces. `secondary-800`
is a dark amber for legible text on light-yellow backgrounds.

| Token | Hex |
|---|---|
| secondary-25 | #FFFDF0 |
| secondary-100 | #FFF3C4 |
| secondary-200 | #FFE885 |
| secondary-600 (base) | #FEC901 |
| secondary-700 (hover) | #E5B400 |
| secondary-800 (text) | #8A6D00 |
| secondary-900 | #4D3D00 |

## Greyscale / Neutral (pure grey, no colour cast)

| Token | Hex |
|---|---|
| neutral-0 | #FFFFFF |
| neutral-25 | #FAFAFA |
| neutral-50 | #F4F4F5 |
| neutral-100 | #E4E4E7 |
| neutral-200 | #D4D4D8 |
| neutral-600 | #71717A |
| neutral-800 | #27272A |
| neutral-900 | #0A0A0A |

## Success / Error

No success or error color variables/styles were found on the extracted frame
(the source design has no visible error/success UI states on this page).
Do not invent values — if a later task needs a semantic success/error color,
flag it for a follow-up Figma lookup on the relevant component instead of guessing.

## Typography

Font family: **Instrument Sans** (Google Font, weights 400/500/600 used).

Type scale (`family, weight, size, line-height, tracking`), from Figma text styles:

| Style | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| Display 2 / Medium | 56px | 500 | 1.2 | -2px |
| Display 3 / Medium | 48px | 500 | 1.2 | -2px |
| H1 / Medium | 40px | 500 | 1.2 | -2px |
| H2 / Medium | 36px | 500 | 1.2 | -2px |
| H4 / Medium | 28px | 500 | 1.2 | -2px |
| H6 / Medium | 20px | 500 | 1.2 | -2px |
| H6 / Semibold | 20px | 600 | 1.2 | -1px |
| Body Large / Medium | 18px | 500 | 1.5 | -2px |
| Body Medium / Regular | 16px | 400 | 1.5 | -2px |
| Body Medium / Semibold | 16px | 600 | 1.5 | -1px |
| Body Small / Regular | 14px | 400 | 1.5 | -2px |
| Label Medium / Medium | 16px | 500 | 1.0 | -2px |
| Label Medium / Regular | 16px | 400 | 1.0 | -2px |
| Label Small / Medium | 14px | 500 | 1.0 | -2px |
| Label Small / Regular | 14px | 400 | 1.0 | -2px |
| Capital / Small | 14px | 500 | 1.0 | 0px |
| Capital / Xsmall (uppercase small) | 12px | 500 | 1.0 | 1.5–2px |

## Border radius

Extracted from component code (`get_design_context` on button and product card instances):

| Token | Value | Usage |
|---|---|---|
| radius-md | 12px | Product/image cards |
| radius-full | 100px (effectively pill/circle) | Buttons, badges, icon containers |

## Shadow

Only one shadow effect was found on the extracted frame, on the input field style:

| Token | Value |
|---|---|
| shadow-input | `0px 0.5px 0.75px rgba(49, 54, 44, 0.012)` (from `Input Field` effect: DROP_SHADOW #31362C03, offset (0, 0.5), radius 0.75, spread 0) |

No other shadow styles (e.g. card elevation) were found on this frame — cards in the
design use borders/flat backgrounds rather than drop shadows.

## Semantic colors (POC additions — not from the original Figma)

Added in SP2 for form validation and order-status badges. Not part of the source
Figma file.

| Token | Hex |
|---|---|
| success | #16A34A |
| error | #DC2626 |
| warning | #D97706 |
| info | #2563EB |
