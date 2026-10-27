# Share images

`public/og/cs.png` and `public/og/en.png` are the Open Graph images that
LinkedIn, Slack and other apps show when someone shares www.sivak.ai or
www.sivak.ai/en, and `public/og/ai-skoleni.png` is the one for www.sivak.ai/ai-skoleni.
`src/components/HomePage.astro` and `src/pages/ai-skoleni.astro` point the page metadata at them.

They are screenshots of `og-cs.html`, `og-en.html` and `og-ai-skoleni.html` in this folder. To change
the text, edit the HTML, serve the repository root over HTTP (the pages load
the logo from `public/brand/` and the fonts from Google Fonts), open each page
in a 1200 × 630 viewport, and save a PNG screenshot over the matching file in
`public/og/`.
