# Parity checklist: Next.js (origin/main) → Astro on Cloudflare

Every item from `docs/migration-inventory.md`, old behaviour vs new, and how it was checked.

## How it was verified (27 October 2026)

- **Old site**: `origin/main` (`ba7bf9c`) cloned to `/tmp/sivak-old`, `npm ci && next build && next start` on port 3100.
- **New site**: `npm run build`, local D1 migrated with `wrangler d1 migrations apply sivak-ai --local`,
  served by `wrangler dev --local` (the production Worker, asset routing and bindings) on port 8787;
  spot checks also on `npm run dev`.
- **HTTP**: the same `curl` matrix (paths × `Accept-Language` × cookie) against both; status,
  `Location` and `Set-Cookie` compared; static files compared byte for byte (`cmp`).
- **HTML**: both builds' `/` and `/en` normalized (attributes sorted, scripts and asset `<link>`s
  dropped, whitespace collapsed) and diffed, `<head>` included; JSON-LD compared verbatim.
- **Rendered text**: `document.body.innerText` of both, in Chromium → identical for `/` and `/en`.
- **Screenshots**: full-page Chromium screenshots at 1440 × 900 and 375 × 812 (reduced motion, so the
  animated console is deterministic), compared pixel by pixel.
- **Behaviour**: Playwright scripts for the mobile menu, the agent console and the landing form.

## Routes and redirects

| Request | Old | New | Check |
| --- | --- | --- | --- |
| `/` (no `Accept-Language`) | 200 Czech | 200 Czech | curl ✅ |
| `/` `Accept-Language: cs-CZ` / `sk` | 200 Czech | 200 Czech | curl ✅ |
| `/` `Accept-Language: en-US` | 307 → `/en` | 307 → `/en` | curl ✅ |
| `/` en browser + cookie `lang=cs` | 200 | 200 | curl ✅ |
| `/` cs browser + cookie `lang=en` | 307 → `/en` | 307 → `/en` | curl ✅ |
| `/en` with cs browser | 200 English | 200 English | curl ✅ |
| `/en?lang=en` | 307 → `/en`, `Set-Cookie: lang=en; Path=/; Max-Age=31536000; SameSite=Lax` (+ Expires) | same (without the redundant `Expires`) | curl ✅ |
| `/?lang=cs` | 307 → `/`, cookie `lang=cs` | same | curl ✅ |
| `/?lang=de` | ignored, 200 | ignored, 200 | curl ✅ |
| `/cs` | 308 → `/` | 308 → `/` | curl ✅ |
| `/cs/` | 308 → `/cs` → 308 → `/` | 308 → `/` (one hop) | curl ✅ |
| `/cs/foo?x=1` | 308 → `/foo?x=1` | 308 → `/foo?x=1` | curl ✅ |
| `/en/` | 308 → `/en` | 308 → `/en` | curl ✅ |
| unknown path, Czech browser | 404 (Next default page) | 404 (styled bilingual page, noindex) | curl ✅ — improvement |
| unknown path, English browser | 307 → `/en/<path>` → 404 | 404 directly | curl — intentional: the language redirect now applies to `/` only, so Czech-only pages such as `/ai-skoleni` are never sent to a non-existent English URL |
| `/sitemap.xml` | 2 URLs | same 2 URLs, byte-identical, plus `https://www.sivak.ai/ai-skoleni` (priority 0.9) | diff ✅ |
| `/robots.txt` | `Allow: /` + sitemap | same plus `Disallow: /api/` and `Disallow: /admin/` | diff ✅ |
| `/icon.svg` | 200 `image/svg+xml` | 200, byte-identical | cmp ✅ |
| `/favicon.ico` | 404 | 404 | curl ✅ |
| `/og/cs.png`, `/og/en.png` | 200 | 200, byte-identical | cmp ✅ |
| `/mirek-sivak.vcf`, `/matous-cep.vcf` | 200 `text/x-vcard` | 200 `text/x-vcard`, byte-identical | cmp ✅ |
| `/brand/logo.svg`, `logo-light.svg`, `mark.svg` | 200 | 200, byte-identical | cmp ✅ |
| `/ai-skoleni` | 404 | 200 new landing page | new |
| `/ai-skoleni/odeslano`, `/ochrana-osobnich-udaju` | 404 | 200, noindex | new |
| `/en/ai-skoleni` | 404 | 404 (no English version, see README) | curl ✅ |
| `POST /api/poptavka`, `/admin/poptavky(.csv)` | — | new on-demand routes | see below |

## `<head>` and structured data (`/` and `/en`)

