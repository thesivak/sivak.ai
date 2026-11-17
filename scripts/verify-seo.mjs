/* global process, console, URL */
// `npm run verify:seo`: checks the built site in dist/client (run `npm run build` first): JSON-LD,
// sitemap lastmod, hreflang of the service pages, the removed pages (no file, no link, no mention),
// no "agents running" badge and the content rules.
// Exits 1 when a check fails.
// `npm run verify:release` (--release): the same, and no preview value may be left on any page. Without the
// flag the tag "UKÁZKA – potvrdí Mirek" and the stand-in figure "[X]" are let through and only listed;
// they mark values Mirek has not confirmed and must be gone before a deploy.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = `${root}dist/client`;
const SITE = "https://www.sivak.ai";
const NBSP = " ";
// The preview tag and stand-in figure (src/site/preview.ts); the tag as typed and as the site spaces it
const RELEASE = process.argv.includes("--release");
const PREVIEW_TAG = /UKÁZKA[\s\u00a0]–[\s\u00a0]potvrdí[\s\u00a0]Mirek/g;
const PREVIEW_FIGURE = "[X]";

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`);
  if (!cond) failures++;
};
const html = (path) => readFileSync(`${dist}/${path === "/" ? "index" : path.slice(1)}.html`, "utf8");
const jsonLd = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const canonical = (h) => h.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const visible = (h) =>
  h
    .slice(h.indexOf("<body"))
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, NBSP);

console.log("== JSON-LD");
const PAGES = {
  "/ai-reseni": "/",
  "/vyvoj-softwaru": "/",
  "/bezpecnost": "/",
  "/en/ai-solutions": "/en",
  "/en/software-development": "/en",
  "/en/security": "/en",
  "/ai-pro-vyrobni-firmy": "/",
  "/ai-pro-softwarove-firmy": "/",
  "/ai-pro-obchod-a-eshopy": "/",
  "/jak-pracujeme": "/",
  "/en/how-we-work": "/en",
  "/vysledky": "/",
  "/o-nas": "/",
};
// Czech only (src/site/pages.ts)
// The industry pages: reached from the home page's "Pro koho" section, which the main menu links to
const INDUSTRY = ["/ai-pro-vyrobni-firmy", "/ai-pro-softwarove-firmy", "/ai-pro-obchod-a-eshopy"];
const CZECH_ONLY = [...INDUSTRY, "/vysledky", "/o-nas"];
// Removed without a replacement: the Worker answers them with a 301 to the home page (src/lib/routing.ts)
const REMOVED = ["/ai-skoleni", "/en/ai-training"];
for (const [path, home] of Object.entries(PAGES)) {
  const h = html(path);
  let blocks = [];
  try {
    blocks = jsonLd(h);
  } catch (e) {
    ok(false, `${path} JSON-LD parses (${e.message})`);
  }
  const bc = blocks.find((b) => b["@type"] === "BreadcrumbList");
  ok(bc, `${path}: ${blocks.length} blocks (${blocks.map((b) => b["@type"]).join(", ")}), has BreadcrumbList`);
  if (!bc) continue;
  const items = bc.itemListElement ?? [];
  ok(items.length >= 2 && items.every((it, i) => it["@type"] === "ListItem" && it.position === i + 1), `${path} ListItem positions ${items.map((i) => i.position).join(",")}`);
  ok(items[0]?.name === (home === "/" ? "Domů" : "Home") && items[0]?.item === canonical(html(home)), `${path} item 1 = ${items[0]?.name} ${items[0]?.item}`);
  ok(items.at(-1)?.item === canonical(h), `${path} last item = page canonical ${canonical(h)}`);
  ok(items.every((it) => it.item?.startsWith(`${SITE}/`) || it.item === SITE), `${path} breadcrumb URLs on ${SITE}`);
}

console.log("== sitemap lastmod");
const sitemap = readFileSync(`${dist}/sitemap.xml`, "utf8");
const manifest = JSON.parse(readFileSync(`${root}src/data/lastmod.json`, "utf8"));
const urls = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, u]) => ({
  loc: u.match(/<loc>(.*?)<\/loc>/)[1],
  lastmod: u.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
  alternates: [...u.matchAll(/hreflang="[^"]+" href="([^"]+)"/g)].map((m) => m[1]),
}));
for (const u of urls) {
  const path = new URL(u.loc).pathname;
  ok(u.lastmod && u.lastmod === manifest[path], `${u.lastmod ?? "(none)"}  ${u.loc} (manifest ${manifest[path] ?? "missing"})`);
}
ok(urls.length === Object.keys(manifest).length, `sitemap has ${urls.length} URLs, manifest ${Object.keys(manifest).length}`);

console.log("== removed pages");
const headAlternates = (h) =>
  Object.fromEntries([...h.slice(0, h.indexOf("</head>")).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
// The language switch (header and footer) on each page points at the other one
const switches = (h) => [...h.matchAll(/<a [^>]*data-lang-switch="[^"]+"[^>]*>/g)].map((m) => m[0].match(/href="([^"]+)"/)?.[1]);
const meta = (h, attr, name) => h.match(new RegExp(`<meta ${attr}="${name}" content="([^"]+)"`))?.[1];
const builtHtml = readdirSync(dist, { recursive: true }).filter((file) => file.endsWith(".html")).map((file) => file.replaceAll("\\", "/"));
for (const path of REMOVED) {
  const stem = path.slice(1);
  ok(!builtHtml.some((file) => file === `${stem}.html` || file.startsWith(`${stem}/`)), `${path}: no page is built (the Worker redirects it)`);
  ok(!sitemap.includes(`${SITE}${path}`), `${path} is not in the sitemap`);
}
// No link to them and no mention of the offer in any built page: HTML, meta tags and JSON-LD included
const REMOVED_RE = /školen|skolen|školic|\btrainings?\b|"Course"/i;
for (const file of builtHtml) {
  const raw = readFileSync(`${dist}/${file}`, "utf8");
  ok(!REMOVED_RE.test(raw) && REMOVED.every((path) => !raw.includes(`"${path}`)), `${file}: no link to a removed page, no mention of it`);
}
ok(!existsSync(`${dist}/og/ai-skoleni.png`) && !existsSync(`${dist}/og/en-ai-training.png`), "the removed pages' share images are gone");

