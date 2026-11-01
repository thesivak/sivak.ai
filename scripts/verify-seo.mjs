/* global process, console, URL */
// `npm run verify:seo`: checks the built site in dist/client (run `npm run build` first): JSON-LD,
// sitemap lastmod, hreflang of the training pages (/ai-skoleni ↔ /en/ai-training), the visible training
// price and the content rules.
// Exits 1 when a check fails.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = `${root}dist/client`;
const SITE = "https://www.sivak.ai";
const NBSP = " ";
const PRICE = `35${NBSP}000${NBSP}Kč`;

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
  "/ai-agenti": "/",
  "/ai-automatizace": "/",
  "/pilotni-projekt": "/",
  "/ai-skoleni": "/",
  "/en/ai-agents": "/en",
  "/en/ai-automation": "/en",
  "/en/pilot-project": "/en",
  "/en/ai-training": "/en",
};
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
  const offer = course?.offers;
  const spec = offer?.priceSpecification;
  ok(course?.inLanguage === lang && course?.url === `${SITE}${path}`, `${path} Course inLanguage ${course?.inLanguage}, url ${course?.url}`);
  ok(offer?.["@type"] === "Offer" && offer.price === 35000 && offer.priceCurrency === "CZK", `${path} Course Offer 35000 CZK`);
  ok(spec?.["@type"] === "UnitPriceSpecification" && spec.price === 35000 && spec.priceCurrency === "CZK" && spec.valueAddedTaxIncluded === false, `${path} UnitPriceSpecification 35000 CZK, valueAddedTaxIncluded false`);
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
// English pages link to the English training page, never to the Czech one, and say no "(CZ)"
const englishPages = ["/en", "/en/ai-agents", "/en/ai-automation", "/en/pilot-project", TRAINING.en];
ok(englishPages.every((p) => !/href="\/ai-skoleni[#"]/.test(html(p).replace(/<a [^>]*data-lang-switch[^>]*>/g, ""))), "EN pages: no link to /ai-skoleni (except the language switch)");
ok(englishPages.every((p) => html(p).includes('href="/en/ai-training"') && !visible(html(p)).includes("(CZ)")), 'EN pages link to /en/ai-training, no "(CZ)"');

console.log("== visible price");
const count = (text, s) => text.split(s).length - 1;
const csPrice = `${PRICE} bez${NBSP}DPH`;
const enPrice = `${PRICE} excl.${NBSP}VAT`;
const skText = visible(sk);
ok(count(skText, csPrice) >= 1, `/ai-skoleni shows "35 000 Kč bez DPH" ${count(skText, csPrice)}×`);
ok(count(skText, PRICE) === count(skText, csPrice), "/ai-skoleni: every price is followed by bez DPH");
for (const [path, label] of [["/", csPrice], ["/en", enPrice], [TRAINING.en, enPrice]]) {
  const text = visible(html(path));
  ok(count(text, label) >= 1 && count(text, PRICE) === count(text, label), `${path} shows "${label.replaceAll(NBSP, " ")}" (${count(text, label)}× of ${count(text, PRICE)} prices)`);
}
ok(!/35 000/.test(skText + visible(html("/")) + visible(html("/en")) + visible(en)), "no plain-space 35 000");

console.log("== content rules");
const all = ["/", "/en", ...Object.keys(PAGES)].map((p) => [p, visible(html(p))]);
ok(all.every(([, t]) => !/dotac|subsid/i.test(t)), "no dotace/subsidies");
ok(all.every(([, t]) => !/pilotní agent/i.test(t)), 'no "pilotní agent"');
ok(/Mirek Sivák/.test(skText) && /Mirek Sivák/.test(visible(en)) && all.every(([, t]) => !/Mirek Sivak\b|Miroslav|Miroslava/.test(t)), 'name is "Mirek Sivák"');
// The training pages: the form is the only contact, so no e-mail address or phone number in the whole HTML
// (head, JSON-LD and footer included)
for (const [path, h] of [[TRAINING.cs, sk], [TRAINING.en, en]]) {
  ok(!/mailto:|tel:|@sivak\.ai|\+420/.test(h), `${path}: no e-mail address or phone number`);
  ok(!/dotac|subsid|\bgrants?\b/i.test(h), `${path}: no dotace/subsidies/grants, keywords included`);
}

console.log(failures ? `\n${failures} FAILED` : "\nALL CHECKS PASSED");
process.exit(failures ? 1 : 0);
