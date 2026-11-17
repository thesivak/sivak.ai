/* global process, console, URL */
// `npm run verify:seo`: checks the built site in dist/client (run `npm run build` first): JSON-LD,
// sitemap lastmod, hreflang of the service and training pages, no training price anywhere,
// no "agents running" badge and the content rules.
// Exits 1 when a check fails.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = `${root}dist/client`;
const SITE = "https://www.sivak.ai";
const NBSP = " ";

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
  "/ai-skoleni": "/",
  "/en/ai-solutions": "/en",
  "/en/software-development": "/en",
  "/en/security": "/en",
  "/en/ai-training": "/en",
  "/ai-pro-vyrobni-firmy": "/",
  "/ai-pro-softwarove-firmy": "/",
  "/ai-pro-obchod-a-eshopy": "/",
  "/jak-pracujeme": "/",
  "/vysledky": "/",
  "/o-nas": "/",
};
// Czech only (src/site/pages.ts)
// The industry pages: reached from the home page's "Pro koho" section, which the main menu links to
const INDUSTRY = ["/ai-pro-vyrobni-firmy", "/ai-pro-softwarove-firmy", "/ai-pro-obchod-a-eshopy"];
const CZECH_ONLY = [...INDUSTRY, "/jak-pracujeme", "/vysledky", "/o-nas"];
// The training page and its English twin
const TRAINING = { cs: "/ai-skoleni", en: "/en/ai-training" };
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
for (const [lang, path] of Object.entries(TRAINING)) {
  const course = jsonLd(html(path)).find((b) => b["@type"] === "Course");
  // The course is held in Czech or English, whichever page describes it
  const languages = JSON.stringify(["cs", "en"]);
  ok(JSON.stringify(course?.inLanguage) === languages && JSON.stringify(course?.hasCourseInstance?.inLanguage) === languages && course?.url === `${SITE}${path}`, `${path} (${lang}) Course + CourseInstance inLanguage ${JSON.stringify(course?.inLanguage)}, url ${course?.url}`);
  ok(course && !("offers" in course) && !/35000|"price"/.test(JSON.stringify(course)), `${path} Course has no Offer/price`);
  ok(jsonLd(html(path)).some((b) => b["@type"] === "FAQPage" && b.mainEntity?.length === 9), `${path} FAQPage with 9 questions`);
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

console.log("== hreflang /ai-skoleni ↔ /en/ai-training");
const sk = html(TRAINING.cs);
const en = html(TRAINING.en);
const expected = { cs: `${SITE}${TRAINING.cs}`, en: `${SITE}${TRAINING.en}`, "x-default": `${SITE}${TRAINING.cs}` };
const headAlternates = (h) =>
  Object.fromEntries([...h.slice(0, h.indexOf("</head>")).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
for (const [path, h] of [[TRAINING.cs, sk], [TRAINING.en, en]]) {
  ok(JSON.stringify(headAlternates(h)) === JSON.stringify(expected), `${path} <head> hreflang cs, en, x-default = ${JSON.stringify(headAlternates(h))}`);
  const loc = urls.find((u) => u.loc === `${SITE}${path}`);
  ok(JSON.stringify(loc?.alternates) === JSON.stringify(Object.values(expected)), `sitemap ${path} alternates ${loc?.alternates.join(", ")}`);
}
ok(canonical(en) === expected.en, `/en/ai-training canonical ${canonical(en)}`);
ok(/<html lang="en"/.test(en) && /<title>[^<]*AI training[^<]*<\/title>/.test(en) && /<meta name="description" content="[^"]+"/.test(en), "/en/ai-training: lang en, English title, description");
// The language switch (header and footer) on each page points at the other one
const switches = (h) => [...h.matchAll(/<a [^>]*data-lang-switch="[^"]+"[^>]*>/g)].map((m) => m[0].match(/href="([^"]+)"/)?.[1]);
ok(switches(sk).length >= 2 && switches(sk).every((href) => href === TRAINING.en), `/ai-skoleni language switch → ${[...new Set(switches(sk))]}`);
ok(switches(en).length >= 2 && switches(en).every((href) => href === TRAINING.cs), `/en/ai-training language switch → ${[...new Set(switches(en))]}`);
ok(!sk.includes("/en/ai-skoleni") && !sitemap.includes("/en/ai-skoleni"), "no /en/ai-skoleni in the page or the sitemap");
// English: the pages of the redesign do not offer the training. Czech: the training is filed under workshops
// (the footer and /jak-pracujeme link to it).
const redesigned = ["/en", ...Object.keys(PAGES).filter((p) => p.startsWith("/en/") && !Object.values(TRAINING).includes(p))];
ok(redesigned.every((p) => !/href="\/(en\/ai-training|ai-skoleni)[#"]/.test(html(p))), "English home and service pages: no link to the training pages");
ok(/href="\/ai-skoleni"/.test(html("/jak-pracujeme")) && /href="\/ai-skoleni"/.test(html("/")), "/jak-pracujeme and the Czech footer link to /ai-skoleni");

console.log("== share images of the training pages");
// og:image and twitter:image: absolute, the page's own 1200 × 630 PNG in public/og
const meta = (h, attr, name) => h.match(new RegExp(`<meta ${attr}="${name}" content="([^"]+)"`))?.[1];
for (const [path, h, file] of [[TRAINING.cs, sk, "ai-skoleni.png"], [TRAINING.en, en, "en-ai-training.png"]]) {
  const image = meta(h, "property", "og:image");
  ok(image === `${SITE}/og/${file}?v=2` && meta(h, "name", "twitter:image") === image, `${path} og:image = twitter:image = ${image}`);
  const png = readFileSync(`${dist}/og/${file}`);
  const [width, height] = [png.readUInt32BE(16), png.readUInt32BE(20)];
  ok(width === 1200 && height === 630 && meta(h, "property", "og:image:width") === "1200" && meta(h, "property", "og:image:height") === "630", `${path} ${file} is ${width}×${height}, meta 1200×630`);
}

console.log("== no price, no agents badge");
const PRICE_RE = /35[\s\u00a0]?000|Kč/;
for (const path of ["/", "/en", TRAINING.cs, TRAINING.en]) {
  const raw = html(path);
  ok(!PRICE_RE.test(raw), `${path} has no 35 000 Kč (HTML incl. JSON-LD and meta)`);
  ok(!/agentů v provozu|agents running|console-live/.test(raw), `${path} has no "agents running" badge`);
}
ok(/Cena na vyžádání/.test(visible(sk)), "/ai-skoleni shows Cena na vyžádání");
ok(/Price on request/.test(visible(en)), `${TRAINING.en} shows Price on request`);

console.log("== content rules");
const all = ["/", "/en", ...Object.keys(PAGES)].map((p) => [p, visible(html(p))]);
ok(all.every(([, t]) => !/dotac|subsid/i.test(t)), "no dotace/subsidies");
ok(all.every(([, t]) => !/pilotní agent/i.test(t)), 'no "pilotní agent"');
ok(/Mirek Sivák/.test(visible(sk)) && /Mirek Sivák/.test(visible(en)) && all.every(([, t]) => !/Mirek Sivak\b|Miroslav|Miroslava/.test(t)), 'name is "Mirek Sivák"');
// The training pages: the form is the only contact, so no e-mail address or phone number in the whole HTML
// (head, JSON-LD and footer included)
for (const [path, h] of [[TRAINING.cs, sk], [TRAINING.en, en]]) {
  ok(!/mailto:|tel:|@sivak\.ai|\+420/.test(h), `${path}: no e-mail address or phone number`);
  ok(!/dotac|subsid|\bgrants?\b/i.test(h), `${path}: no dotace/subsidies/grants, keywords included`);
}

console.log("== service pages");
const TWINS = [["/ai-reseni", "/en/ai-solutions"], ["/vyvoj-softwaru", "/en/software-development"], ["/bezpecnost", "/en/security"]];
for (const [cz, eng] of TWINS) {
  const alternates = { cs: `${SITE}${cz}`, en: `${SITE}${eng}`, "x-default": `${SITE}${cz}` };
  for (const [path, twin, lang] of [[cz, eng, "cs"], [eng, cz, "en"]]) {
    const h = html(path);
    ok(canonical(h) === `${SITE}${path}`, `${path} canonical`);
    ok(JSON.stringify(headAlternates(h)) === JSON.stringify(alternates), `${path} hreflang`);
    ok(switches(h).length >= 2 && switches(h).every((href) => href === twin), `${path} language switch`);
    ok(jsonLd(h).some((b) => b["@type"] === "Service") && jsonLd(h).some((b) => b["@type"] === "FAQPage" && b.mainEntity.length >= 3), `${path} Service and FAQ data`);
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
ok(["/", "/bezpecnost", "/en"].every((p) => !html(p).includes("data-lang-home")), "twin pages: the language switch keeps the #section");
const enHome = html("/en");
ok(!/software|develop/i.test(visible(enHome.slice(enHome.indexOf('class="hero"'), enHome.indexOf("</section>", enHome.indexOf('class="hero"'))))), 'English home hero: no "software" or "development"');
for (const [p, re] of [["/ai-skoleni", /href="\/#bezpecnost"/], ["/en/ai-training", /href="\/en#security"/]]) ok(!re.test(html(p)), `${p}: no link to the missing home section`);
const home = html("/");
ok(!/software|vývoj/i.test(visible(home.slice(home.indexOf('class="hero"'), home.indexOf("</section>", home.indexOf('class="hero"'))))), 'home hero: no "software" or "vývoj"');
ok(CZECH_ONLY.every((p) => home.includes(`href="${p}"`)), "home links to every Czech-only page");
const audience = home.slice(home.indexOf('id="pro-koho"'), home.indexOf("</section>", home.indexOf('id="pro-koho"')));
ok(home.includes('id="pro-koho"') && INDUSTRY.every((p) => audience.includes(`href="${p}"`)), 'home: the "Pro koho" section links to the three industry pages');
ok(!/výrobní/i.test(visible(home.slice(home.indexOf('class="hero"'), home.indexOf("</section>", home.indexOf('class="hero"'))))), "home hero: not for manufacturing companies only");
const topNav = home.slice(home.indexOf('class="top-links"'), home.indexOf("</ul>", home.indexOf('class="top-links"')));
ok(!/vyvoj-softwaru/.test(topNav) && /href="\/vyvoj-softwaru"/.test(home), "software development: out of the main menu, still linked (footer)");
ok(/subject=Objedn%C3%A1vka%3A%20AI%20diagnostika/.test(home) && /subject=Odhad%20n%C3%A1vratnosti%20zdarma/.test(home), "home: both enquiry types (AI diagnostics, free estimate)");
// No prices and no amounts of money on the site
ok([...new Set(["/", "/en", ...Object.keys(PAGES)])].every((p) => !/\d[\d\s\u00a0.,]*(?:Kč|CZK|EUR)/.test(visible(html(p)))), "no price on any page");
ok([...new Set(["/", "/en", ...Object.keys(PAGES)])].every((p) => !/doplnit|TODO|\[[^\]]*\]/i.test(visible(html(p)))), "no placeholder text on any page");
const everyPage = [...new Set(["/", "/en", ...Object.keys(PAGES)])].map((p) => html(p));
ok(everyPage.every((h) => !/dotac|subsid|Miroslav|Zapfloor|\+420/i.test(h)), "no dotace, Miroslav, client name or phone number in any page's HTML");

console.log(failures ? `\n${failures} FAILED` : "\nALL CHECKS PASSED");
process.exit(failures ? 1 : 0);
