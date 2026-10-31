/* global process, console, URL */
// `npm run verify:seo`: checks the built site in dist/client (run `npm run build` first): JSON-LD,
// sitemap lastmod, hreflang of /ai-skoleni, the visible training price and the content rules.
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
};
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
const course = jsonLd(html("/ai-skoleni")).find((b) => b["@type"] === "Course");
const offer = course?.offers;
const spec = offer?.priceSpecification;
ok(offer?.["@type"] === "Offer" && offer.price === 35000 && offer.priceCurrency === "CZK", "/ai-skoleni Course Offer 35000 CZK");
ok(spec?.["@type"] === "UnitPriceSpecification" && spec.price === 35000 && spec.priceCurrency === "CZK" && spec.valueAddedTaxIncluded === false, "UnitPriceSpecification 35000 CZK, valueAddedTaxIncluded false");

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

console.log("== hreflang /ai-skoleni");
const sk = html("/ai-skoleni");
const head = sk.slice(0, sk.indexOf("</head>"));
ok(!/<link rel="alternate"[^>]*hreflang/.test(head), "/ai-skoleni <head> has no hreflang alternates");
ok(!sk.includes("/en/ai-skoleni") && !sitemap.includes("/en/ai-skoleni"), "no /en/ai-skoleni in the page or the sitemap");
ok(urls.find((u) => u.loc === `${SITE}/ai-skoleni`)?.alternates.length === 0, "sitemap /ai-skoleni has no alternates");
ok(!urls.some((u) => u.alternates.some((a) => a.includes("ai-skoleni"))), "no sitemap alternate points at /ai-skoleni");

console.log("== visible price");
const count = (text, s) => text.split(s).length - 1;
const csPrice = `${PRICE} bez${NBSP}DPH`;
const enPrice = `${PRICE} excl.${NBSP}VAT`;
const skText = visible(sk);
ok(count(skText, csPrice) >= 1, `/ai-skoleni shows "35 000 Kč bez DPH" ${count(skText, csPrice)}×`);
ok(count(skText, PRICE) === count(skText, csPrice), "/ai-skoleni: every price is followed by bez DPH");
for (const [path, label] of [["/", csPrice], ["/en", enPrice]]) {
  const text = visible(html(path));
  ok(count(text, label) >= 1 && count(text, PRICE) === count(text, label), `${path} shows "${label.replaceAll(NBSP, " ")}" (${count(text, label)}× of ${count(text, PRICE)} prices)`);
}
ok(!/35 000/.test(skText + visible(html("/")) + visible(html("/en"))), "no plain-space 35 000");

console.log("== content rules");
const all = ["/", "/en", ...Object.keys(PAGES)].map((p) => [p, visible(html(p))]);
ok(all.every(([, t]) => !/dotac|subsid/i.test(t)), "no dotace/subsidies");
ok(all.every(([, t]) => !/pilotní agent/i.test(t)), 'no "pilotní agent"');
ok(/Mirek Sivák/.test(skText) && all.every(([, t]) => !/Mirek Sivak\b|Miroslav Sivák/.test(t)), 'name is "Mirek Sivák"');

console.log(failures ? `\n${failures} FAILED` : "\nALL CHECKS PASSED");
process.exit(failures ? 1 : 0);
