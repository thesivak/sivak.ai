# Migration inventory: Next.js site (origin/main `ba7bf9c`)

Everything the Next.js 16 / Vercel site serves or does, recorded before the
Astro migration. The behaviour column was captured with `curl` against a
production build (`next build && next start`) of `origin/main` in `/tmp`.
`docs/parity-checklist.md` compares each item with the Astro build.

## Stack

| Item | Old implementation |
| --- | --- |
| Framework | Next.js 16.1.6 App Router, React 19.2, TypeScript |
| Styling | One hand-written stylesheet, `src/app/globals.css` (1 440 lines). Tailwind 4 and `@tailwindcss/postcss` are installed and wired into `postcss.config.mjs`, but the stylesheet never imports `tailwindcss`, so no Tailwind utilities or preflight reach the page. |
| Fonts | `next/font/google`: Jost (variable 100–900; latin, latin-ext, plus cyrillic in the Google CSS) and IBM Plex Mono 400/500 (latin, latin-ext, cyrillic, cyrillic-ext, vietnamese). Self-hosted under `/_next/static/media`, 6 latin/latin-ext files preloaded, `font-display: swap`, metric-adjusted fallbacks `Jost Fallback` and `IBM Plex Mono Fallback` (local Arial). Exposed as CSS variables `--font-jost` and `--font-plex-mono` through classes on `<html>`. |
| Hosting | Vercel (no `vercel.json`; defaults) |
| Middleware | `src/proxy.ts` (Next 16 "proxy", matcher excludes `_next`, `favicon.ico` and any path with a dot) |
| Lint | ESLint 9 with `eslint-config-next` (core-web-vitals + typescript) |

## Routes and URLs

| URL | Source | Behaviour (status) |
| --- | --- | --- |
| `/` | `src/app/[lang]/page.tsx` via proxy rewrite to `/cs` | Czech home page (200), statically prerendered |
| `/en` | same page, `lang=en` | English home page (200) |
| `/en/` | Next trailing-slash handling | 308 → `/en` |
| `/cs` | proxy | 308 → `/` |
| `/cs/` | Next trailing-slash handling | 308 → `/cs` (then 308 → `/`) |
| `/cs/<path>?<query>` | proxy | 308 → `/<path>?<query>` |
| `/?lang=en`, `/en?lang=en`, any `?lang=cs|en` | proxy | 307 to the same URL without `lang`, sets cookie `lang=<cs|en>; Path=/; Max-Age=31536000; SameSite=Lax` |
| `?lang=<other>` | proxy | ignored (normal handling) |
| `/` without cookie, `Accept-Language` lists `cs` or `sk` | proxy | 200 Czech |
| `/` without cookie, no `Accept-Language` header (crawlers) | proxy | 200 Czech |
| `/` without cookie, `Accept-Language` without cs/sk | proxy | 307 → `/en` |
| `/` with cookie `lang=cs` | proxy | 200 Czech regardless of browser |
| `/` with cookie `lang=en` | proxy | 307 → `/en` |
| `/en` with any `Accept-Language` | proxy | 200 English (no redirect back to Czech) |
| any other path, non-Czech browser | proxy | 307 → `/en/<path>` (which then 404s) |
| any other path, Czech browser | proxy rewrite | 404 (Next default not-found page) |
| `/sitemap.xml` | `src/app/sitemap.ts` | 200, see below |
| `/robots.txt` | `src/app/robots.ts` | 200, see below |
| `/icon.svg` | `src/app/icon.svg` | 200 `image/svg+xml`; linked as `/icon.svg?icon.c607bc5c.svg` |
| `/favicon.ico` | — | 404 (none exists; browsers use the SVG icon) |
| `/og/cs.png`, `/og/en.png` | `public/og/` | 200, 1200×630 share images |
| `/mirek-sivak.vcf`, `/matous-cep.vcf` | `public/` | 200, vCard 3.0, linked with `download` |
| `/brand/logo.svg`, `/brand/logo-light.svg`, `/brand/mark.svg` | `public/brand/` | 200; `logo.svg` is referenced by JSON-LD |
| `/_next/*` | Next build | JS chunks, CSS, fonts (implementation detail, not carried over) |
| `/ai-skoleni` | — | 404 today; new landing page in this branch |