console.log("== no price, no agents badge");
const PRICE_RE = /35[\s\u00a0]?000|Kč/;
for (const path of ["/", "/en"]) {
  const raw = html(path);
  ok(!PRICE_RE.test(raw), `${path} has no price (HTML incl. JSON-LD and meta)`);
  ok(!/agentů v provozu|agents running|console-live/.test(raw), `${path} has no "agents running" badge`);
}

console.log("== content rules");
const all = ["/", "/en", ...Object.keys(PAGES)].map((p) => [p, visible(html(p))]);
ok(all.every(([, t]) => !/dotac|subsid/i.test(t)), "no dotace/subsidies");
ok(all.every(([, t]) => !/pilotní agent/i.test(t)), 'no "pilotní agent"');
ok(/Mirek Sivák/.test(visible(html("/"))) && /Mirek Sivák/.test(visible(html("/en"))) && all.every(([, t]) => !/Mirek Sivak\b|Miroslav|Miroslava/.test(t)), 'name is "Mirek Sivák"');

console.log("== service pages");
const SERVICE_TWINS = [["/ai-reseni", "/en/ai-solutions"], ["/vyvoj-softwaru", "/en/software-development"], ["/bezpecnost", "/en/security"]];
// A content page in both languages (src/site/pages.ts, pages-en.ts): the same checks, without Service data
const CONTENT_TWINS = [["/jak-pracujeme", "/en/how-we-work"]];
for (const [cz, eng] of [...SERVICE_TWINS, ...CONTENT_TWINS]) {
  const isService = SERVICE_TWINS.some((pair) => pair[0] === cz);
  const alternates = { cs: `${SITE}${cz}`, en: `${SITE}${eng}`, "x-default": `${SITE}${cz}` };
  for (const [path, twin, lang] of [[cz, eng, "cs"], [eng, cz, "en"]]) {
    const h = html(path);
    ok(canonical(h) === `${SITE}${path}`, `${path} canonical`);
    ok(JSON.stringify(headAlternates(h)) === JSON.stringify(alternates), `${path} hreflang`);
    ok(switches(h).length >= 2 && switches(h).every((href) => href === twin), `${path} language switch`);
    ok((!isService || jsonLd(h).some((b) => b["@type"] === "Service")) && jsonLd(h).some((b) => b["@type"] === "FAQPage" && b.mainEntity.length >= 3), `${path} ${isService ? "Service and " : ""}FAQ data`);
    if (!isService) ok(new RegExp(`href="${path}"[^>]*aria-current="page"`).test(h) && new RegExp(`<html lang="${lang}"`).test(h), `${path} is marked in the main menu, lang ${lang}`);
    ok(meta(h, "property", "og:image") === `${SITE}/og/${lang}.png?v=4` && meta(h, "name", "twitter:image") === `${SITE}/og/${lang}.png?v=4`, `${path} share image`);
    ok(h.includes("mailto:"), `${path} has the contact`);
  }
}

