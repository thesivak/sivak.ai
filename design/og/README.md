# Share images

`public/og/cs.png` and `public/og/en.png` are the Open Graph images that
LinkedIn, Slack and other apps show when someone shares www.sivak.ai or
www.sivak.ai/en. `src/app/[lang]/layout.tsx` points the page metadata at them.

They are screenshots of `og-cs.html` and `og-en.html` in this folder. To change
the text, edit the HTML, serve the repository root over HTTP (the pages load
the logo from `public/brand/` and the fonts from Google Fonts), open each page
in a 1200 × 630 viewport, and save a PNG screenshot over the matching file in
`public/og/`.
