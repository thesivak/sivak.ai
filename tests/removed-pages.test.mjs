/* global URL, Request */
// Run with `npm test`. The AI training pages (/ai-skoleni, /en/ai-training) were removed without a
// replacement: nothing of them is left in the site, every URL they had answers with a 301 to the home page
// of its language, and the Worker really runs on those URLs (wrangler.jsonc → run_worker_first), because
// no static file exists for them any more. The enquiry API they posted to stays; the enquiry dialog that
// every call to action opens posts to it now (tests/enquiry.test.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
// The Worker runtime module is not available in Node: an empty `env` is enough for what these tests call
const workersStub = {
  name: "cloudflare-workers-stub",
  setup(b) {
    b.onResolve({ filter: /^cloudflare:workers$/ }, () => ({ path: "cloudflare:workers", namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export const env = {};", loader: "js" }));
  },
};
const bundle = async (entry) => {
  const out = await build({ entryPoints: [`${root}${entry}`], bundle: true, write: false, format: "esm", platform: "neutral", alias: { "@": `${root}src` }, plugins: [workersStub] });
  return import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);
};
const { TWIN_PAGES, SITEMAP_PAGES, CZECH_ONLY_PAGES, MOVED_PAGES, REMOVED_PAGES, removedPageTarget, pageIn } = await bundle("src/i18n/pages.ts");
const { canonicalRedirect } = await bundle("src/lib/routing.ts");
const read = (path) => readFileSync(`${root}${path}`, "utf8");
const respond = (path) => canonicalRedirect(new Request(`https://www.sivak.ai${path}`));

test("the removed pages are in no page list and lead to the home page of their language", () => {
  assert.deepEqual(REMOVED_PAGES, { "/ai-skoleni": "/", "/en/ai-training": "/en" });
  for (const [path, home] of Object.entries(REMOVED_PAGES)) {
    assert.ok(!SITEMAP_PAGES.includes(path) && !CZECH_ONLY_PAGES.includes(path) && !(path in MOVED_PAGES), path);
    assert.ok(!TWIN_PAGES.some((pair) => pair.cs === path || pair.en === path), `${path} is no twin`);
    assert.equal(pageIn(path, "cs"), undefined);
    assert.equal(pageIn(path, "en"), undefined);
    assert.ok(SITEMAP_PAGES.includes(home), `${home} is a page`);
  }
});

for (const [path, expected] of [
  ["/ai-skoleni", "/"],
  ["/ai-skoleni/", "/"],
  ["/ai-skoleni.html", "/"],
  ["/ai-skoleni/index.html", "/"],
  ["/ai-skoleni/odeslano", "/"],
  ["/ai-skoleni/odeslano/", "/"],
  ["/ai-skoleni/odeslano.html", "/"],
  ["/ai-skoleni/anything/deeper", "/"],
  ["/cs/ai-skoleni", "/"],
  ["/cs/ai-skoleni/odeslano", "/"],
  ["/ai-skoleni?utm_source=google&gclid=abc", "/?utm_source=google&gclid=abc"],
  ["/ai-skoleni#prihlaska", "/"],
  ["/en/ai-training", "/en"],
  ["/en/ai-training/", "/en"],
  ["/en/ai-training.html", "/en"],
  ["/en/ai-training/index.html", "/en"],
  ["/en/ai-training/thank-you", "/en"],
  ["/en/ai-training/thank-you/", "/en"],
  ["/en/ai-training/thank-you.html", "/en"],
  ["/en/ai-training?utm_source=google", "/en?utm_source=google"],
  // The old language switch: one hop to the home page in the chosen language
  ["/ai-skoleni?lang=en", "/en"],
  ["/en/ai-training?lang=cs", "/"],
]) {
  test(`${path} → 301 ${expected}`, () => {
    const res = respond(path);
    assert.equal(res?.status, 301);
    assert.equal(res.headers.get("location"), expected);
    // One hop: the target is canonical itself
    assert.equal(respond(expected), null);
  });
}

test("only the removed pages and what is under them are redirected", () => {
  // Never existed, and look-alikes: left to the 404 page
  for (const path of ["/en/ai-skoleni", "/ai-skoleni-pro-firmy", "/en/ai-training-course", "/ai-training", "/skoleni"]) {
    assert.equal(removedPageTarget(path), undefined, path);
    assert.equal(respond(path), null, path);
  }
  // Other redirects stay permanent 308s
  assert.equal(respond("/o-nas/")?.status, 308);
  assert.equal(respond("/ai-agenti")?.status, 308);
  assert.equal(respond("/bezpecnost?lang=en")?.status, 308);
  assert.equal(respond("/bezpecnost?lang=en").headers.get("location"), "/en/security");
  assert.equal(respond("/en/security?lang=cs").headers.get("location"), "/bezpecnost");
  assert.equal(respond("/en/security/").headers.get("location"), "/en/security");
});

test("the Worker runs first on the removed pages, everything under them, and on every twin", () => {
  const list = read("wrangler.jsonc").match(/"run_worker_first":\s*\[([^\]]*)\]/)[1];
  for (const path of Object.keys(REMOVED_PAGES)) {
    assert.ok(list.includes(`"${path}"`), path);
    assert.ok(list.includes(`"${path}/*"`), `${path}/*`);
  }
  // The variants with a trailing slash or .html reach the Worker through the wildcards
  assert.ok(list.includes('"/*/"') && list.includes('"/*.html"'));
  for (const pair of TWIN_PAGES) for (const path of [pair.cs, pair.en]) assert.ok(list.includes(`"${path}"`), path);
});

test("no page, component, copy or share image of the removed pages is left", () => {
  for (const path of [
    "src/pages/ai-skoleni.astro",
    "src/pages/ai-skoleni",
    "src/pages/en/ai-training.astro",
    "src/pages/en/ai-training",
    "src/components/landing",
    "src/content",
    "public/og/ai-skoleni.png",
    "public/og/en-ai-training.png",
  ]) assert.ok(!existsSync(`${root}${path}`), path);
  // The only form on the site is the enquiry dialog's; nothing links to the removed pages
  const sources = readdirSync(`${root}src`, { recursive: true }).filter((file) => /\.(astro|ts|css)$/.test(file));
  for (const file of sources.filter((name) => /^(pages|components|layouts|site|styles)[\\/]/.test(name) && !/^pages[\\/]api[\\/]/.test(name))) {
    const source = read(`src/${file}`);
    if (!/EnquiryDialog\.astro$/.test(file)) assert.doesNotMatch(source, /<form\b|action=[^\n]*\/api\/poptavka/, file);
    assert.doesNotMatch(source, /href=["'{`]*\/(ai-skoleni|en\/ai-training)/, file);
  }
});

test("the privacy policy no longer links to the removed pages and keeps its effective date", () => {
  const policy = read("src/pages/ochrana-osobnich-udaju.astro");
  assert.ok(!policy.includes('href="/ai-skoleni"') && !policy.includes('href="/en/ai-training"'));
  assert.match(policy, /účinné od 1\. 11\. 2026/);
});
