/* global Request, URL */
// Run with `npm test`. The 2026 redesign: the home page and the three service pages (src/site/{cs,en}.ts),
// their twins, the redirects from the service pages of the earlier site, and the content rules.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const bundle = async (entry) => {
  const out = await build({ entryPoints: [`${root}${entry}`], bundle: true, write: false, format: "esm", platform: "neutral", alias: { "@": `${root}src` } });
  return import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);
};
const { TWIN_PAGES, SITEMAP_PAGES, MOVED_PAGES, CZECH_ONLY_PAGES, pageIn } = await bundle("src/i18n/pages.ts");
const { pages } = await bundle("src/site/pages.ts");
const { pagesEn } = await bundle("src/site/pages-en.ts");
const { canonicalRedirect } = await bundle("src/lib/routing.ts");
const { cs } = await bundle("src/site/cs.ts");
const { en } = await bundle("src/site/en.ts");
const read = (path) => readFileSync(`${root}${path}`, "utf8");

test("the three services are twins and in the sitemap, the home page first", () => {
  assert.equal(SITEMAP_PAGES[0], "/");
  assert.deepEqual(cs.services.map((s) => s.key), ["ai", "software", "security"]);
  assert.deepEqual(en.services.map((s) => s.key), ["ai", "software", "security"]);
  cs.services.forEach((service, i) => {
    const twin = en.services[i];
    assert.ok(TWIN_PAGES.some((pair) => pair.cs === service.path && pair.en === twin.path), service.path);
    assert.equal(pageIn(service.path, "en"), twin.path);
    assert.equal(pageIn(twin.path, "cs"), service.path);
    assert.ok(read(`src/pages${service.path}.astro`).includes(`service="${service.key}"`));
    assert.ok(read(`src/pages${twin.path}.astro`).includes(`service="${twin.key}"`));
  });
});

test("service pages of the earlier site redirect to their replacements", () => {
  const list = read("wrangler.jsonc").match(/"run_worker_first":\s*\[([^\]]*)\]/)[1];
  for (const [from, to] of Object.entries(MOVED_PAGES)) {
    assert.ok(SITEMAP_PAGES.includes(to), `${to} is a page`);
    assert.ok(!SITEMAP_PAGES.includes(from), `${from} is gone from the sitemap`);
    assert.ok(list.includes(`"${from}"`), `the Worker runs first on ${from}`);
    const res = canonicalRedirect(new Request(`https://www.sivak.ai${from}`));
    assert.equal(res?.status, 308);
    assert.equal(res.headers.get("location"), to);
  }
  // One hop, with the trailing slash and the language parameter handled on the way
  const res = canonicalRedirect(new Request("https://www.sivak.ai/ai-bezpecnost/?lang=en"));
  assert.equal(res.headers.get("location"), "/en/security");
  assert.equal(canonicalRedirect(new Request("https://www.sivak.ai/bezpecnost")), null);
});

const RULES = /Zapfloor|certif|dotac|subsid|\bgrants?\b|české firmy|Czech companies|Miroslav|\+420/iu;
// Every amount of money in the copy, e.g. "80 000 Kč": none is allowed, a company's turnover included
const pricesIn = (copy) => [...new Set([...copy.matchAll(/\b\d[\d\s.,]*\s*(?:Kč|CZK|EUR|USD)|[€$]\s*\d+/giu)].map((m) => m[0].replace(/\s+/g, " ")))];

for (const [lang, site] of [["cs", cs], ["en", en]]) {
  test(`${lang}: copy follows the content rules`, () => {
    const copy = JSON.stringify(site);
    // No client names, certificates or subsidies
    assert.doesNotMatch(copy, RULES);
    // No prices anywhere on the site
    assert.deepEqual(pricesIn(copy), []);
    assert.doesNotMatch(copy, /střední a velké|medium and large/iu);
    // AI training is not offered: no mention of it and no link to its removed pages
    assert.doesNotMatch(copy, /školen|skolen|školic|\btrainings?\b/iu);
    for (const page of [site.home, ...site.services]) {
      assert.ok(page.metadata.title.length <= 60, `${page.metadata.title} (${page.metadata.title.length})`);
      const length = page.metadata.description.length;
      assert.ok(length >= 120 && length <= 160, `${page.metadata.description} (${length})`);
    }
    for (const service of site.services) assert.ok(service.questions.length >= 3 && service.offers.items.length >= 4, service.path);
  });
}

test("the home page share images are 1200 × 630 PNGs", () => {
  for (const lang of ["cs", "en"]) {
    const png = readFileSync(`${root}public/og/${lang}.png`);
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630]);
  }
  assert.match(read("src/components/site/Shell.astro"), /\/og\/\$\{lang\}\.png\?v=4/);
});