There are no API routes, forms, server actions or rewrites to external hosts.

### `/sitemap.xml`

Two URLs, both with `xhtml:link` alternates `cs → https://www.sivak.ai/`,
`en → https://www.sivak.ai/en`:

| loc | changefreq | priority |
| --- | --- | --- |
| `https://www.sivak.ai/` | monthly | 1 |
| `https://www.sivak.ai/en` | monthly | 0.8 |

No `lastmod`.

### `/robots.txt`

```
User-Agent: *
Allow: /

Sitemap: https://www.sivak.ai/sitemap.xml
```

## Page structure and copy sources

Both locales render the same component tree from `src/app/[lang]/page.tsx`.
All copy comes from `src/dictionaries/{cs,en}.json` (433 lines each, identical
shape; `Dictionary = typeof en`). Czech strings pass through `czechSpacing()`
in `src/dictionaries/index.ts`: a no-break space after one-letter
prepositions/conjunctions (`v`, `k`, `a`, `s`, `z`, `o`, `u`, `i`) and before
` – ` dashes. Company facts (legal name, IČO, city, people, e-mails, phone,
vCard paths) live in `src/lib/site.ts`.

| # | Section (anchor cs / en) | Component | Dictionary key | Notes |
| --- | --- | --- | --- | --- |
| – | Skip link `#main` | page | `skipLink` | |
| – | Header | `SiteHeader.tsx` (client) | `nav`, `langSwitch` | Logo → home, 5 anchor links, language link (`/en?lang=en` or `/?lang=cs`, `hreflang`, `lang`, `title`), CTA → `#kontakt`/`#contact`. Mobile menu ≤1080 px: toggle button (`aria-expanded`, `aria-controls="site-nav"`, label open/close), closes on Escape, on link click and when the window widens past 1080 px. |
| – | Hero | `Hero.tsx` | `hero` | h1 with `\n` (pre-line) + gradient accent, lead, 80 % gain box, CTAs (contact, `#postup`/`#process`), 4 check notes |
| – | Agent console | `AgentConsole.tsx` (client) | `console` | 7 agents × 4 steps. Steps finish every 1 150 ms, result held 3 600 ms, then next agent; only animates while ≥15 % visible (IntersectionObserver); with `prefers-reduced-motion` every task is shown finished. Tabs are `aria-pressed` buttons; tab strip scrolls the active tab to the centre and fades hidden edges (`data-fade`). |
| 01 | Pravidlo 80:20 `#pravidlo-80-20` / `#80-20-rule` | `Ratio.tsx` | `ratio` | |
| 02 | Co děláme `#sluzby` / `#services` | `Services.tsx` | `services` | 4 cards with icons and tags |
| 03 | Příklady `#priklady` / `#examples` | `UseCases.tsx` | `useCases` | 8 rows + "more" link to contact |
| 04 | Jak to probíhá `#postup` / `#process` | `Process.tsx` | `process` | 4 steps |
| 05 | Kde agenti běží `#nasazeni` / `#deployment` | `Deployment.tsx` | `deployment` | cloud vs on-prem cards with spec lists |
| 06 | Bezpečnost `#bezpecnost` / `#security` | `Control.tsx` | `control` | YAML-like permission manifest + 6 items |
| 07 | Z praxe `#z-praxe` / `#case-study` | `CaseStudy.tsx` | `case` | 4 agent cards + 3 facts |
| 08 | Otázky `#otazky` / `#faq` | `Faq.tsx` | `faq` | 6 `<details>` items |
| 09 | Kontakt `#kontakt` / `#contact` | `Contact.tsx` | `contact` + `PEOPLE` | `mailto:` meeting link (to Matouš, cc Mirek, subject from dictionary), people cards with e-mail, phone (`tel:`), vCard download |
| – | Footer | `SiteFooter.tsx` | `footer`, `nav` | logo, anchor nav, e-mails, language link, legal line (§ 435 Civil Code: name, seat, IČO, register entry), `© <build year>` |

