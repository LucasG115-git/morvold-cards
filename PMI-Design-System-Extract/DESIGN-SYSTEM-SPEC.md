# PMI.org Design System — Specification

Human-readable reference, extracted from `pmi-dsm-tokens-17.1.1.min.css` (PMI Design System Manager v17.1.1). All px values resolved from a 16px root.

---

## 1. Colour Styles

### 1.1 Brand colours

| Token | Hex | Notes |
|---|---|---|
| **Brand / Primary (Violet)** | `#4F17A8` | Core PMI purple |
| **Accent A (Aqua)** | `#03A5C9` | Secondary brand |
| **Accent B (Tangerine)** | `#FF610F` | Secondary brand |

> ⚠️ The brand base for Accent A is `#03A5C9`, which is **not** the same as the raw `aqua-500` (`#05BFE0`). The raw `aqua-500` corresponds to `accentA-400`. Keep the brand ramp and the raw ramp separate.

### 1.2 Primitive palettes (50 → 900)

**Violet / Brand Primary**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 |
|---|---|---|---|---|---|---|---|---|
| #fdfbff | #f2edf8 | #e5dcf2 | #c4b2e3 | #8a66c4 | **#4f17a8** | #441d82 | #2f0e65 | #14042e |

*(Brand Primary variant differs at 100 = `#f9f5ff`.)*

**Aqua**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|---|
| #f9fdfe | #ecfafc | #daf5fa | #abe8f5 | #59d4eb | **#05bfe0** | #0080a8 | #005c78 |

*(Brand Accent A ramp: 400 = `#05bfe0`, 500 = `#03a5c9`, 100 = `#f0fafc`.)*

**Tangerine / Brand Accent B**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|---|
| #fefaf8 | #fff3ed | #ffe7db | #ffc9b0 | #ff9461 | **#ff610f** | #ee490d | #dd310b |

*(Brand Accent B variant differs at 100 = `#fff6f2`.)*

**Gray**
| 50 | 100 | 150 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| #fbfbfb | #f5f5f5 | #f1f1f1 | #ececec | #d9d9d9 | #ababab | #767676 | #575757 | #3c3c3c | #212121 | #111111 |

**Red**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|---|
| #fff7f7 | #ffebea | #ffcece | #ffa7a7 | #ff6a6a | **#ec0030** | #c80029 | #b00024 |

**Yellow**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|---|
| #fffdf5 | #fffae5 | #fff0b3 | #ffe780 | #ffdd4d | **#ffce00** | #ffb900 | #ff9f00 |

**Green**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|---|
| #f8fcf8 | #edf8ed | #c9eac7 | #a5dda2 | #5dc158 | **#43a83e** | #348330 | #255d22 |

**Teal**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|---|
| #f5fcfb | #e5f6f5 | #bfe8e7 | #7fd2cf | #00a5a0 | **#008480** | #007773 | #006a66 |

**Base:** White `#ffffff` · Black `#000000`

### 1.3 Semantic colours

| Role | Value |
|---|---|
| Danger / Error | `#c80029` (text/fill), bg `#ffebea` |
| Info | `#005c78`, bg `#f0fafc` |
| Success | `#43a83e` (base) / `#255d22` (text), bg `#edf8ed` |
| Warning | `#ff9f00`, bg `#fffae5` |
| Primary (alert) | Violet `#4f17a8`, bg `#f2edf8` |

### 1.4 Text colours

| Token | On Light | On Dark |
|---|---|---|
| Primary text | `gray-800` #212121 | White |
| Secondary text | `gray-600` #575757 | `gray-200` #ececec |
| Inactive text | `gray-400` #ababab | `gray-500` #767676 |
| Link | `aqua-600` #0080a8 | `aqua-400` #59d4eb |
| Brand text | `violet-500` #4f17a8 | — |
| Error text | `#c80029` | — |
| On-brand text | White | — |

### 1.5 Overlays & scrims

Dark: `rgba(0,0,0,0.1 / 0.2 / 0.4)` · Light: `rgba(255,255,255,0.1 / 0.2 / 0.4)` · Primary darkest: `rgba(47,14,101,0.75)`

### 1.6 Gradients (linear)

| Name | Value |
|---|---|
| Primary background | `linear-gradient(90deg, #14042e, #441d82)` |
| Aqua | `linear-gradient(90deg, #003343, #03a5c9)` |
| Tangerine | `linear-gradient(90deg, #dd310b, #ff9461)` |
| + extended duotones | violet→red, aqua→teal, yellow→green, yellow→tangerine, red→violet (see tokens JSON) |

---

## 2. Typography Styles

**Families:** **Agrandir** (display/headings) · **Inter** (body/UI/nav/buttons) · **GT Pressura Mono** (eyebrow/caption).
**Weights:** Light 300 · Regular 400 · Medium 500 · Semibold 600 · Bold 700.
**Letter-spacing tokens:** sm 1px · md 1.5px · lg 2px.
**Type scale (px):** 10 · 12 · 14 · 16 · 18 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 96.