test("the content pages: routes, sitemap, navigation and content rules", () => {
  const list = Object.entries(pages);
  // Czech only, except the ones with an English twin under the same key (src/site/pages-en.ts)
  const twinned = Object.keys(pagesEn).map((key) => pages[key].path);
  assert.deepEqual(list.map(([, page]) => page.path).sort(), [...CZECH_ONLY_PAGES, ...twinned].sort());
  const menu = [...cs.menu.main, ...cs.menu.footerServices, ...cs.menu.footerCompany].map((link) => link.href);
  for (const [key, page] of list) {
    assert.ok(SITEMAP_PAGES.includes(page.path), page.path);
    assert.equal(pageIn(page.path, "en"), pagesEn[key]?.path, `${page.path}: its English twin, or none`);
    assert.ok(read(`src/pages${page.path}.astro`).includes(`page="${key}"`), page.path);
    // The industry pages stand behind one menu item, "Pro koho", which leads to the home page's section
    const item = cs.menu.main.find((link) => link.href === page.path || link.covers?.includes(page.path));
    assert.ok(item, `${page.path} is in the main menu`);
    if (item.href !== page.path) assert.ok(cs.home.audience.items.some((row) => row.href === page.path), `${page.path} is in "Pro koho"`);
    assert.ok(page.metadata.title.length <= 60, `${page.metadata.title} (${page.metadata.title.length})`);
    const length = page.metadata.description.length;
    assert.ok(length >= 120 && length <= 160, `${page.metadata.description} (${length})`);
    assert.ok(page.cta.length >= 1 && page.contact.cta.length >= 1, page.path);
  }
  // Every internal link of the Czech site leads to a page that exists
  const copy = JSON.stringify([cs, pages]);
  const internal = [...copy.matchAll(/"href":"(\/[^"#]*)/g)].map((m) => m[1]);
  for (const href of [...menu, ...internal]) assert.ok(SITEMAP_PAGES.includes(href.split("#")[0]), href);
  assert.doesNotMatch(JSON.stringify(pages), RULES);
  assert.deepEqual(pricesIn(JSON.stringify(pages)), []);
});

test("positioning: the hero sells a result, software development is out of the main menu", () => {
  // Both home pages; the page /vyvoj-softwaru itself keeps the word in its own heading
  assert.doesNotMatch(JSON.stringify(cs.home.hero), /software|vývoj/iu);
  assert.doesNotMatch(JSON.stringify([en.home.hero, en.home.metadata]), /software|develop/iu);
  assert.ok(!cs.menu.main.some((link) => /vývoj|software/iu.test(link.label) || link.href === "/vyvoj-softwaru"));
  assert.ok(cs.menu.footerServices.some((link) => link.href === "/vyvoj-softwaru"));
  // The two calls to action of the home page, each an enquiry type of its own
  assert.deepEqual(cs.home.hero.cta.map((cta) => cta.label), ["Objednat AI diagnostiku", "Odhad návratnosti zdarma"]);
  assert.equal(new Set(cs.home.contact.cta.map((cta) => cta.subject)).size, 2);
  assert.equal(cs.home.services.items.length, 4);
  assert.equal(cs.home.process.steps.length, 4);
});

test("the English content pages: route, twin, metadata, links and content rules", () => {
  for (const [key, page] of Object.entries(pagesEn)) {
    assert.equal(pageIn(page.path, "cs"), pages[key].path);
    assert.ok(SITEMAP_PAGES.includes(page.path), page.path);
    const route = read(`src/pages${page.path}.astro`);
    assert.ok(route.includes(`page="${key}"`) && route.includes('lang="en"'), page.path);
    assert.ok(page.metadata.title.length <= 60, `${page.metadata.title} (${page.metadata.title.length})`);
    const length = page.metadata.description.length;
    assert.ok(length >= 120 && length <= 160, `${page.metadata.description} (${length})`);
    assert.ok(page.cta.length >= 1 && page.contact.cta.length >= 1, page.path);
  }
  // Every internal link of the English site leads to an English page that exists
  const copy = JSON.stringify([en, pagesEn]);
  const internal = [...copy.matchAll(/"href":"(\/[^"#]*)/g)].map((m) => m[1]);
  assert.ok(internal.length > 0);
  for (const href of internal) assert.ok(TWIN_PAGES.some((pair) => pair.en === href), href);
  assert.doesNotMatch(JSON.stringify(pagesEn), RULES);
  assert.deepEqual(pricesIn(JSON.stringify(pagesEn)), []);
  assert.doesNotMatch(JSON.stringify(pagesEn), /\btrainings?\b/iu);
});

// Nothing unfinished goes public: no "[doplnit …]", TODO, "[X]" or other stand-in text, no unconfirmed promise,
// guarantee or result, and no preview tag, in the copy of either language
test("no placeholders and no unconfirmed values in the copy", () => {
  const copy = JSON.stringify([cs, en, pages, pagesEn]);
  assert.doesNotMatch(copy, /doplnit|TODO|placeholder|lorem|\[[^\]"]*\]/iu);
  // "Ukázka oprávnění agenta" is a real caption; the preview tag was in capitals
  assert.doesNotMatch(copy, /UKÁZKA|"preview"/u);
  assert.doesNotMatch(copy, /záruk|\bguarantee\b|do 6 týdnů|within 6 weeks/iu);
  for (const site of [cs, en]) for (const key of ["promise", "result", "guarantee"]) assert.ok(!(key in site.home) && !(key in site.home.hero), key);
  assert.deepEqual(pages.results.sections.map((section) => section.id), ["softwarova-firma", "co-merime", "obory"]);
  for (const file of ["src/styles/site.css", "src/components/site/Home.astro", "src/components/site/ContentPage.astro", "src/pages/ochrana-osobnich-udaju.astro"]) {
    assert.doesNotMatch(read(file), /preview-tag|UKÁZKA|DOPLNIT/u, file);
  }
});

test("what we do not do, the named method and the typical situations are in the copy", () => {
  // What we do not do, on the home page and on how we work, in both languages
  for (const [site, page] of [[cs, pages.process], [en, pagesEn.process]]) {
    assert.equal(site.home.notDoing.items.length, 4);
    assert.ok(page.sections.some((section) => section.id === site.home.notDoing.id && section.items.length === 4));
    // The ladder has four phases, numbered from zero
    assert.equal(site.home.process.steps.length, 4);
    assert.equal(site.home.process.from, 0);
  }
  // Typical situations in a client's words on the three industry pages, in quotes and with no names
  for (const page of [pages.manufacturing, pages.software, pages.commerce]) {
    const voices = page.sections.find((section) => section.kind === "voices");
    assert.ok(voices.items.length >= 3 && voices.items.length <= 4, page.path);
    for (const item of voices.items) assert.match(item, /^„.+“$/u);
    assert.match(voices.lead, /Nejsou to citace konkrétních klientů/u);
  }
});

test("positioning: by problem, not by industry", () => {
  const { home, menu, footer } = cs;
  // The hero, the page's metadata and the footer speak to every mid-sized company, not to manufacturing only
  assert.doesNotMatch(JSON.stringify([home.hero, home.gain, home.metadata, footer]), /výrob/iu);
  assert.match(home.hero.lead, /středně velké firmy/u);
  // "Pro koho": the menu item leads to the home page's section, the section to the three industry pages
  const industries = [pages.manufacturing, pages.software, pages.commerce].map((page) => page.path);
  assert.deepEqual(home.audience.items.map((item) => item.href), industries);
  assert.deepEqual(menu.main[0], { href: `/#${home.audience.id}`, label: "Pro koho", covers: industries });
  // The offers of the home page lead to more than one industry
  assert.ok(new Set(home.services.items.map((item) => item.href.split("#")[0])).size >= 3);
  for (const item of home.services.items) assert.ok(item.points.length >= 3, item.title);
  // The company size is headcount and who decides; no turnover anywhere
  const copy = JSON.stringify([cs, pages]);
  assert.doesNotMatch(copy, /obrat|\bmil\.|mld\./iu);
  for (const path of industries) {
    const page = Object.values(pages).find((item) => item.path === path);
    assert.match(JSON.stringify(page), /20 až 500 lidmi, kde rozhoduje majitel nebo vedení/u, path);
    // Each industry page links to the other two, to how we work and to the results
    const links = JSON.stringify(page);
    for (const href of [...industries.filter((other) => other !== path), "/jak-pracujeme", "/vysledky"]) assert.ok(links.includes(`"href":"${href}"`), `${path} → ${href}`);
  }
});

// The first section under the hero: the benefit of an agent on one routine, with no security talk in it
for (const [lang, site, word] of [["cs", cs, /ilustrační/iu], ["en", en, /illustrative/iu]]) {
  test(`${lang}: the section under the hero shows what an agent does instead of people, with illustrative numbers`, () => {
    const { gain } = site.home;
    assert.ok(!("system" in site.home), "the system diagram is gone");
    assert.doesNotMatch(JSON.stringify(gain), /bezpečn|útok|zaútoč|security|attack/iu);
    // Every number in it is labelled: the figure, the note under it and the daily total
    for (const text of [gain.tag, gain.note, gain.scale]) assert.match(text, word, text);
    // The agent takes over steps, a person still confirms: the last step stays with a person
    assert.ok(gain.steps.length >= 4);
    assert.ok(gain.steps.filter((step) => !step.after).length >= 3);
    assert.ok(gain.steps.at(-1).after > 0);
    // The daily total matches the steps: 30 orders a day times the minutes saved per order
    const saved = gain.steps.reduce((sum, step) => sum + step.before - (step.after ?? 0), 0);
    const hours = String((30 * saved) / 60).replace(".", lang === "cs" ? "," : ".");
    assert.ok(gain.scale.includes(`30 `) && gain.scale.includes(hours), `${gain.scale} (${hours} h)`);
    assert.equal(gain.more.items.length, 4);
    for (const item of gain.more.items) assert.ok(item.agent && item.person, item.area);
  });
}