Scroll reveal (`.reveal`) and the hero entrance are pure CSS
(`animation-timeline: view()`), disabled under `prefers-reduced-motion`.

## Metadata / SEO (per locale, from `generateMetadata`)

| Tag | `/` (cs) | `/en` |
| --- | --- | --- |
| `<html lang>` | `cs` | `en` |
| `<meta charset>` | `utf-8` | same |
| viewport | `width=device-width, initial-scale=1, viewport-fit=cover` | same |
| `theme-color` | `#0B1220` | same |
| `<title>` | Next.js (history): `sivak.ai – AI agenti pro práci u počítače`; new site since 27 October 2026: `sivak.ai – AI agenti a automatizace` | Next.js (history): `sivak.ai — AI agents for computer work`; new site: `sivak.ai — AI agents and automation` |
| description | `metadata.description` (cs) | (en) |
| canonical | `https://www.sivak.ai` | `https://www.sivak.ai/en` |
| hreflang alternates | `cs → https://www.sivak.ai`, `en → https://www.sivak.ai/en`, `x-default → https://www.sivak.ai` | same |
| `og:title`, `og:description` | = title, description | |
| `og:url` | `https://www.sivak.ai` | `https://www.sivak.ai/en` |
| `og:site_name` | `sivak.ai` | |
| `og:locale` | `cs_CZ` | `en_US` |
| `og:image` (+ width 1200, height 630, alt = title) | `https://www.sivak.ai/og/cs.png` | `…/og/en.png` |
| `og:type` | `website` | |
| `twitter:card` | `summary_large_image` | |
| `twitter:title`, `twitter:description`, `twitter:image` | = title, description, OG image | |
| icon | `<link rel="icon" href="/icon.svg?icon.c607bc5c.svg" sizes="any" type="image/svg+xml">` | |
| JSON-LD | `Organization` from `organizationJsonLd()` (name, legalName, url `https://www.sivak.ai/` or `/en`, logo, IČO identifier, address Šumperk CZ (**since 1 November 2026** the seat The Flow Building, Václavské náměstí 47, Praha 1: `COMPANY.seat` in `src/lib/site.ts`), founder Mirek Sivák with jobTitle and email, sales contactPoint Matouš Čep with e-mail, phone, languages) at the end of the page body | |

OG images are screenshots of `design/og/og-{cs,en}.html` (see `design/og/README.md`).

## Analytics

Google Analytics 4, measurement ID `G-S98V3B32ZL`, on every page:
`gtag/js?id=G-S98V3B32ZL` plus the inline `gtag('js')` / `gtag('config')`
snippet, both `next/script` `afterInteractive`. No consent banner, no Google
Ads tag, no other trackers.

## Forms and API routes

None. All calls to action are `mailto:` links (meeting request to
`matous@sivak.ai` with `cc=mirek@sivak.ai`) or `tel:` links.

## HTTP headers

No custom headers (`next.config.ts` is empty). Next adds `X-Powered-By`,
`Vary: rsc, …`, `x-nextjs-*`, `Cache-Control: s-maxage=31536000` for the
prerendered pages and an `x-middleware-rewrite` on `/`. None of these are
needed on Cloudflare.

## Other repository content carried over unchanged

- `design/brand/*` (logo sources and reference), `design/og/*` (OG image sources)
- `public/brand/*`, `public/og/*`, `public/*.vcf`
- `src/app/icon.svg` (moved to `public/icon.svg`; replaced on 27 October 2026 by `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `site.webmanifest`)
