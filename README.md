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
                                             └─ e-mail: EMAIL send_email binding ▸ Resend ▸ none
           cron "0 * * * *" ─▶ src/worker.ts scheduled(): retention cleanup in D1
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
| `src/lib/site.ts` | Company facts, people, `MIREK_LINKEDIN_URL` (TODO, hidden while a placeholder), `PRIVACY_POLICY_URL`, GA ID |
| `src/components/`, `src/components/sections/` | Home page components (ported 1:1 from React) |
| `src/components/landing/` | Landing page sections, the enquiry form and its script |
| `src/styles/global.css` | The original stylesheet, unchanged; `fonts.css` self-hosts the same font files |
| `src/styles/landing.css` | Landing page additions, same tokens |
| `src/lib/enquiry/fields.ts` | Form fields, limits, the checkbox text and its version, validation (browser and server) |
| `src/pages/ochrana-osobnich-udaju.astro` | Privacy policy, **draft** with `[DOPLNIT: …]` placeholders for the legal check |
| `src/lib/server/*` | Enquiry handler, D1, rate limit, Turnstile, notification, admin auth, CSV |
| `migrations/` | D1 schema (`wrangler d1 migrations apply`) |
| `wrangler.jsonc` | Worker config: assets, D1 bindings (production `sivak-ai`, preview `ai-skoleni-nahled`), vars, hourly cron, commented-out `send_email` |
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

(`npm run preview` is local only; deploying the workers.dev preview is `npm run deploy:preview`, see below.)
`npm run preview` is the closest to production: the same Worker, the static asset routing from
`wrangler.jsonc`, a local D1 database and the variables from `.dev.vars`. Stop it before running
another build.

Useful local checks:

