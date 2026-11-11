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
const { TWIN_PAGES, SITEMAP_PAGES, MOVED_PAGES, pageIn } = await bundle("src/i18n/pages.ts");
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

for (const [lang, site] of [["cs", cs], ["en", en]]) {
  test(`${lang}: copy follows the content rules`, () => {
    const copy = JSON.stringify(site);
    // No client names, certificates, subsidies, prices or company size
    assert.doesNotMatch(copy, /Zapfloor|certif|dotac|subsid|\bgrants?\b|české firmy|Czech companies|Miroslav/iu);
    assert.doesNotMatch(copy, /\b\d[\d\s.,]*\s*(?:Kč|CZK|EUR|USD)|[€$]\s*\d/iu);
    assert.doesNotMatch(copy, /střední a velké|medium and large/iu);
    // AI training is not offered on these pages
    assert.doesNotMatch(copy, /školení|ai-skoleni|\btraining\b/iu);
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
