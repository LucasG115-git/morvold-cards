# PMI Design System — Component Specs

How to read this doc:
- ✅ **Confirmed** = value comes directly from `pmi-dsm-tokens-17.1.1.min.css`.
- 🔶 **Recommended** = geometry (heights, paddings) derived from the DSM spacing/radius/size scales in the house style, because PMI's per-component CSS is encapsulated in web components and not present in the downloaded stylesheets. Verify against a live component if pixel-exactness matters (see "Getting exact specs" at the bottom).

Global tokens used throughout:
- Radius: `sm 2 · md 4 · lg 8 · xl 16` px · Border width `xs 1 · sm 2` px
- Focus ring ✅ default `0 0 0 3px #fff, 0 0 0 5px #000` · error `…5px #c80029` · success `…5px #43a83e`
- Control text: Inter · body 16/24, small 14/22
- Disabled convention: reduce to the 200–300 tint of the family; text → `gray-400`

---

## Buttons ✅ (strongest token coverage)

**Type:** Inter, weight 600 (semibold), color white on filled variants.
**Text sizes ✅:** xs 12/lh24 · sm 14/lh22 · md 16/lh24 · lg 18/lh28 · xl 18/lh28.
**Link-button text ✅:** xs 16 · sm 18 · md·lg 20px.

**Heights 🔶:** xs 32 · sm 36 · md 44 · lg 52 · xl 60.
**Horizontal padding 🔶:** xs/sm 16 · md 20 · lg/xl 24. Icon gap 8.
**Radius 🔶:** `lg` 8px (matches card radius; PMI uses lightly-rounded rectangles, not pills).

**Variants (colors ✅):**
| Variant | Default | Hover | Active | Disabled |
|---|---|---|---|---|
| Primary | bg violet-500 `#4f17a8`, text #fff | bg violet-600 `#441d82` | bg violet-700 `#2f0e65` | bg violet-300 `#c4b2e3` |
| Secondary (outline) | bg #fff, 1px violet-500 border, text violet-500 | bg violet-50, border violet-600 | bg violet-100 | border gray-300, text gray-400 |
| Tertiary / ghost | transparent, text violet-500 | bg violet-50 | bg violet-100 | text gray-400 |
| Danger | bg danger `#c80029`, text #fff | red-700 `#b00024` | — | red-200 |
| Link | text link-on-light `#0080a8`, underline | violet-500 | aqua-700 `#005c78` | gray-400 |

**Social buttons ✅:** Twitter `#1377b4` · LinkedIn `#0065c9` · Facebook `#1671e5` (white text/icon).
**Focus:** default focus ring ✅.

---

## Button Groups 🔶
Row of buttons joined edge-to-edge: first child radius-left `lg`, last child radius-right `lg`, inner corners squared; shared 1px `gray-300` dividers between segments. Segmented/toggle style: selected segment = Primary fill, others = Secondary. Gap variant uses spacing `xs` (8px) between separate buttons.

---

## Inputs (text fields) 🔶
- Height: md 44 · sm 36 · lg 52. Padding 12×16. Radius `md` 4px.
- Border 1px `gray-300` `#d9d9d9`; text `gray-800`; placeholder `gray-500` `#767676`.
- Hover border `gray-400`. Focus border violet-500 + focus ring ✅. Filled bg #fff.
- Error: border danger `#c80029`, error ring ✅, helper text error `#c80029` (Paragraph SM).
- Disabled: bg `gray-100`, border `gray-200`, text `gray-400`.
- Label: Inter 600 14/22 `gray-800`, gap 4–8 above field. Helper/caption: Paragraph XS `gray-600`.

---

## Selects (single) 🔶 (Select2 is PMI's chosen widget)
Same box as Input (44 tall, 4px radius, gray-300 border). Trailing chevron icon `gray-600`, 16px. Open state: border violet-500 + focus ring.
**Dropdown menu:** white, radius `md`, shadow `md` ✅ `0 4px 16px rgba(0,0,0,.10)`, 1px gray-200 border. Option padding 8×16, hover bg `violet-50` `#f9f5ff`/`gray-100`, selected bg `violet-100`, text gray-800. Max-height with scroll.

## Dropdowns (menus) 🔶
Same container as select menu above: white surface, radius `md`, shadow `md`, 4px border-radius, item rows 40–44 tall, hover `gray-100`, section dividers `gray-200` 1px. Used for nav/account/action menus.

