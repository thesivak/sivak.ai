# sivak.ai

Company website of sivak.ai (TheSivak s.r.o.): Czech at `/`, English at `/en`, and the
Czech-only Google Ads landing page `/ai-skoleni` with an enquiry form.

Built with [Astro](https://astro.build) and deployed to **Cloudflare Workers with static assets**.

## Architecture

```
Request ─▶ Cloudflare
           ├─ static asset (HTML, CSS, fonts, images, vCards) ─▶ served directly, no Worker run
           └─ "/", "/en", "/en/", "/cs*", "/api/*", "/admin/*"   (assets.run_worker_first)
                 ─▶ src/worker.ts
                      ├─ language redirects (src/lib/lang-routing.ts)
                      └─ Astro handler ─▶ prerendered page from the asset store
                                        └─ on-demand routes: POST /api/poptavka, /admin/poptavky(.csv)
                                             ├─ D1 binding DB (enquiries, rate limit)
                                             ├─ Turnstile siteverify
                                             └─ e-mail: EMAIL send_email binding ▸ Resend ▸ log
```

**Why Workers static assets, not Pages:** it is what Cloudflare recommends for new projects and
what `@astrojs/cloudflare` v13+ targets; Pages gets no new features. One Worker serves the static
pages and the few dynamic routes, the language redirect runs in front of the static `/` (Pages
would need Functions plus `_routes.json` for the same), and D1, Email Service, Observability and
Workers Builds all attach to the same Worker.

Content pages are prerendered at build time (`output: "static"`); only `src/pages/api/*` and
`src/pages/admin/*` set `prerender = false` and run on the Worker.

### Language behaviour (same as the Next.js site)

| Request | Response |
| --- | --- |
| `/` with cookie `lang=en`, or without the cookie from a browser whose `Accept-Language` lists neither cs nor sk | 307 → `/en` |
| `/` without `Accept-Language` (crawlers), Czech/Slovak browsers, cookie `lang=cs` | 200 Czech |
| `/?lang=…`, `/en?lang=…` (the language switch links), `lang` = `cs` or `en` | 307 to the same URL without `lang`, sets `lang` cookie for a year |
| `/cs`, `/cs/*` | 308 → `/`, `/*` |
| `/en/` | 308 → `/en` |

Only the home page is redirected by language. `/ai-skoleni` is Czech only and is never sent to
English; `/en/ai-skoleni` is a 404 on purpose: the campaign targets Czech searches, and an English
page with no English campaign would be untranslated duplicate content to maintain.

### Where things live

| Path | What |
| --- | --- |
| `src/content/home/{cs,en}.yaml` | Home page copy (structured: agents, steps, spec tables, manifest) |
| `src/content/faq/{cs,en,ai-skoleni}/*.md` | FAQ entries, one Markdown file per question |
| `src/content/landing/ai-skoleni.yaml` | Landing page copy |
| `src/content.config.ts` | Schemas for all of the above (the build fails on missing or misspelt fields) |
| `src/lib/site.ts` | Company facts, people, `MIREK_LINKEDIN_URL` (TODO), `PRIVACY_POLICY_URL` (TODO), GA ID |
| `src/components/`, `src/components/sections/` | Home page components (ported 1:1 from React) |
| `src/components/landing/` | Landing page sections, the enquiry form and its script |
| `src/styles/global.css` | The original stylesheet, unchanged; `fonts.css` self-hosts the same font files |
| `src/styles/landing.css` | Landing page additions, same tokens |
| `src/lib/enquiry/fields.ts` | Form fields, limits, consent text/version, validation (browser and server) |
| `src/lib/server/*` | Enquiry handler, D1, rate limit, Turnstile, notification, admin auth, CSV |
| `migrations/` | D1 schema (`wrangler d1 migrations apply`) |
| `wrangler.jsonc` | Worker config: assets, D1 binding (placeholder id), vars, commented-out `send_email` |
| `docs/` | Migration inventory and parity checklist |
| `design/` | Brand and OG image sources |

Czech copy gets no-break spaces after one-letter prepositions automatically (`src/lib/czech.ts`).

## Local development

Requires **Node.js ≥ 22.23.4** (Astro 7; `.nvmrc` says 24).

```sh
npm install
cp .dev.vars.example .dev.vars        # Worker variables and secrets; set ADMIN_USER/ADMIN_PASSWORD to try the admin
cp .env.example .env                  # optional: PUBLIC_* build-time keys
npm run db:migrate:local              # builds once, then creates the tables in the local D1 (.wrangler/state)

npm run dev                           # Astro dev server on http://localhost:4321 (runs in workerd, local D1)
npm run preview                       # production build served by `wrangler dev --local` on http://localhost:8787
npm run check && npm run lint         # astro check (TypeScript) and ESLint
```

`npm run preview` is the closest to production: the same Worker, the static asset routing from
`wrangler.jsonc`, a local D1 database and the variables from `.dev.vars`. Stop it before running
another build.

Useful local checks:

```sh
curl -I -H 'Accept-Language: en' http://localhost:8787/          # 307 → /en
npx wrangler d1 execute sivak-ai --local --command "SELECT * FROM enquiries"
open http://localhost:8787/admin/poptavky                         # credentials from .dev.vars
```

To try Turnstile locally, use Cloudflare's test keys: `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`
in `.env` and `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA` in `.dev.vars`.

## Environment variables and secrets

Build-time (public, inlined into the static pages; set in `.env` locally and as **build variables**
in Workers Builds):

| Name | Purpose |
| --- | --- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget on the form. Empty = no widget. |
| `PUBLIC_GOOGLE_ADS_ID` | Google Ads tag ID, `AW-…`. Empty = no Ads tag and no conversion. |
| `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Label of the conversion action (`send_to` = `AW-…/label`). |

Runtime (Worker). Non-secret values are in `wrangler.jsonc` → `vars`; secrets are set with
`wrangler secret put NAME` (locally in `.dev.vars`):

| Name | Kind | Purpose |
| --- | --- | --- |
| `SITE_ENV` | var | `production` (wrangler.jsonc) or `development` (.dev.vars). Anything but `development` counts as production. |
| `ENQUIRY_NOTIFY_TO` | var | Comma-separated recipients, default `mirek@sivak.ai,matous@sivak.ai` |
| `ENQUIRY_FROM_EMAIL` | var | Sender, on a domain verified for the chosen e-mail channel (TODO) |
| `NOTIFY_DISABLED` | var | `1` = kill switch: never send, log only |
| `TURNSTILE_SECRET_KEY` | secret | Turnstile server-side verification |
| `IP_HASH_SALT` | secret | Salt for the IP hash (rate limit, `ip_hash` column); any long random string |
| `RESEND_API_KEY` | secret | Resend, if the Cloudflare Email Service binding isn't used |
| `ADMIN_USER`, `ADMIN_PASSWORD` | secret | HTTP Basic auth for `/admin/*`; without both the admin is a 404 |
| `DB` | D1 binding | Enquiries and rate limit |
| `EMAIL` | send_email binding | Cloudflare Email Service (commented out in wrangler.jsonc) |

## The enquiry form

`POST /api/poptavka` (`src/lib/server/enquiry.ts`), in this order:

1. **Honeypot** (`website` field): filled → answered as success, nothing stored.
2. **Rate limit**: at most 5 submissions per IP hash in 10 minutes (D1 table `enquiry_attempts`,
   in-memory without D1). The IP is never stored, only `sha256(IP_HASH_SALT:ip)`.
3. **Validation** (`src/lib/enquiry/fields.ts`, the same code the browser runs): name, company,
   e-mail and consent required; phone optional but checked; participants 1–500; length limits.
4. **Turnstile** siteverify. Without `TURNSTILE_SECRET_KEY` the check is skipped with a logged
   warning **only when `SITE_ENV=development`**; in production the form answers 503 until it is set.
5. **D1** insert with consent time, consent wording version (`CONSENT_VERSION`), `utm_*`, `gclid`,
   landing URL, user agent and IP hash. Without the `DB` binding the enquiry is not stored (error
   log in production) and the e-mail/log is the only copy.
6. **Notification** (after the response, `waitUntil`): see below.

With JavaScript the form submits with `fetch`, shows errors next to the fields and the result in an
`aria-live` region, then pushes `ai_skoleni_lead` to `dataLayer` and, if both `PUBLIC_GOOGLE_ADS_*`
are set, `gtag('event', 'conversion', { send_to })`. Without JavaScript the browser validates the
fields natively, posts the form and is redirected (303) to `/ai-skoleni/odeslano`, or gets a short
error page. Campaign parameters are copied from the landing URL into hidden fields (and kept in
`sessionStorage` for the visit); without JavaScript the server reads them from the `Referer`.

Same-origin is enforced by Astro's `security.checkOrigin` (cross-site form posts get 403).

### E-mail notification

`src/lib/server/notify.ts` picks the first available channel:

1. **Cloudflare Email Service** — the `EMAIL` `send_email` binding
   (`env.EMAIL.send({ from, to, replyTo, subject, html, text })`). Sending to verified destination
   addresses is free, also on Workers Free, but requires the sivak.ai zone on Cloudflare DNS and
   both recipients verified as Email Routing destination addresses. Enable it by uncommenting
   `send_email` in `wrangler.jsonc` after the DNS cutover.
2. **Resend** HTTP API — `RESEND_API_KEY`, with `ENQUIRY_FROM_EMAIL` on a domain verified in Resend.
3. **Log only** — the enquiry summary goes to the Worker log (Observability).

Nothing is sent when `SITE_ENV=development` (local dev logs instead), when `NOTIFY_DISABLED=1`, or
while `ENQUIRY_FROM_EMAIL`/`ENQUIRY_NOTIFY_TO` are empty. User input is HTML-escaped in the e-mail;
Reply-To is the enquirer's address.

### Admin: `/admin/poptavky`

Enquiries newest first (500 shown) and `/admin/poptavky.csv` with all of them (UTF-8 with BOM for
Excel, every cell quoted, cells starting with `= + - @` prefixed with `'` against CSV injection).
Protected by HTTP Basic auth (`ADMIN_USER`/`ADMIN_PASSWORD`, constant-time comparison); missing
secrets → 404, never open. Responses carry `noindex`, `no-store`; `/admin/` and `/api/` are
disallowed in robots.txt and not in the sitemap. Without D1 the page says "DB není nakonfigurovaná".

**Recommended:** put **Cloudflare Access** in front of `/admin/*` (Zero Trust → Access →
Applications → self-hosted, domain `www.sivak.ai/admin/*`, policy: e-mails of Mirek and Matouš,
one-time PIN or Google login). Keep Basic auth as the second layer.

## Deploy and cutover from Vercel

Nothing below has been done yet. All commands need a logged-in `wrangler` (`npx wrangler login`)
on the sivak.ai Cloudflare account.

1. **D1**: `npx wrangler d1 create sivak-ai` → put the printed `database_id` into `wrangler.jsonc`
   (replacing the zero UUID), then `npm run db:migrate:remote`.
2. **Turnstile**: Cloudflare dashboard → Turnstile → Add widget for `www.sivak.ai` (and `sivak.ai`,
   plus the `*.workers.dev` preview hostname if wanted), mode Managed. Site key →
   `PUBLIC_TURNSTILE_SITE_KEY` (build variable), secret → `npx wrangler secret put TURNSTILE_SECRET_KEY`.
3. **Secrets**: `npx wrangler secret put` for `ADMIN_USER`, `ADMIN_PASSWORD`, `IP_HASH_SALT`
   (and `RESEND_API_KEY` if Resend is used).
4. **E-mail**: either
   - Cloudflare Email Service (after step 8): Email → Email Routing → enable for sivak.ai, add and
     verify `mirek@sivak.ai` and `matous@sivak.ai` as destination addresses, onboard the domain for
     Email Sending, uncomment `send_email` in `wrangler.jsonc`, set `ENQUIRY_FROM_EMAIL` (e.g.
     `poptavky@sivak.ai`); or
   - Resend: add and verify the sending domain (DNS records), create an API key, set
     `RESEND_API_KEY` and `ENQUIRY_FROM_EMAIL`.
   Until then enquiries are stored in D1 and visible in the admin; notifications only go to the log.
5. **Google Ads**: Google Ads → Goals → Conversions → create a "Submit lead form" action (website,
   manual tag) → Tag setup → "Use Google tag" shows `send_to: 'AW-XXXXXXXXX/YYYYYYYY'`. Set
   `PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX` and `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=YYYYYYYY`.
   **The customer ID 285-124-8637 shown in the Ads UI is not the tag ID** and does not work here.
   The Ads tag is configured only on `/ai-skoleni`; GA4 (`G-S98V3B32ZL`) stays on every page.
6. **Content TODOs**: `MIREK_LINKEDIN_URL` and the privacy policy (`src/pages/ochrana-osobnich-udaju.astro`,
   currently a noindex placeholder) in `src/lib/site.ts`.
7. **Worker**: Workers & Pages → Create → Import a repository (Workers Builds) with build command
   `npm run build`, deploy command `npx wrangler deploy`, Node version 24 (`NODE_VERSION=24` build
   variable), and the `PUBLIC_*` build variables. Or deploy from a machine: `npm run deploy`.
   Check the `*.workers.dev` URL: `/`, `/en`, `/ai-skoleni`, a test enquiry, the admin.
8. **DNS cutover** (if sivak.ai is not on Cloudflare DNS yet): add the zone to Cloudflare, copy all
   existing records (especially MX/SPF/DKIM for mail!), switch the nameservers at the registrar, wait
   for the zone to be active. Then Worker → Settings → Domains & Routes → add custom domains
   `www.sivak.ai` and `sivak.ai` (Cloudflare creates the DNS records and certificates; remove the old
   Vercel A/CNAME records). Redirect the apex to `www` (Rules → Redirect Rules: `sivak.ai/*` →
   `https://www.sivak.ai/${1}`, 301) to match the canonical URLs.
9. **Access** for `/admin/*` (see above).
10. **Vercel**: after the Cloudflare site has served traffic for a while, remove the domains from
    the Vercel project and delete it.

## Notes

- `design/og/*.html` are the sources of the share images in `public/og/` (see `design/og/README.md`).
- The site has no cookie banner; GA4 runs as it did on the Next.js site.
