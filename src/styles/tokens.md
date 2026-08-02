# Design Tokens (extracted from Figma)

Source: Figma file `g5t7sM0rQDvppxhMIyRnAF`, node `16191:42118` ("Home" desktop frame).
Extracted via `mcp__plugin_figma_figma__get_variable_defs` (primary source) and
`mcp__plugin_figma_figma__get_design_context` on sub-nodes (button, product card)
for values not exposed as variables (border radius, shadow).

These are the literal values returned by Figma — do not invent additional shades
or semantic colors that aren't listed here. Later tasks should reference this file
instead of hard-coding hex values.

## Primary (brand green) — `Primary/*` variables

| Token | Hex |
|---|---|
| primary-25 | #F7FEE7 |
| primary-100 | #D8F999 |
| primary-200 | #BBF451 |
| primary-600 (base) | #497D00 |
| primary-700 | #3C6300 |
| primary-800 | #35530E |
| primary-900 | #192E03 |

Note: Figma only defines the shades above (25, 100, 200, 600, 700, 800, 900).
Shades 50/300/400/500 are not defined in the source file — do not fabricate them;
if a task needs an in-between shade, prefer the nearest defined one.

## Greyscale / Neutral — `Greyscale/*` variables

| Token | Hex |
|---|---|
| neutral-0 | #FFFFFF |
| neutral-25 | #F9F9F9 |
| neutral-50 | #F3F4F2 |
| neutral-100 | #E7E9E5 |
| neutral-200 | #CFD3CC |
| neutral-600 | #707A66 |
| neutral-800 | #404D33 |
| neutral-900 | #102100 |

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
