# Share images

`public/og/cs.png` and `public/og/en.png` are the Open Graph images that
LinkedIn, Slack and other apps show when someone shares www.sivak.ai or
www.sivak.ai/en, `public/og/ai-skoleni.png` is the one for www.sivak.ai/ai-skoleni and
`public/og/en-ai-training.png` the one for its English twin www.sivak.ai/en/ai-training.
`src/components/HomePage.astro` and `src/components/landing/TrainingPage.astro` point the page metadata at them.
When an image changes, bump the `?v=` query on its URL there (the homepage images are at `?v=2`), because
LinkedIn and Slack cache share images by URL.

They are screenshots of `og-cs.html`, `og-en.html`, `og-ai-skoleni.html` and `og-en-ai-training.html` in this folder. To change
the text, edit the HTML, serve the repository root over HTTP (the pages load
the logo from `public/brand/` and the fonts from Google Fonts), open each page
in a 1200 × 630 viewport, and save a PNG screenshot over the matching file in
`public/og/`.

For example, from the repository root (Chrome headless; this reproduces `ai-skoleni.png` byte for byte):

```sh
python3 -m http.server 8765 --bind 127.0.0.1 &
google-chrome --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 \
  --virtual-time-budget=8000 --screenshot=public/og/en-ai-training.png \
  http://127.0.0.1:8765/design/og/og-en-ai-training.html
```
