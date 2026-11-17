# Share images

`public/og/cs.png` and `public/og/en.png` are the Open Graph images that
LinkedIn, Slack and other apps show when someone shares www.sivak.ai or
www.sivak.ai/en. Every page of a language uses that language's image;
`src/components/site/Shell.astro` points the page metadata at them.
When an image changes, bump the `?v=` query on its URL there (the homepage images are at `?v=4`), because
LinkedIn and Slack cache share images by URL.

They are screenshots of `og-cs.html` and `og-en.html` in this folder. To change
the text, edit the HTML, serve the repository root over HTTP (the pages load
the logo from `public/brand/` and Archivo from `public/fonts/`), open each page
in a 1200 × 630 viewport, and save a PNG screenshot over the matching file in
`public/og/`.

For example, from the repository root (Chrome headless):

```sh
python3 -m http.server 8765 --bind 127.0.0.1 &
google-chrome --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 \
  --virtual-time-budget=8000 --screenshot=public/og/en.png \
  http://127.0.0.1:8765/design/og/og-en.html
```