All compared in the normalized HTML diff: no differences apart from the items noted.

| Tag | Result |
| --- | --- |
| `<html lang>` | `cs` / `en` ✅ (the next/font class names are gone; the font variables are set on `:root` instead) |
| charset, viewport (`width=device-width, initial-scale=1, viewport-fit=cover`), `theme-color #0B1220` | identical ✅ |
| `<title>`, `description` | identical ✅ |
| canonical `https://www.sivak.ai` / `https://www.sivak.ai/en` (cs without trailing slash, as before) | identical ✅ |
| hreflang `cs`, `en`, `x-default` | identical ✅ |
| `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`, `og:image` (+ width, height, alt), `og:type` | identical ✅ |
| `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` | identical ✅ |
| icon | `<link rel="icon" href="/icon.svg" sizes="any" type="image/svg+xml">` (was `/icon.svg?icon.c607bc5c.svg`; the query was Next's cache buster) |
| font preloads | the same 6 latin / latin-ext woff2 files, now under `/fonts/` |
| JSON-LD `Organization` | identical string ✅ |
| `<meta name="next-size-adjust">`, Next's hidden `<div>` and RSC payload scripts | gone (Next internals) |

## Content, layout and assets

| Item | Result |
| --- | --- |
| All copy (cs, en) | moved to `src/content/home/*.yaml` + `src/content/faq/*/*.md`; a YAML round-trip test confirmed the data equals the old JSON; rendered `innerText` identical ✅ |
| Czech no-break spaces (one-letter words, dashes) | kept (`src/lib/czech.ts`), visible in identical `innerText` ✅; one nbsp that lived in the JSX (`IČO 23010282`) was found by the text comparison and restored |
| Section order, anchors (`#sluzby`, `#postup`, … / `#services`, …), skip link | identical HTML ✅ |
| Stylesheet | `src/app/globals.css` → `src/styles/global.css`, unchanged (git rename, 100 %) ✅ |
| Fonts | the exact woff2 files, `@font-face` rules, unicode ranges and metric-matched Arial fallbacks that next/font emitted ✅ |
| Tailwind | the stylesheet never imported Tailwind, so nothing reached the page; the unused dependency is removed |
| Screenshots `/` desktop 1440 | same page height (10 408 px); 463 of 15 M pixels differ (0.003 %), all sub-pixel anti-aliasing of glyph edges ✅ |
| `/` mobile 375 | same height (15 971 px); 0.006 % anti-aliasing ✅ |
| `/en` desktop / mobile | same heights (10 680 / 16 083 px); 0.003 % / 0.005 % anti-aliasing ✅ |
| Links: header/footer anchors, language switch (`hreflang`, `lang`, `title`), `mailto:` meeting link (to Matouš, cc Mirek, subject), `tel:`, vCard `download` | identical HTML ✅ |
| Footer year | build year, as before |

## Behaviour

| Behaviour | Result |
| --- | --- |
| Mobile menu: opens/closes, `aria-expanded`, label "Otevřít/Zavřít menu", icon swap, closes on Escape, on link click and when widened past 1080 px | Playwright ✅ (vanilla script instead of React) |
| Agent console: steps every 1.15 s, result held 3.6 s, next agent; tab click switches agent and centres the tab; `aria-pressed`; edge fades; only animates when ≥15 % visible; reduced motion shows finished tasks | Playwright ✅; initial HTML identical to React's server render |
| Scroll reveal and hero entrance | pure CSS, unchanged ✅ |
| Google Analytics 4 `G-S98V3B32ZL` on every page | same `gtag/js` + config snippet, now plain `async` script at the end of `<body>` ✅ |

## HTTP headers

| Header | Old | New |
| --- | --- | --- |
| `Content-Type` of pages | `text/html; charset=utf-8` | same |
| `Vary` on `/` | `rsc, …` (Next) | `Accept-Language, Cookie` (the response depends on them) |
| `Cache-Control` | `s-maxage=31536000` on pages (Vercel) | Cloudflare defaults for HTML; `public, max-age=31536000, immutable` for hashed `/_astro/*` |
| `X-Powered-By: Next.js`, `x-nextjs-*`, `x-middleware-rewrite` | present | gone |

## New functionality (Part 2 and 3), verified locally

| Check | Result |
| --- | --- |
| `/ai-skoleni` at 1440 and 375 px | screenshots reviewed; layout fixed where needed (agenda grid, stylesheet order) |
| `/ai-skoleni` hero (v2) at 1440, 960 and 390 px: headline, trainer card (Miroslav Sivák), price 35 000 Kč, one button to the form; at 390 px headline, trainer and button fit the first screen | headless Chromium screenshots ✅ |
| `/ai-skoleni` has no phone number: no call card next to the form, none in the success message, `/ai-skoleni/odeslano` or the JSON-LD; the enquiry form is the only contact path | grep of the built HTML ✅ |
| Landing `<head>`: title (63 chars), description (151), canonical, OG/Twitter with `/og/ai-skoleni.png`, `Course` + `FAQPage` JSON-LD | ✅ |
| Form with JS: empty submit → field errors, `aria-invalid`, focus on first error, status in `aria-live`; phone checked on blur | Playwright ✅ |
| Form with JS + Turnstile test keys: widget token, server siteverify, row in local D1 with `utm_*` + `gclid` from the landing URL, success message focused, `dataLayer` `ai_skoleni_lead`, `gtag('event','conversion',{send_to:'AW-…/…'})` queued | Playwright + `wrangler d1 execute` ✅ |
| Without JS (curl form post): 303 → `/ai-skoleni/odeslano`; invalid → HTML error page; UTM/gclid taken from `Referer` | curl ✅ |
| Honeypot → fake success, nothing stored | curl ✅ |
| Cross-origin POST → 403 | curl ✅ |
| 6th submission from one IP within 10 min → 429 | curl ✅ |
| 10 and 30 parallel submissions from one IP → exactly 5 admitted, the rest 429; attempts older than 23 h pruned | curl + `wrangler d1 execute` ✅ |
| Body over 32 KiB sent chunked, without `Content-Length` → 413 | curl ✅ |
| `Cookie: lang=%` (malformed) → no preference: Czech homepage 200, or `/en` by `Accept-Language` | curl ✅ |
| Hourly cron (`scheduled`): attempts > 23 h and enquiries > 24 months deleted | local explorer `scheduled` endpoint ✅ |
| Secret set, no token → 400 | curl ✅ |
| Admin: no credentials → 401 with `WWW-Authenticate`; wrong → 401; right → list; `X-Robots-Tag: noindex`, `no-store` | curl ✅ |
| CSV: UTF-8 BOM, quoted cells, `=HYPERLINK(…)` and `+…` prefixed with `'`, multi-line note kept | curl ✅ |
| No D1 binding (any mode) → 503 "zkuste to prosím znovu později" and a config-error log, nothing claims success | separate `wrangler dev` config without D1 ✅ |
| D1 without tables: rate limit fails → 503 in production and preview; development lets it through, then the failed insert → 503 | `wrangler dev` with an empty local D1 ✅ |
| Production without `IP_HASH_SALT`, without a Turnstile secret, or with the test secret → 503 + config-error log; development without the salt → stored with `ip_hash` NULL, no rate limit | `--var` overrides ✅ |
| Preview build (`CLOUDFLARE_ENV=preview`, test keys, `IP_HASH_SALT` set) → row in the local `ai-skoleni-nahled` DB with `source = 'ai-skoleni-preview'`, none in `sivak-ai`; noindex header | ✅ |
| Build without `PUBLIC_TURNSTILE_SITE_KEY` → "Formulář je dočasně nedostupný" notice instead of the form, build warning | ✅ |
| Logs: only id, reason and error class/code, no personal data | `wrangler dev` output reviewed ✅ |
| No `@sivak.ai` / `mailto:` in `/ai-skoleni`, `/ai-skoleni/odeslano` or the form's server messages; homepage footer keeps the addresses | grep of `dist/` ✅ |
| Production, no admin secrets → admin 404 | `SITE_ENV=production` config ✅ |
| Production + `EMAIL` binding (wrangler's local simulation, nothing sent): Email Service preferred over Resend, user input HTML-escaped | ✅ |
| Production + Resend with an invalid key and `.invalid` recipients: API rejects (401) | ✅ (no e-mail could be delivered); since then the log carries only id, channel and `HTTP_401` (not re-run) |
| `NOTIFY_DISABLED=1` in production → no send, log only | ✅ |
| `SITE_ENV=development` → never sends | ✅ |
| `astro check`, ESLint, `astro build` | 0 errors ✅ |

## Known differences (intentional)

- The language redirect runs on `/` only (was: every path). Unknown paths 404 directly; Czech-only
  pages are never redirected to English.
- `/cs/` redirects to `/` in one hop instead of two.
- robots.txt disallows `/api/` and `/admin/`; the sitemap lists `/ai-skoleni`.
- 404 page is a styled bilingual page instead of Next's default.
- `Set-Cookie` for the language has `Max-Age` without the equivalent `Expires`.
