# sivak.ai

Company website of sivak.ai (TheSivak s.r.o.): Czech at `/`, English at `/en`, and the
Czech-only Google Ads landing page `/ai-skoleni` with an enquiry form.

Built with [Astro](https://astro.build) and deployed to **Cloudflare Workers with static assets**.

## Architecture

```
Request ─▶ Cloudflare
           ├─ static asset (HTML, CSS, fonts, images, vCards) ─▶ served directly, no Worker run
           └─ "/", "/en", "/cs*", "/*/", "/*.html", "/api/*", "/robots.txt"   (assets.run_worker_first)
                 ─▶ src/worker.ts
                      ├─ 308 to the canonical URL (src/lib/routing.ts)
                      └─ Astro handler ─▶ prerendered page from the asset store
                                        └─ on-demand route: POST /api/poptavka
                                             ├─ D1 binding DB (enquiries, rate limit)
                                             ├─ Turnstile siteverify
                                             └─ e-mail: EMAIL send_email binding (Cloudflare Email Service)
           cron "0 * * * *" ─▶ src/worker.ts scheduled(): retention cleanup in D1
```

**Why Workers static assets, not Pages:** it is what Cloudflare recommends for new projects and
what `@astrojs/cloudflare` v13+ targets; Pages gets no new features. One Worker serves the static
pages and the few dynamic routes, the canonical-URL redirects run in front of the static pages (Pages
would need Functions plus `_routes.json` for the same), and D1, Email Service, Observability and
Workers Builds all attach to the same Worker.

Content pages are prerendered at build time (`output: "static"`); only `src/pages/api/*` sets
`prerender = false` and runs on the Worker.

### URLs and languages

Czech lives at `/`, English at `/en`. Pages that exist in both languages are listed in
`src/i18n/pages.ts`: `/` ↔ `/en`, `/ai-agenti` ↔ `/en/ai-agents`, `/ai-automatizace` ↔
`/en/ai-automation`, `/pilotni-projekt` ↔ `/en/pilot-project`. That list drives the language switch,
hreflang, the sitemap and the `?lang=` compatibility redirect.

| Request | Response |
| --- | --- |
| `/`, whatever `Accept-Language` or cookie | 200 Czech. There is no language redirect: crawlers and browsers get the same page, no `Vary` needed. |
| `/x/`, `/x.html`, `/x/index.html`, `/index.html`, `/en/` | 308 to `/x`, `/` or `/en`, query string kept |
| `/cs`, `/cs/*` | 308 → `/`, `/*` (the old Czech prefix) |
| `/?lang=en`, `/en?lang=cs` (old switch links) | 308 to that language's version of the page, without the parameter; sets the `lang` cookie |

The asset server would redirect these variants with 307 (`html_handling: auto-trailing-slash`), so
the Worker takes them first: `run_worker_first` lists `"/*/"` and `"/*.html"` (`*` matches across
`/`), plus `/`, `/en` and `/cs*` for the old prefix and parameter. Pages, fonts and images otherwise
never run the Worker. `src/lib/routing.ts` does the redirects.

The language switch (header, footer) links straight to the counterpart (`/` ↔ `/en`, each service
page to its twin; `/ai-skoleni`, Czech only, to `/en`) and stores the choice in the `lang` cookie from
JavaScript. Instead of a redirect, pages with a twin show a small suggestion after they have rendered
(`src/components/LanguageHint.astro`, `language-hint.ts`): "Switch to English" on Czech pages when the
browser lists neither cs nor sk, "Přepnout do češtiny" on English pages when it does. A stored choice
wins over the browser; using or closing the suggestion stores one. It is fixed under the header (no
layout shift) and appears after load (never the LCP element).

`/ai-skoleni` is Czech only; `/en/ai-skoleni` is a 404 on purpose: the campaign targets Czech
searches, and an English page with no English campaign would be untranslated duplicate content to
maintain.

### Service pages

`/ai-agenti`, `/ai-automatizace`, `/pilotni-projekt` and their English twins come from
`src/content/topic/{cs,en}.yaml` (twins under the same `key`), rendered by
`src/components/TopicPage.astro` through `src/pages/[topic].astro` and `src/pages/en/[topic].astro`.
Their copy only rearranges what the homepage and its FAQ already say; the schema requires a
140–155-character description and 3–4 FAQ entries. Each has Service and FAQPage JSON-LD pointing at
the homepage's organisation (`ORGANIZATION_ID` in `src/lib/site.ts`).

### Where things live

| Path | What |
| --- | --- |
| `src/content/home/{cs,en}.yaml` | Home page copy (structured: agents, steps, spec tables, manifest) |
| `src/content/faq/{cs,en,ai-skoleni}/*.md` | FAQ entries, one Markdown file per question |
| `src/content/landing/ai-skoleni.yaml` | Landing page copy |
| `src/content.config.ts` | Schemas for all of the above (the build fails on missing or misspelt fields) |
| `src/lib/site.ts` | Company facts, people, `MIREK_LINKEDIN_URL` (TODO, hidden while a placeholder), `PRIVACY_POLICY_URL`, GA ID |
| `src/components/`, `src/components/sections/` | Home page components (ported 1:1 from React) |
| `src/components/landing/` | Landing page sections, the enquiry form and its script |
| `src/styles/global.css` | The original stylesheet, unchanged; `fonts.css` self-hosts the same font files |
| `src/styles/landing.css` | Landing page additions, same tokens |
| `src/lib/enquiry/fields.ts` | Form fields, limits, the checkbox text and its version, validation (browser and server) |
| `src/pages/ochrana-osobnich-udaju.astro` | Privacy policy, **draft** with `[DOPLNIT: …]` placeholders for the legal check |
| `src/lib/server/*` | Enquiry handler, D1, rate limit, Turnstile, notification |
| `src/lib/routing.ts`, `src/i18n/pages.ts` | Canonical-URL redirects; the pages that exist in both languages |
| `src/content/topic/{cs,en}.yaml` | The service pages (see "Service pages") |
| `migrations/` | D1 schema (`wrangler d1 migrations apply`) |
| `wrangler.jsonc` | Worker config: assets, D1 binding (`sivak-ai`), vars, hourly cron, commented-out `send_email` |
| `docs/` | Migration inventory and parity checklist |
| `design/` | Brand and OG image sources |

Czech copy gets no-break spaces after one-letter prepositions automatically (`src/lib/czech.ts`).

## Local development

Requires **Node.js ≥ 22.23.4** (Astro 7; `.nvmrc` says 24).

```sh
npm install
cp .dev.vars.example .dev.vars        # Worker variables and secrets
cp .env.example .env                  # optional: PUBLIC_* build-time keys
npm run db:migrate:local              # builds once, then creates the tables in the local D1 (.wrangler/state)

npm run dev                           # Astro dev server on http://localhost:4321 (runs in workerd, local D1)
npm run preview                       # production build served by `wrangler dev --local` on http://localhost:8787
npm run check && npm run lint         # astro check (TypeScript) and ESLint
```

(`npm run preview` is local only.)
`npm run preview` is the closest to production: the same Worker, the static asset routing from
`wrangler.jsonc`, a local D1 database and the variables from `.dev.vars`. Stop it before running
another build.

Useful local checks:

```sh
curl -I -H 'Accept-Language: en' http://localhost:8787/          # 200 Czech: no language redirect
curl -I http://localhost:8787/ai-skoleni/                         # 308 → /ai-skoleni
curl -I http://localhost:8787/index.html                          # 308 → /
npx wrangler d1 execute sivak-ai --local --command "SELECT * FROM enquiries"
# the hourly retention cron, by hand:
curl -X POST -H 'Content-Type: application/json' -d '{"cron":"0 * * * *"}' \
  'http://localhost:8787/cdn-cgi/local/explorer/api/local/scheduled?worker=sivak-ai'
```

A **build** without `PUBLIC_TURNSTILE_SITE_KEY` shows "Formulář je dočasně nedostupný" instead of the
form (and logs a warning); only `npm run dev` keeps the form without the widget. For `npm run preview`
and to try Turnstile, use Cloudflare's test keys: `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`
in `.env` and `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA` in `.dev.vars`.

## Environment variables and secrets

Build-time (public, inlined into the static pages; set in `.env` locally and as **build variables**
in Workers Builds):

| Name | Purpose |
| --- | --- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget on the form. Empty in a build = "dočasně nedostupný" notice instead of the form (build warning). |
| `PUBLIC_GOOGLE_ADS_ID` | Google Ads tag ID, `AW-…`. Empty = no Ads tag and no conversion. |
| `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Label of the conversion action (`send_to` = `AW-…/label`). |

Runtime (Worker). Non-secret values are in `wrangler.jsonc` → `vars`; secrets are set with
`wrangler secret put NAME` (locally in `.dev.vars`):

| Name | Kind | Purpose |
| --- | --- | --- |
| `SITE_ENV` | var | `production` (wrangler.jsonc), `preview` (env.preview) or `development` (.dev.vars). Anything else counts as production. |
| `ENQUIRY_NOTIFY_TO` | var | Comma-separated recipients, default `mirek@sivak.ai,matous@sivak.ai` |
| `ENQUIRY_FROM_EMAIL` | var | Sender, `web@sivak.ai` (sivak.ai is onboarded for Email Sending); shown as "sivak.ai – poptávky" |
| `NOTIFY_DISABLED` | var | `1` = kill switch: never send, log only |
| `TURNSTILE_SECRET_KEY` | secret | Turnstile server-side verification; required in production (no test keys). The preview has the public test secret in `env.preview.vars`. |
| `IP_HASH_SALT` | secret | HMAC-SHA256 key for the IP hash (rate limit, `ip_hash` column), e.g. `openssl rand -hex 32`. Required in production **and preview**; only `development` may run without it (no rate limit, `ip_hash` NULL). |
| `DB` | D1 binding | Enquiries and rate limit; required (without it the form answers 503) |
| `EMAIL` | send_email binding | Cloudflare Email Service, production only; restricted to `mirek@sivak.ai` and `matous@sivak.ai` |

## Cookie consent

Every page that uses `src/layouts/Base.astro` (homepage cs/en, `/ai-skoleni`, the thank-you page, the
privacy policy, 404) has the cookie banner (`src/components/CookieConsent.astro`, logic in
`src/components/cookie-consent.ts`, shared values and texts in `src/lib/consent.ts`), with **Google
Consent Mode v2**:

- The first thing in `<head>` is an inline script: it defines `gtag`, sets `ad_storage`,
  `analytics_storage`, `ad_user_data` and `ad_personalization` to `denied` (`wait_for_update: 500`,
  `ads_data_redaction`) and, if there is a current stored choice, applies it with `gtag('consent',
  'update', …)` — all before the `gtag('config', …)` calls at the end of `<body>`. gtag.js itself is
  loaded after the page (window load, then idle time), off the critical path; the queued calls keep their
  order, so Consent Mode stays "advanced" (cookieless pings while denied). Denied, the Google tags set no
  cookies.
- Banner: "Přijmout vše" / "Odmítnout vše" (same size and style) and "Nastavení" with toggles
  Analytické (`analytics_storage`) and Marketingové (`ad_storage`, `ad_user_data`, `ad_personalization`);
  Nezbytné always on, nothing pre-ticked. English on `/en`. Fixed to the viewport bottom (no layout
  shift), non-modal; when reopened from the footer, focus moves into it and back to the link afterwards;
  Escape closes the settings and never counts as a choice.
- The choice is stored in `localStorage` (`sivak-ai-consent`: `{ v, at, analytics, marketing }`) for
  **6 months**; expired, or `COOKIE_CONSENT_VERSION` changed (bump it when purposes or texts change), the
  banner asks again and any `_ga*` / `_gcl_*` cookies are deleted.
- Footer link "Nastavení cookies" / "Cookie settings" (homepage and landing footer, plus a button in the
  privacy policy) reopens the banner. Withdrawing sets the consent types back to denied and deletes `_ga`,
  `_ga_*` (and, without marketing consent, `_gcl_*`) host-only and on every parent domain (`www.sivak.ai`,
  `.sivak.ai`).
- The Google Ads conversion on `/ai-skoleni` fires only with marketing consent, and only when
  `PUBLIC_GOOGLE_ADS_*` are set. The form keeps the campaign parameters in `sessionStorage` only with
  marketing consent too.
- Without JavaScript there is no banner and no footer link, and no Google tag runs either.

## Performance

- CSS is inlined into every page (`build.inlineStylesheets: "always"`), so no stylesheet blocks the
  first paint (about 10 kB gzipped per page).
- Only the Jost files are preloaded (`jost-latin`, `jost-latin-ext`); the mono face loads on demand.
- Turnstile's `api.js` is not in the page: `src/components/landing/turnstile.ts` loads it with
  `render=explicit` on the first focus or pointer press in the form, or when the form comes within 600 px
  of the viewport, and renders into a slot that reserves the widget's height. A submit waits for the
  token. `/ai-skoleni` preconnects to `challenges.cloudflare.com`.
- Hero text slides in without fading, so it is painted at once and is the LCP element; the cookie bar
  opens after the first paint, in two short paragraphs, so it never is.
- Measured on `/ai-skoleni` (Chromium, 412 px, 4× CPU, 150 ms / 1.6 Mbit/s, no cache): FCP and LCP
  2.4 s → 1.4 s. The homepage has a small layout shift right after the earlier first paint (CLS 0.078,
  within "good" < 0.1; 0 with external CSS, which paints about 1 s later).

## The enquiry form

`POST /api/poptavka` (`src/lib/server/enquiry.ts`), in this order. The visitor sees "přijali" (200 or
the 303 to the thank-you page) **only once the row is stored in D1**; every refusal is an error asking to try again later.
**No e-mail address appears anywhere on `/ai-skoleni`** (messages, notice, success state, thank-you page,
footer: `SiteFooter`'s `contact` prop swaps the addresses for a link to the form there; the homepage
footer is unchanged). The form is the only contact path; only the privacy policy names a contact e-mail.

1. **Configuration**, before the body is read: no `DB` binding → 503 (every mode). Production and
   preview also refuse with 503 without `IP_HASH_SALT`; production without `TURNSTILE_SECRET_KEY` or with
   a Turnstile test secret. Each refusal logs a `config error`.
2. **Body size**: at most 32 KiB, counted while reading the stream (a missing or false `Content-Length`
   doesn't help) → 413.
3. **Rate limit**: at most 5 submissions per IP hash in 10 minutes, in D1 table `enquiry_attempts`. One
   conditional `INSERT … SELECT … WHERE (SELECT COUNT(*) …) < 5` admits or refuses (`meta.changes`), so
   parallel requests can't overshoot; the same batch deletes attempts older than 23 hours. If D1 fails
   here: 503 in production and preview, let through (warning) in development. The IP is never stored,
   only `HMAC-SHA256(IP_HASH_SALT, ip)`, truncated to 32 hex characters. Without the key (development
   only) there is no rate limit and `ip_hash` is NULL.
4. **Parsing**, then the **honeypot** (`website` field): filled → answered as success, nothing stored
   (the one deliberate exception, for bots).
5. **Validation** (`src/lib/enquiry/fields.ts`, the same code the browser runs): name, company,
   e-mail and the checkbox required; phone optional but checked; participants 1–500; length limits.
6. **Turnstile** siteverify (the widget itself loads lazily, see "Performance"). Without `TURNSTILE_SECRET_KEY` the check is skipped with a logged warning
   outside production only. Cloudflare's test keys (`1x00000000000000000000AA` /
   `1x0000000000000000000000000000000AA`) work in development and preview and are refused in production.
7. **D1** insert with the checkbox time and wording version (`CONSENT_VERSION`), `utm_*`, `gclid`,
   landing URL, user agent and IP hash; `source` is `ai-skoleni`, or `ai-skoleni-preview` /
   `ai-skoleni-development` outside production. Insert fails → 503 "zkuste to znovu".
8. **Notification** (after the response, `waitUntil`): see below. Its failure doesn't change the answer:
   the enquiry is stored in D1.

The checkbox ("Beru na vědomí…") acknowledges the privacy policy; it is not a GDPR consent, the legal
basis is art. 6(1)(b). The column is still called `consent`; `consent_text_version` stores the wording
version **the page submitted** in the hidden field `consent_version` (`2026-10-27-v2` since the change from
"Souhlasím…"). The server accepts only `SUPPORTED_CONSENT_VERSIONS` (`fields.ts`); anything else, or no
field (an old cached page), gets **409** "Formulář se mezitím změnil. Obnovte prosím stránku…" as JSON,
or without JavaScript a 303 back to `/ai-skoleni#formular-zmenen`, where `:target` shows the same
message above a fresh form. When the wording changes: bump `CONSENT_VERSION`, add it to the list, and
drop the old one once no old pages can be around.

**Logs** carry the enquiry id, a reason and error class/code only: never names, company, e-mail, phone,
note, IP, user agent, the e-mail subject or body, nor provider response bodies (`src/lib/server/log.ts`).

With JavaScript the form submits with `fetch`, shows errors next to the fields and the result in an
`aria-live` region, then pushes `ai_skoleni_lead` to `dataLayer` and, if both `PUBLIC_GOOGLE_ADS_*`
are set, `gtag('event', 'conversion', { send_to })`. Without JavaScript the browser validates the
fields natively, posts the form and is redirected (303) to `/ai-skoleni/odeslano`, or gets a short
error page. Campaign parameters are copied from the landing URL into hidden fields (and kept in
`sessionStorage` for the visit); without JavaScript the server reads them from the `Referer`.

Same-origin is enforced by Astro's `security.checkOrigin` (cross-site form posts get 403).

### E-mail notification

`src/lib/server/notify.ts` sends through **Cloudflare Email Service**, the only channel: the `EMAIL`
`send_email` binding, `env.EMAIL.send({ from: { email: "web@sivak.ai", name: "sivak.ai – poptávky" },
to, replyTo, subject, text, html })` (typed by `SendEmail` in `@cloudflare/workers-types`).

- sivak.ai is onboarded for Email Sending (return path `cf-bounce.sivak.ai`, DKIM selector `cf-bounce`,
  quota 200 a day). No destination-address verification and no Email Routing are needed; MX stays on
  Google Workspace.
- Recipients come from `ENQUIRY_NOTIFY_TO`; the binding's `allowed_destination_addresses` limits it to
  `mirek@sivak.ai` and `matous@sivak.ai` anyway. Reply-To is the enquirer's address, so a reply goes
  straight to them.
- A name or company starting with `TEST` gets `[TEST] ` in front of the subject. The first line of the
  e-mail names the host the form was sent from (workers.dev before the cutover).
- User input is HTML-escaped in the HTML part; line breaks are stripped from the subject.
- Nothing is sent outside production (`SITE_ENV=development` or `preview`; the preview has no binding
  either), when `NOTIFY_DISABLED=1`, without the binding, or while `ENQUIRY_FROM_EMAIL`/`ENQUIRY_NOTIFY_TO`
  are empty. A failure is logged with the enquiry id and the Email Service error code
  (e.g. `E_RATE_LIMIT_EXCEEDED`) and never changes the visitor's answer: the enquiry is already in D1.

### Retention and deletion

What `/ochrana-osobnich-udaju` promises, and what does it:

| Data | Kept | How |
| --- | --- | --- |
| `enquiry_attempts` (IP hash + time) | ≤ 24 hours | deleted after 23 h on every submission and by the hourly cron |
| `enquiries` rows | 24 months | the hourly cron deletes rows with `created_at` older than 24 months (`pruneEnquiries`) |
| Notification e-mails in the mirek@/matous@ mailboxes | 24 months | **by hand**: delete enquiry e-mails older than 24 months (e.g. a monthly mailbox search for "Poptávka AI školení" older than 24 months) |
| Anything that became a contract | as the contract and the law require | copy what's needed into the contract records before the 24 months run out |

A data subject's request (access or erasure), by e-mail address, on the database in question:

```sh
npx wrangler d1 execute sivak-ai --remote -c wrangler.jsonc --command "SELECT * FROM enquiries WHERE email = 'jan@example.com'"
npx wrangler d1 execute sivak-ai --remote -c wrangler.jsonc --command "DELETE FROM enquiries WHERE email = 'jan@example.com'"
```

and delete the matching notification e-mails from both mailboxes.

## Deploy and cutover from Vercel

### Current state (27 October 2026)

- The sivak.ai zone is active on Cloudflare DNS (Free plan). The apex `A 76.76.21.21` and
  `www CNAME cname.vercel-dns.com` (both DNS-only) **still point to Vercel**, which keeps serving
  www.sivak.ai. MX is Google Workspace; Email Routing (inbound) is off and stays off.
- The production Worker **`sivak-ai` runs on workers.dev only**, https://sivak-ai.onfire4yhwh.workers.dev
  (`workers_dev: true`, no routes, no custom domain). Everything there is **noindex** (see below).
- D1 `sivak-ai` (`73a4d2d1-d42a-4b19-a853-463ee16dc1dd`, WEUR) has migrations **0001 and 0002** applied.
- **Email Sending is live**: sivak.ai is onboarded (status ready, return path `cf-bounce.sivak.ai`, DKIM
  selector `cf-bounce`, 200 e-mails a day). The `EMAIL` binding sends from `web@sivak.ai` to
  `mirek@sivak.ai` and `matous@sivak.ai` (`allowed_destination_addresses`); no destination verification
  or Email Routing is involved.
- **Turnstile**: one widget for `sivak.ai`, `www.sivak.ai` and `sivak-ai.onfire4yhwh.workers.dev`; its site
  key is the build variable `PUBLIC_TURNSTILE_SITE_KEY`, its secret the Worker secret
  `TURNSTILE_SECRET_KEY`. The code has no hostname check of its own: the widget's hostname list decides
  where it works.
- Secrets on `sivak-ai`: `TURNSTILE_SECRET_KEY`, `IP_HASH_SALT`. (`ADMIN_USER` / `ADMIN_PASSWORD`, if still set
  from the removed admin, are unused and can be deleted.)
- Google Ads: not configured (`PUBLIC_GOOGLE_ADS_*` unset), so no Ads tag and no conversion.

Deploying is `npm run deploy` (build + `wrangler deploy`) with `PUBLIC_TURNSTILE_SITE_KEY` set in the
environment of the build, or Workers Builds (build command `npm run build`, deploy command
`npx wrangler deploy`, `NODE_VERSION=24`, the `PUBLIC_*` build variables).

### noindex on workers.dev, keyed on the hostname

Before the cutover nothing on `*.workers.dev` may be indexed, and after it sivak.ai must be indexed
normally, without a config change. Two parts, both matching only `*.workers.dev`:

- **Static files** (served without the Worker): `public/_headers` has the absolute-URL rule
  `https://:worker.:account.workers.dev/*` → `X-Robots-Tag: noindex, nofollow`. Workers static assets
  support absolute URLs with host placeholders in `_headers`
  ([docs](https://developers.cloudflare.com/workers/static-assets/headers/)); the rule cannot match
  sivak.ai or www.sivak.ai, so no extra request goes through the Worker.
- **Worker responses** (`_headers` doesn't apply to them): `src/worker.ts` adds the same header when
  the hostname ends in `.workers.dev`, puts a robots meta tag into HTML, and answers `/robots.txt`
  (now in `run_worker_first`) with `Disallow: /`. On any other host robots.txt is the normal one.

Verify:

```sh
curl -sI https://sivak-ai.onfire4yhwh.workers.dev/ai-skoleni | grep -i x-robots-tag   # noindex, nofollow
curl -sI https://sivak-ai.onfire4yhwh.workers.dev/og/cs.png | grep -i x-robots-tag    # noindex, nofollow
curl -s  https://sivak-ai.onfire4yhwh.workers.dev/robots.txt                          # Disallow: /
# locally, after `npm run preview`: the same with -H 'Host: sivak-ai.onfire4yhwh.workers.dev' on
# http://localhost:8787, and no X-Robots-Tag with -H 'Host: www.sivak.ai'
```

### Remaining cutover steps (not done; each needs Mirek's OK)

1. **Custom domains**: Worker `sivak-ai` → Settings → Domains & Routes → add the Custom Domains
   `sivak.ai` and `www.sivak.ai`. Cloudflare replaces the Vercel `A`/`CNAME` records with the Worker and
   issues certificates; MX and the e-mail records are untouched. Then redirect the apex to `www` to match
   the canonical URLs (Rules → Redirect Rules → filter `http.host eq "sivak.ai"`, dynamic target
   `concat("https://www.sivak.ai", http.request.uri.path)`, 301, preserve query string). Check `/`, `/en`,
   `/ai-skoleni`, a test enquiry (name starting with `TEST`, the e-mail subject gets `[TEST] `), and that
   robots.txt and the pages carry **no** noindex on www.sivak.ai.
2. **Vercel**: remove `sivak.ai` and `www.sivak.ai` from the Vercel project's domains and disconnect its
   Git integration; delete the project once all is well.
3. **Merge**: squash-merge PR #1 (`astro-cloudflare` → `main`) so `main` gets one commit for the
   migration rather than the branch's working history.

Rollback before step 2: delete the two Custom Domains and recreate `A sivak.ai 76.76.21.21` and
`CNAME www cname.vercel-dns.com` (DNS-only).

Google Ads, when wanted: Google Ads → Goals → Conversions → create a "Submit lead form" action
(website, manual tag) → Tag setup → "Use Google tag" shows `send_to: 'AW-XXXXXXXXX/YYYYYYYY'`. Set
`PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX` and `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=YYYYYYYY` as build variables.
**The customer ID 285-124-8637 shown in the Ads UI is not the tag ID** and does not work here. The Ads tag
is configured only on `/ai-skoleni`; GA4 (`G-S98V3B32ZL`) is on every page, both only after consent.

The privacy policy (`src/pages/ochrana-osobnich-udaju.astro`) has one `[DOPLNIT]` left, the Google
Analytics retention setting; once it is filled in and checked, drop the page's `noindex`.

### Database changes

Never edit an applied migration: schema changes go into a new `migrations/000N_*.sql`, applied to
each database. Current: `0001_enquiries.sql`, `0002_admin_auth_failures.sql`. 0002 is a leftover of the
admin (`/admin/poptavky`), which was removed on 27 October 2026: it is applied and stays, the table
`admin_auth_failures` is no longer used by anything.

Enquiries are read in D1 (and arrive by e-mail); there is no admin page:

```sh
npx wrangler d1 execute sivak-ai --remote -c wrangler.jsonc --command "SELECT * FROM enquiries ORDER BY id DESC LIMIT 20"
```

| Database | Command |
| --- | --- |
| local copy (`.wrangler/state`) | `npm run db:migrate:local` |
| production `sivak-ai` | `npm run db:migrate:remote` (= `wrangler d1 migrations apply sivak-ai --remote -c wrangler.jsonc`) |

`-c wrangler.jsonc` makes wrangler read the source config rather than the one the last build generated.

## Notes

- `design/og/*.html` are the sources of the share images in `public/og/` (see `design/og/README.md`).
- GA4 runs on every page as on the Next.js site, but only after consent (see "Cookie consent").
