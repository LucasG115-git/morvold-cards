# PMI.org Design System — Extract

> ⚠️ **This whole folder was generated in the wrong project directory by mistake.** It is self-contained — move the entire `PMI-Design-System-Extract/` folder wherever it belongs. Nothing here depends on the surrounding project.

Extracted from the live **PMI.org** stylesheets for use in building the **PMI-LOC** website design in Figma.

## What's here

```
PMI-Design-System-Extract/
├─ README.md                      ← you are here
├─ DESIGN-SYSTEM-SPEC.md          ← human-readable spec (colors, type, spacing, shadows, grid, components)
├─ tokens/
│  └─ pmi-tokens.w3c.json         ← W3C / Tokens Studio design tokens (import into Figma)
├─ icons/                         ← exported SVG icons (in progress)
└─ raw-css/                       ← original source stylesheets (reference)
   ├─ pmi-dsm-tokens-17.1.1.min.css   (THE token file — colors, type, spacing, shadows)
   ├─ sharedComponentFactory.css      (component styles)
   ├─ idp.min.css                     (login/form control styles)
   └─ dsm-bundle-20240722.min.css     (layout/grid bundle)
```

**Source of truth:** PMI Design System Manager (DSM) **v17.1.1**.

## How to import the tokens into Figma

1. In Figma, install the free **Tokens Studio for Figma** plugin.
2. Open the plugin → **Tools → Load from file / Import** → select `tokens/pmi-tokens.w3c.json`.
3. The plugin creates all color, spacing, radius, shadow, and typography tokens. Use **"Create styles"** / **"Create variables"** in the plugin to push them into the Figma file as native Styles + Variables.
4. Colors, spacing, radii → **Variables**. Typography + shadows → **Styles**.

> Alternative: the JSON is also close enough to Figma's native **Variables import** format for simple color/number tokens, but Tokens Studio handles the composite typography/shadow tokens far better. Use Tokens Studio.

## ⚠️ Fonts (important)

The system uses three typefaces. Two are **commercial/licensed** and are NOT included here:

| Font | Role | Availability |
|---|---|---|
| **Agrandir** | Display + headings (H1–H4) | Commercial (Displaay Type Foundry) — must be licensed/installed |
| **Inter** | Body, UI, nav, buttons | **Free** (Google Fonts) |
| **GT Pressura Mono** | Eyebrows, captions | Commercial (Grilli Type) — must be licensed/installed |

If PMI-LOC doesn't have Agrandir / GT Pressura licenses, substitute visually-close free fonts in Figma (e.g. a geometric sans for Agrandir, a mono like *Roboto Mono* / *Space Mono* for GT Pressura) — the token *styles* will still apply; only the font file changes.

## Status

- [x] Colors, typography, spacing, radii, shadows, motion → `tokens/pmi-tokens.w3c.json` + `DESIGN-SYSTEM-SPEC.md`
- [x] Component tokens (button, toggle, card, alert, focus) captured from token file (token-exact)
- [x] All 14 component specs derived → `COMPONENTS-SPEC.md` (token-exact where possible, house-style derived otherwise, clearly marked)
- [ ] **Icons** — needs a source. The downloaded files only reveal that PMI's login uses **Font Awesome**; the main-site DSM icon set is not in this CSS. See "Icons" below.
- [ ] **Native Figma build** — pending Figma connection authorization.

### Icons — what I need
Icons are SVG assets, not tokens, so they can't be pulled from the token CSS. To get PMI's actual icons, pick one:
1. If PMI uses **Font Awesome** across the site, PMI-LOC can just use the Font Awesome library directly in Figma (there's a free FA plugin).
2. Otherwise, save the site's **icon sprite / icon font** (look in DevTools → Network for an `.svg` sprite or `icons.woff2`) and drop it in `icons/`, or
3. Save a page that shows the icons ("Webpage, Complete") and I'll extract the SVGs.

### Grid
The token file defines spacing/layout scales (see spec §3) but no explicit column grid; the downloaded bundle doesn't contain container/breakpoint rules either. Recommended Figma grid: 12 columns, 24–32px gutters (layout `md`/`lg`), 1280px max content width — adjust once a live page confirms.