## Multi-selects 🔶
Select box grows to fit **tags** (see Tags). Selected values render as removable chips inside the control: bg `violet-100`, text `violet-700`, radius `sm`/`md`, 2×8 padding, ✕ remove icon violet-600. Input area for typing to filter. Same menu as Select.

---

## Checkboxes 🔶
- Box 20×20, radius `sm` 2px, 1px `gray-400` border, bg #fff.
- Hover border violet-500. Checked: bg violet-500 `#4f17a8`, white check glyph. Focus ring ✅.
- Indeterminate: violet-500 bg, white dash. Disabled: bg gray-100, border gray-300.
- Label Paragraph MD `gray-800`, gap 8. Error state border danger.

## Radio groups 🔶
- Circle 20×20, 1px `gray-400` border, bg #fff. Checked: 2px violet-500 border + 10px violet-500 inner dot (or filled with white center). Focus ring ✅.
- Hover border violet-500. Disabled gray-300. Row gap 12 (spacing `sm`), label Paragraph MD.

## Toggles ✅ (fully token-defined)
- Track off: `gray-400` `#ababab` (hover `gray-500`, active `gray-200`, disabled `gray-300`).
- Track on (primary): `violet-500` `#4f17a8` (disabled `violet-300`).
- Track on (success): green variants.
- Knob: white `#ffffff` (off-active `gray-200`; on-primary-active `violet-200`).
- 🔶 Geometry: track 44×24, knob 20 dia, 2px inset, slide 20px. Radius: circle. Focus ring ✅.

---

## Badges 🔶
Small status pills. Height 20–24, padding 2×8, radius `sm` 2px (or `circle` for count dots), text 12 Inter 600, uppercase optional.
| Tone | Bg | Text |
|---|---|---|
| Primary | violet-100 `#f9f5ff` | violet-700 `#2f0e65` |
| Info | aqua-100 `#f0fafc` | info `#005c78` |
| Success | green-100 `#edf8ed` | green-700 `#255d22` |
| Warning | yellow-100 `#fffae5` | yellow-700 `#ff9f00` |
| Danger | red-100 `#ffebea` | danger `#c80029` |
| Neutral | gray-100 `#f5f5f5` | gray-700 `#3c3c3c` |
Solid variants: family-500 bg + white text.

## Tags 🔶
Like badges but interactive/removable and usually neutral-brand. Bg `violet-100`, text `violet-700`, radius `md` 4px, padding 4×8 (+ ✕ remove icon violet-600, 12px). Hover bg `violet-200`. Filter/selectable tag selected = violet-500 bg / white.

## Tooltips 🔶 (Bootstrap-based on PMI)
- Surface: `gray-900` `#111111` bg, white text, Paragraph XS 12/20, padding 6×8, radius `md` 4px, max-width ~240, shadow `md`.
- Arrow 6px matching bg. Offset 8px from trigger. (Light variant: #fff bg, gray-800 text, 1px gray-200 border, shadow `md`.)

## Progress indicators 🔶
- **Linear bar:** track `gray-200` `#ececec`, fill violet-500 `#4f17a8`, height 8 (radius `lg`/full), determinate width %. Success fill green-500.
- **Steps/stepper:** completed = violet-500 circle + white check, current = violet-500 ring, upcoming = gray-300; connector line 2px gray-200 → violet-500 when complete.
- **Spinner:** violet-500 arc on gray-200 ring, motion duration `normal` 300ms.

## Sliders 🔶
- Track 4px, `gray-300`; filled portion violet-500. Radius full.
- Thumb 20 dia, white, 2px violet-500 border, shadow `sm` ✅ `0 2px 4px rgba(0,0,0,.08)`; hover grows, focus ring ✅.
- Disabled track gray-200 / thumb gray-300. Value label Paragraph XS.

---

## Getting exact (pixel-perfect) component specs
The values marked 🔶 are house-style derivations from confirmed tokens. To make any of them exact, either:
1. Point me to PMI's live pattern library / DSM Storybook URL (if one is public) and I'll pull the real component CSS, or
2. Open a PMI page that renders the component, **Inspect** it (F12) → right-click the element → Copy → **Copy styles**, and paste it here — I'll reconcile that component to exact values.

Buttons, Toggles, Cards, Alerts, and all color/type/spacing are already token-exact ✅.