```sh
curl -I -H 'Accept-Language: en' http://localhost:8787/          # 307 → /en
curl -I -H 'Cookie: lang=%' http://localhost:8787/               # malformed cookie = no preference: 200 Czech
npx wrangler d1 execute sivak-ai --local --command "SELECT * FROM enquiries"
open http://localhost:8787/admin/poptavky                         # credentials from .dev.vars
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
| `ENQUIRY_FROM_EMAIL` | var | Sender, on a domain verified for the chosen e-mail channel (TODO) |
| `NOTIFY_DISABLED` | var | `1` = kill switch: never send, log only |
| `TURNSTILE_SECRET_KEY` | secret | Turnstile server-side verification; required in production (no test keys). The preview has the public test secret in `env.preview.vars`. |
| `IP_HASH_SALT` | secret | HMAC-SHA256 key for the IP hash (rate limit, `ip_hash` column), e.g. `openssl rand -hex 32`. Required in production **and preview**; only `development` may run without it (no rate limit, `ip_hash` NULL). |
| `RESEND_API_KEY` | secret | Resend, if the Cloudflare Email Service binding isn't used |
| `ADMIN_USER`, `ADMIN_PASSWORD` | secret | HTTP Basic auth for `/admin/*`. `ADMIN_PASSWORD` must be at least 24 characters (e.g. `openssl rand -base64 24`); missing or shorter → `/admin/*` answers 503 "Admin not configured." |
| `DB` | D1 binding | Enquiries and rate limit; required (without it the form answers 503) |
| `EMAIL` | send_email binding | Cloudflare Email Service (commented out in wrangler.jsonc) |

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
6. **Turnstile** siteverify. Without `TURNSTILE_SECRET_KEY` the check is skipped with a logged warning
   outside production only. Cloudflare's test keys (`1x00000000000000000000AA` /
   `1x0000000000000000000000000000000AA`) work in development and preview and are refused in production.
7. **D1** insert with the checkbox time and wording version (`CONSENT_VERSION`), `utm_*`, `gclid`,
   landing URL, user agent and IP hash; `source` is `ai-skoleni`, or `ai-skoleni-preview` /
   `ai-skoleni-development` outside production. Insert fails → 503 "zkuste to znovu".
8. **Notification** (after the response, `waitUntil`): see below. Its failure doesn't change the answer:
   the enquiry is stored and in the admin.

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

`src/lib/server/notify.ts` picks the first available channel:

1. **Cloudflare Email Service** (recommended) — the `EMAIL` `send_email` binding
   (`env.EMAIL.send({ from, to, replyTo, subject, html, text })`). sivak.ai is already onboarded
   for Cloudflare Email Sending (the `cf-bounce` MX/SPF/DKIM records exist and another Worker in the
   account already sends this way), so the sender can be e.g. `web@sivak.ai` or `noreply@sivak.ai`.
   - Sending to **verified destination addresses is free**, also on Workers Free. Verify
     `mirek@sivak.ai` and `matous@sivak.ai` in the dashboard under Email → Email Routing →
     Destination addresses (each gets a confirmation e-mail). **Only verify — do not enable Email
     Routing and do not change MX**: inbound mail for sivak.ai stays on Google Workspace.
   - Sending to arbitrary recipients would need Workers Paid ($5/month, 3,000 e-mails/month
     included); this site only ever writes to the two verified addresses.
   - To switch it on: set `ENQUIRY_FROM_EMAIL`, uncomment `send_email` in `wrangler.jsonc` (it lists
     the two addresses in `allowed_destination_addresses`) and deploy.
2. **Resend** HTTP API (fallback) — `RESEND_API_KEY`, with `ENQUIRY_FROM_EMAIL` on a domain
   verified in Resend.
3. **None** — the log gets the enquiry id and the reason; the enquiry itself is in D1 and the admin.

Nothing is sent outside production (`SITE_ENV=development` or `preview`), when `NOTIFY_DISABLED=1`, or
while `ENQUIRY_FROM_EMAIL`/`ENQUIRY_NOTIFY_TO` are empty. User input is HTML-escaped in the e-mail;
Reply-To is the enquirer's address.

### Admin: `/admin/poptavky`

Enquiries newest first (500 shown) and `/admin/poptavky.csv` with all of them (UTF-8 with BOM for
Excel, every cell quoted, cells starting with `= + - @` prefixed with `'` against CSV injection).
Protected by HTTP Basic auth (`ADMIN_USER`/`ADMIN_PASSWORD`, constant-time comparison,
`src/lib/server/admin.ts`). It never falls open:

- `ADMIN_USER` missing, or `ADMIN_PASSWORD` missing or shorter than 24 characters → **503** "Admin not
  configured." (the same answer without the `DB` binding, or without `IP_HASH_SALT` outside development);
- **failed-login limit**: at most 10 wrong logins per IP hash (`HMAC-SHA256(IP_HASH_SALT, "admin:" + ip)`)
  in 15 minutes, then **429** with `Retry-After`. Table `admin_auth_failures` (**migration 0002**): every
  request with credentials is recorded by one conditional `INSERT … SELECT … WHERE count < 10`, so
  parallel guesses can't overshoot, and a correct login deletes its own row. Rows older than a day go on
  every attempt and with the hourly cron. If D1 fails here the admin answers 503. Requests without
  credentials (the browser's first one) only get the 401 login prompt and are not counted.

Responses carry `noindex`, `no-store`; `/admin/` and `/api/` are disallowed in robots.txt and not in
the sitemap.

### Retention and deletion

What `/ochrana-osobnich-udaju` promises, and what does it:

| Data | Kept | How |
| --- | --- | --- |
| `enquiry_attempts` (IP hash + time) | ≤ 24 hours | deleted after 23 h on every submission and by the hourly cron |
| `admin_auth_failures` (IP hash + time of failed admin logins) | ≤ 24 hours | deleted after 23 h on every login attempt and by the hourly cron |
| `enquiries` rows | 24 months | the hourly cron deletes rows with `created_at` older than 24 months (`pruneEnquiries`) |
| Notification e-mails in the mirek@/matous@ mailboxes | 24 months | **by hand**: delete enquiry e-mails older than 24 months (e.g. a monthly mailbox search for "Poptávka AI školení" older than 24 months) |
| Anything that became a contract | as the contract and the law require | copy what's needed into the contract records before the 24 months run out |

A data subject's request (access or erasure), by e-mail address, on the database in question:

```sh
npx wrangler d1 execute sivak-ai --remote -c wrangler.jsonc --command "SELECT * FROM enquiries WHERE email = 'jan@example.com'"
npx wrangler d1 execute sivak-ai --remote -c wrangler.jsonc --command "DELETE FROM enquiries WHERE email = 'jan@example.com'"
```

and delete the matching notification e-mails from both mailboxes.

**Recommended at cutover** (nothing of this is configured yet):

- **Cloudflare Access** in front of `/admin/*` (Zero Trust → Access → Applications → self-hosted,
  domain `www.sivak.ai/admin/*`, policy: e-mails of Mirek and Matouš, one-time PIN or Google login).
  Requests then reach the Worker only after Access has let them through. Keep Basic auth as the second layer.
- and/or a **WAF rate-limiting rule** (Security → WAF → Rate limiting rules): e.g. requests whose URI path
  starts with `/admin/`, counted per IP, a few dozen per minute → block for 10 minutes. It stops floods
  at the edge before they cost Worker requests or D1 writes; the Worker's own limit stays underneath.

## Deploy and cutover from Vercel

State on 27 October 2026: the sivak.ai zone is **already active on Cloudflare DNS** (Free plan). The
apex `A 76.76.21.21` and `www CNAME cname.vercel-dns.com` (both DNS-only) still point to Vercel; MX is
Google Workspace; sivak.ai is onboarded for Cloudflare Email Sending; Email Routing (inbound) is off
and must stay off. The D1 database `sivak-ai` (`73a4d2d1-d42a-4b19-a853-463ee16dc1dd`, WEUR) exists and
`migrations/0001_enquiries.sql` is applied. The Worker is not deployed yet.

Commands need a logged-in `wrangler` on the sivak.ai account.

1. **Turnstile**: dashboard → Turnstile → Add widget for `www.sivak.ai` and `sivak.ai`, mode Managed.
   Site key → `PUBLIC_TURNSTILE_SITE_KEY` (build variable); secret →
   `npx wrangler secret put TURNSTILE_SECRET_KEY`. Production refuses the test keys.
2. **Secrets**: `npx wrangler secret put` for `IP_HASH_SALT` (required: the form refuses enquiries
   without it), `ADMIN_USER`, `ADMIN_PASSWORD` (and `RESEND_API_KEY` only if Resend is used).
3. **E-mail** (Cloudflare Email Service, see "E-mail notification"): verify `mirek@sivak.ai` and
   `matous@sivak.ai` as destination addresses (verification only, no routing, no MX change), set
   `ENQUIRY_FROM_EMAIL` (e.g. `web@sivak.ai`) in `wrangler.jsonc`, uncomment `send_email`. Until then
   enquiries are stored in D1 and visible in the admin, and notifications only go to the log.
4. **Google Ads**: Google Ads → Goals → Conversions → create a "Submit lead form" action (website,
   manual tag) → Tag setup → "Use Google tag" shows `send_to: 'AW-XXXXXXXXX/YYYYYYYY'`. Set
   `PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX` and `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=YYYYYYYY` as build
   variables. **The customer ID 285-124-8637 shown in the Ads UI is not the tag ID** and does not
   work here. The Ads tag is configured only on `/ai-skoleni`; GA4 (`G-S98V3B32ZL`) stays on every page.
5. **Content TODOs**: `MIREK_LINKEDIN_URL` in `src/lib/site.ts` (the LinkedIn button and `sameAs` stay
   hidden while it is the placeholder), and the privacy policy draft
   `src/pages/ochrana-osobnich-udaju.astro`: fill in every `[DOPLNIT: …]`, have it checked, decide the
   basis for the Google cookies (no cookie banner today), then drop its `noindex`.
6. **Deploy the Worker** `sivak-ai`: `npm run deploy` (build + `wrangler deploy`), or Workers Builds
   (connect the repository; build command `npm run build`, deploy command `npx wrangler deploy`,
   `NODE_VERSION=24` and the `PUBLIC_*` build variables). Check its `*.workers.dev` URL.
7. **Cutover** — no DNS move is needed. Worker → Settings → Domains & Routes → add the **Custom
   Domains** `sivak.ai` and `www.sivak.ai`. Cloudflare replaces the Vercel `A`/`CNAME` records with
   the Worker and issues certificates; MX and the e-mail records are untouched. Then make the apex
   redirect to `www` to match the canonical URLs (Rules → Redirect Rules → custom filter
   `http.host eq "sivak.ai"`, dynamic target `concat("https://www.sivak.ai", http.request.uri.path)`,
   301, preserve query string). Check `/`, `/en`, `/ai-skoleni`, a test enquiry
   and the admin on the real domain.
8. **Access** and/or a **WAF rate-limiting rule** for `/admin/*` (see "Admin"). Before the first
   deploy apply migration 0002 (`npm run db:migrate:remote`); the admin needs table `admin_auth_failures`.
9. **Vercel**: remove `sivak.ai` and `www.sivak.ai` from the Vercel project's domains, then, once
   all is well, delete the project.

Rollback before step 9: delete the two Custom Domains and recreate `A sivak.ai 76.76.21.21` and
`CNAME www cname.vercel-dns.com` (DNS-only).

### Preview deployment (`ai-skoleni-nahled`)

`wrangler.jsonc` → `env.preview` defines a second Worker, `ai-skoleni-nahled`, on workers.dev only (no
routes). `npm run deploy:preview` builds with `CLOUDFLARE_ENV=preview` (and the Turnstile test site
key unless `PUBLIC_TURNSTILE_SITE_KEY` is set) and deploys it. In preview:

- every request goes through the Worker (`run_worker_first: true`), which adds
  `X-Robots-Tag: noindex, nofollow` to every response, a `<meta name="robots" content="noindex,nofollow">`
  to every page, and serves `robots.txt` as `Disallow: /`;
- `SITE_ENV=preview`: Turnstile test keys allowed, `NOTIFY_DISABLED=1`, no e-mail;
- **its own D1 database** `ai-skoleni-nahled` (`ea98bf57-da85-4cd6-8a0a-cea4175f9713`, WEUR), so test
  enquiries never reach production's `sivak-ai`; rows have `source = 'ai-skoleni-preview'`. Apply the
  migrations once with `npm run db:migrate:preview` before the first deploy;
- secrets of its own (`npx wrangler secret put NAME --env preview`): `IP_HASH_SALT` (required, use a
  different value than production), and `ADMIN_USER` / `ADMIN_PASSWORD` for its admin.

The build prints a harmless warning that the prerender worker config has no `preview` environment.

### Database changes

Never edit an applied migration: schema changes go into a new `migrations/000N_*.sql`, applied to
each database. Current: `0001_enquiries.sql`, `0002_admin_auth_failures.sql` (the admin login limit).

| Database | Command |
| --- | --- |
| local copy (`.wrangler/state`) | `npm run db:migrate:local` |
| production `sivak-ai` | `npm run db:migrate:remote` (= `wrangler d1 migrations apply sivak-ai --remote -c wrangler.jsonc`) |
| preview `ai-skoleni-nahled` | `npm run db:migrate:preview` (= `wrangler d1 migrations apply ai-skoleni-nahled --remote -c wrangler.jsonc --env preview`) |

`-c wrangler.jsonc` makes wrangler read the source config rather than the one the last build generated
(which may be the other environment's).

## Notes

- `design/og/*.html` are the sources of the share images in `public/og/` (see `design/og/README.md`).
- The site has no cookie banner; GA4 runs as it did on the Next.js site. The privacy policy draft leaves
  the legal basis for the Google cookies as `[DOPLNIT]` for Mirek.
