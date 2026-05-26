# Card Setu — Logo Pack

Premium brand assets for Card Setu, the NFC tap-to-share digital business card.

## Concept
A business-card silhouette with three NFC tap-arcs emanating from its top-right
corner. The arcs double as a subtle bridge metaphor for *Setu* (Sanskrit: bridge).
A single cohesive idea, no element-mixing.

## Brand colors
- Electric blue   #3B82F6
- Indigo          #6366F1
- Violet          #A855F7
- Gradient flows diagonally through the mark (blue → indigo → violet).

## Typography
- Wordmark: Inter / SF Pro Display, weight 600, letter-spacing -0.025em
- "Card" in solid color, "Setu" in the brand gradient
- Outline-to-paths before final production use

## Folders
- svg/        — Vector source for every variant
- png/        — High-resolution rasters (transparent bg where applicable)
- favicon/    — 16/32/48/64 px favicons
- mockups/    — Presentation sheets on black and white backgrounds

## File map
### Icon mark (transparent background)
- icon-mark-gradient.svg / .png   — Primary mark with gradient
- icon-mark-white.svg / .png      — Mono white (for dark UI)
- icon-mark-black.svg / .png      — Mono black (for light UI / print)

### Horizontal lockup
- lockup-horizontal-dark.svg / .png       — Gradient on black background
- lockup-horizontal-light.svg / .png      — Gradient on white background
- lockup-horizontal-mono-white.svg / .png — All white (transparent bg)
- lockup-horizontal-mono-black.svg / .png — All black (transparent bg)

### Stacked lockup
- lockup-stacked-dark.svg / .png
- lockup-stacked-light.svg / .png
- lockup-stacked-mono-white.svg / .png
- lockup-stacked-mono-black.svg / .png

### App icon (rounded square)
- app-icon-black.svg / .png      — Gradient mark on black tile
- app-icon-gradient.svg / .png   — White mark on gradient tile
- app-icon-white.svg / .png      — Gradient mark on white tile
- All 1024×1024 — drop into Xcode / Android asset catalogs and let the
  build system generate the size ladder.

### Favicon
- favicon-16.svg / .png
- favicon-32.svg / .png
- favicon-48.png
- favicon-64.png

### Mockups
- mockup-dark.svg / .png   — 1600×900 presentation, dark background
- mockup-light.svg / .png  — 1600×900 presentation, light background

## Usage notes
- Clear space around the mark: minimum padding equal to the height of the
  card body element (the rounded rectangle).
- Minimum digital size: 24px tall for the mark, 16px for the simplified favicon.
- Don't recolor the gradient, distort the geometry, add shadows/strokes, or
  place the mark on busy backgrounds where contrast suffers.
