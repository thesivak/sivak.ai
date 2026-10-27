# Logo sivak.ai — Průchod

The user selected concept 3 (Průchod) on 11 October 2026. The original ImageGen
concept is preserved in `pruchod-reference.png`.

The doorway symbol was reconstructed with straight segments and rounded outer
corners. The lettering, including the circular dots, was converted to vector
outlines from the approved image. The SVGs contain no embedded bitmap or fonts.

The shared inline geometry lives in `src/components/logo.ts`. The site header
and footer use the full logo, and the contact section draws the doorway symbol as
a hairline outline. The website icons (`public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`,
`icon-192.png`, `icon-512.png`, ivory mark on navy) use the same doorway symbol; they are linked from
`src/layouts/Base.astro` with `?v=2` and listed in `public/site.webmanifest`.

Standalone exports have transparent backgrounds:

- `public/brand/logo.svg` — navy logo for light backgrounds.
- `public/brand/logo-light.svg` — ivory logo for dark backgrounds.
- `public/brand/mark.svg` — the standalone doorway symbol.

The full logo viewBox is `0 0 993 272`; the symbol viewBox is `0 0 178 272`.
The inline version inherits its color via `currentColor`.

The translated descriptor stays as accessible HTML text below the outlined
letters. Its left edge follows the wordmark's x=233 offset in the full viewBox.
It wraps onto two lines on narrow screens.

For source reproduction, the reference was thresholded to monochrome at 50%,
then trimmed to 993 × 272 pixels at offset +273+373. The wordmark was cropped at
+200+0 to 793 × 272 and traced using Potrace 1.16 with `--flat`, `--turdsize 10`,
and `--opttolerance 0.5`. The mark was redrawn as a compact geometric path.

When changing the shared geometry, update the standalone SVGs and the icon
together. These are prepared source assets; production publication is a
separate deployment step.