| Style | Font | Weight | Size | Line-height | Tracking | Notes |
|---|---|---|---|---|---|---|
| Display 1 | Agrandir | 300 | 96 | 112 | 2 | |
| Display 2 | Agrandir | 300 | 64 | 80 | 2 | |
| Display 3 | Agrandir | 300 | 56 | 64 | 2 | |
| Heading 1 | Agrandir | 300 | 48 | 56 | 1.5 | |
| Heading 2 | Agrandir | 400 | 40 | 48 | 1 | |
| Heading 3 | Agrandir | 500 | 32 | 40 | 1 | |
| Heading 4 | Agrandir | 500 | 24 | 32 | — | |
| Heading 5 | Inter | 600 | 20 | 30 | — | |
| Heading 6 | Inter | 600 | 16 | 24 | — | |
| Paragraph XS | Inter | 400 | 12 | 20 | — | |
| Paragraph SM | Inter | 400 | 14 | 22 | — | |
| Paragraph MD (base) | Inter | 400 | 16 | 24 | — | |
| Paragraph LG | Inter | 400 | 18 | 28 | — | |
| Paragraph XL | Inter | 400 | 20 | 30 | — | |
| Paragraph Semibold XS–XL | Inter | 600 | 12–20 | 20–30 | — | semibold variants of above |
| Link XS–XL | Inter | 400 | 12–20 | 20–30 | — | underlined |
| Nav LG Semibold / Regular | Inter | 600 / 400 | 18 | 24 | — | |
| Nav MD Semibold / Regular | Inter | 600 / 400 | 16 | 24 | — | |
| Nav SM / XS Regular | Inter | 400 | 14 / 12 | 22 | — | |
| Button XS | Inter | 600 | 12 | 24 | — | |
| Button SM | Inter | 600 | 14 | 22 | — | |
| Button MD | Inter | 600 | 16 | 24 | — | |
| Button LG / XL | Inter | 600 | 18 | 28 | — | |
| Eyebrow | GT Pressura Mono | 400 | 14 | 22 | 2 | UPPERCASE |
| Caption | GT Pressura Mono | 400 | 14 | 22 | 2 | |
| Section Header | Inter | 600 | 12 | 20 | 2 | UPPERCASE |
| Content Label | Inter | 400 | 10 | 16 | — | |

---

## 3. Spacing & Grids

### 3.1 Spacing scale (component-level)
| 2xs | xs | sm | md | lg | xl | xl-5 | 2xl |
|---|---|---|---|---|---|---|---|
| 4 | 8 | 12 | 16 | 24 | 32 | 40 | 48 |

### 3.2 Layout scale (section/page-level)
| 2xs | xs | sm | md | lg | lg-5 | xl | xl-5 | 2xl | 3xl | 4xl |
|---|---|---|---|---|---|---|---|---|---|---|
| 4 | 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64 | 72 | 96 |

### 3.3 Size scale
4 · 8 · 16 · 24 · 32 · 40 · 48 · 56 · 64 · 72 · 80 · 88 · 96 (xs → 9xl)

### 3.4 Paragraph spacing (vertical rhythm, px)
28 · 32 · 36 · 40 · 48 · 64 · 80 · 96 · 112 · 128 (space-1 → space-10)

> **Grid:** the token file defines the spacing/layout scales above but not an explicit column grid. The page grid (columns, gutters, max-width, breakpoints) lives in `dsm-bundle-20240722.min.css` and will be confirmed during component parsing. PMI uses a standard responsive 12-column layout; gutters map to the layout scale (typically 24–32px).

---

## 4. Radii, Borders & Shadows

**Border radius:** sm 2 · md 4 · lg 8 · xl 16 · 2xl 24 · circle 50%. (Cards use `lg` = 8px.)
**Border width:** none 0 · xs 1 · sm 2 · md 4 · lg 8.

**Shadows (elevation):**
| Token | Value |
|---|---|
| sm | `0 2px 4px rgba(0,0,0,0.08)` |
| md | `0 4px 16px rgba(0,0,0,0.10)` |
| lg | `0 12px 16px rgba(0,0,0,0.10)` |
| xl | `0 16px 48px rgba(0,0,0,0.18)` |

**Focus rings (blurs/glows):**
- Default: `0 0 0 3px #fff, 0 0 0 5px #000` (white gap + black ring)
- Inverted: `0 0 0 3px #000, 0 0 0 5px #fff`
- Error: `0 0 0 3px #fff, 0 0 0 5px #c80029`
- Success: `0 0 0 3px #fff, 0 0 0 5px #43a83e`

*(No blur/backdrop-filter effects are defined as tokens; card hover uses shadow `lg` + `rgba(0,0,0,0.03)` overlay.)*

---

## 5. Motion (bonus)

**Durations:** instant 15ms · very-fast 150 · faster 200 · fast 235 · almost-normal 270 · normal 300 · normal-slow 350 · ultra-slow 750.
**Easing:** ease-in-out `cubic-bezier(.17,0,.67,1)` · ease-in `(.33,0,.83,.83)` · ease-out `(0,0,.58,1)` · ease-out-fun `(.32,.63,.6,1)` · ease-out-back `(.3,-.05,.7,-.5)` · ease-in-back `(.45,1.45,.8,1)`.

---

## 6. Component tokens (from token file)

These component-specific tokens were defined directly in the DSM token file. Full visual specs for each component follow in **Section 7** (parsed from the component stylesheets).

**Buttons:** font Inter / weight 600 / colour white; sizes xs 12px, sm 14px, md·lg 16px text.
**Cards:** bg white, radius `lg` (8px), shadow `md` default → `lg` on hover, hover overlay `rgba(0,0,0,0.03)`, border none.
**Toggle:** off track `gray-400` (hover `gray-500`, disabled `gray-300`); on track `primary-500` (disabled `primary-300`); knob white.
**Alerts:** info/primary/danger/warning/success background + fill pairs (see §1.3).
**Dividers:** width `sm` (2px), colour `gray-200`.
**Social buttons:** Twitter `#1377b4`, LinkedIn `#0065c9`, Facebook `#1671e5`.

---

## 7. Reusable Components — detailed specs

> _In progress — being parsed from `sharedComponentFactory.css` and `idp.min.css`._
> Will cover: Badges · Button groups · Buttons · Checkboxes · Dropdowns · Inputs · Multi-selects · Progress indicators · Radio groups · Selects · Sliders · Tags · Toggles · Tooltips.