console.log("== Czech-only pages");
for (const path of CZECH_ONLY) {
  const h = html(path);
  ok(canonical(h) === `${SITE}${path}`, `${path} canonical`);
  ok(Object.keys(headAlternates(h)).length === 0, `${path} has no hreflang (Czech only)`);
  ok(switches(h).length >= 2 && switches(h).every((href) => href === "/en"), `${path} language switch → /en`);
  ok([...h.matchAll(/<a [^>]*data-lang-switch="[^"]+"[^>]*>/g)].every((m) => m[0].includes("data-lang-home")), `${path} language switch drops the #section`);
  const loc = urls.find((u) => u.loc === `${SITE}${path}`);
  ok(loc && loc.alternates.length === 0, `sitemap has ${path}, no alternates`);
  ok(/<html lang="cs"/.test(h) && meta(h, "property", "og:image") === `${SITE}/og/cs.png?v=4`, `${path} lang cs, share image`);
  ok(h.includes("mailto:"), `${path} has the contact`);
  if (INDUSTRY.includes(path)) {
    ok(/href="\/#pro-koho"[^>]*aria-current="true"/.test(h), `${path}: "Pro koho" is marked in the main menu`);
    ok(INDUSTRY.every((other) => other === path || h.includes(`href="${other}"`)) && h.includes('href="/jak-pracujeme"') && h.includes('href="/vysledky"'), `${path} links to the other industry pages, /jak-pracujeme and /vysledky`);
    ok(!/\d[\d\s\u00a0.,]*(?:mil\.|mld\.)|obrat/i.test(visible(h)), `${path} states no turnover`);
  } else ok(new RegExp(`href="${path}"[^>]*aria-current="page"`).test(h), `${path} is marked in the main menu`);
}
// The links themselves: the header's script, inlined in the page, names the attribute in a selector
ok(["/", "/bezpecnost", "/en"].every((p) => [...html(p).matchAll(/<a [^>]*data-lang-switch="[^"]+"[^>]*>/g)].every((m) => !m[0].includes("data-lang-home"))), "twin pages: the language switch keeps the #section");
const enHome = html("/en");
ok(!/software|develop/i.test(visible(enHome.slice(enHome.indexOf('class="hero"'), enHome.indexOf("</section>", enHome.indexOf('class="hero"'))))), 'English home hero: no "software" or "development"');
const home = html("/");
ok(!/software|vývoj/i.test(visible(home.slice(home.indexOf('class="hero"'), home.indexOf("</section>", home.indexOf('class="hero"'))))), 'home hero: no "software" or "vývoj"');
ok([...CZECH_ONLY, "/jak-pracujeme"].every((p) => home.includes(`href="${p}"`)), "home links to every Czech-only page and to /jak-pracujeme");
ok(enHome.includes('href="/en/how-we-work"') && CZECH_ONLY.every((p) => !enHome.includes(`href="${p}"`)), "English home links to /en/how-we-work and to no Czech-only page");
const audience = home.slice(home.indexOf('id="pro-koho"'), home.indexOf("</section>", home.indexOf('id="pro-koho"')));
ok(home.includes('id="pro-koho"') && INDUSTRY.every((p) => audience.includes(`href="${p}"`)), 'home: the "Pro koho" section links to the three industry pages');
ok(!/výrobní/i.test(visible(home.slice(home.indexOf('class="hero"'), home.indexOf("</section>", home.indexOf('class="hero"'))))), "home hero: not for manufacturing companies only");
const topNav = home.slice(home.indexOf('class="top-links"'), home.indexOf("</ul>", home.indexOf('class="top-links"')));
ok(!/vyvoj-softwaru/.test(topNav) && /href="\/vyvoj-softwaru"/.test(home), "software development: out of the main menu, still linked (footer)");
ok(/subject=Objedn%C3%A1vka%3A%20AI%20diagnostika/.test(home) && /subject=Odhad%20n%C3%A1vratnosti%20zdarma/.test(home), "home: both enquiry types (AI diagnostics, free estimate)");
// No prices and no amounts of money on the site
ok([...new Set(["/", "/en", ...Object.keys(PAGES)])].every((p) => !/\d[\d\s\u00a0.,]*(?:Kč|CZK|EUR)/.test(visible(html(p)))), "no price on any page");
// PREVIEW exception, for this exact tag and figure only; --release takes it away
const withoutPreview = (text) => (RELEASE ? text : text.replace(PREVIEW_TAG, "").replaceAll(PREVIEW_FIGURE, ""));
ok([...new Set(["/", "/en", ...Object.keys(PAGES)])].every((p) => !/doplnit|TODO|\[[^\]]*\]/i.test(withoutPreview(visible(html(p))))), "no placeholder text on any page");
const previews = builtHtml
  .map((file) => [file, (visible(readFileSync(`${dist}/${file}`, "utf8")).match(PREVIEW_TAG) ?? []).length])
  .filter(([, count]) => count > 0);
if (RELEASE) ok(previews.length === 0, `no preview value left on any page (${previews.map(([file, count]) => `${file}: ${count}`).join(", ") || "none"})`);
else if (previews.length) {
  console.log(`WARN  ${previews.length} pages carry the preview tag "UKÁZKA – potvrdí Mirek"; confirm or remove before a deploy (npm run verify:release):`);
  for (const [file, count] of previews) console.log(`      ${file}: ${count}×`);
}
const everyPage = [...new Set(["/", "/en", ...Object.keys(PAGES)])].map((p) => html(p));
ok(everyPage.every((h) => !/dotac|subsid|Miroslav|Zapfloor|\+420/i.test(h)), "no dotace, Miroslav, client name or phone number in any page's HTML");

console.log(failures ? `\n${failures} FAILED` : "\nALL CHECKS PASSED");
process.exit(failures ? 1 : 0);
