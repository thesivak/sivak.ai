/* global URL, Request */
// Run with `npm test`. The training page /ai-skoleni and its English twin /en/ai-training: the twin pair
// (hreflang, sitemap, language switch), the ?lang= and trailing-slash redirects, the run_worker_first list,
// the English copy (price, content rules, no contact details) and the form in both languages.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
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
const { TWIN_PAGES, SITEMAP_PAGES, CZECH_ONLY_PAGES, pageIn } = await bundle("src/i18n/pages.ts");
const { canonicalRedirect } = await bundle("src/lib/routing.ts");
const { CONSENT, SUPPORTED_CONSENT_VERSIONS, formLang, validateEnquiry } = await bundle("src/lib/enquiry/fields.ts");
const { buildMessage } = await bundle("src/lib/server/notify.ts");
const read = (path) => readFileSync(`${root}${path}`, "utf8");
const NBSP = " ";

test("/ai-skoleni and /en/ai-training are twins, both in the sitemap", () => {
  assert.ok(TWIN_PAGES.some((pair) => pair.cs === "/ai-skoleni" && pair.en === "/en/ai-training"));
  assert.equal(pageIn("/ai-skoleni", "en"), "/en/ai-training");
  assert.equal(pageIn("/en/ai-training", "cs"), "/ai-skoleni");
  assert.ok(SITEMAP_PAGES.includes("/ai-skoleni") && SITEMAP_PAGES.includes("/en/ai-training"));
  assert.ok(!CZECH_ONLY_PAGES.includes("/ai-skoleni"));
});

for (const [path, expected] of [
  ["/en/ai-training/", "/en/ai-training"],
  ["/en/ai-training.html", "/en/ai-training"],
  ["/ai-skoleni?lang=en", "/en/ai-training"],
  ["/en/ai-training?lang=cs", "/ai-skoleni"],
]) {
  test(`${path} → 308 ${expected}`, () => {
    const res = canonicalRedirect(new Request(`https://www.sivak.ai${path}`));
    assert.equal(res?.status, 308);
    assert.equal(res.headers.get("location"), expected);
  });
}

test("the Worker runs first on both training pages (for ?lang=)", () => {
  const list = read("wrangler.jsonc").match(/"run_worker_first":\s*\[([^\]]*)\]/)[1];
  for (const pair of TWIN_PAGES) for (const path of [pair.cs, pair.en]) assert.ok(list.includes(`"${path}"`), path);
});

test("English copy: price with no-break spaces, Mirek Sivák, no contact details or banned words", () => {
  const faq = readdirSync(`${root}src/content/faq/ai-training`).map((f) => read(`src/content/faq/ai-training/${f}`));
  // The copy itself, without the YAML comments
  const copy = [read("src/content/landing/ai-training.yaml"), ...faq].join("\n").replace(/^\s*#.*$/gm, "");
  assert.equal(faq.length, readdirSync(`${root}src/content/faq/ai-skoleni`).length, "same number of FAQ entries as the Czech page");
  assert.ok(copy.includes(`35${NBSP}000${NBSP}Kč`) && copy.includes(`excl.${NBSP}VAT`));
  assert.doesNotMatch(copy, /35 000|excl\. VAT/);
  assert.match(copy, /Mirek Sivák/);
  assert.doesNotMatch(copy, /Miroslav|dotac|subsid|\bgrants?\b|pilot(ní)? agent|@|\+420|\(CZ\)/i);
  assert.doesNotMatch(read("src/content/home/en.yaml"), /href: \/ai-skoleni|\(CZ\)/);
});

test("the form validates in the page's language", () => {
  assert.equal(formLang({ lang: "en" }), "en");
  assert.equal(formLang({}), "cs");
  assert.ok(SUPPORTED_CONSENT_VERSIONS.includes(CONSENT.en.version) && SUPPORTED_CONSENT_VERSIONS.includes(CONSENT.cs.version));
  const en = validateEnquiry({ email: "x" }, "en");
  assert.equal(en.ok, false);
  assert.equal(en.errors.email, "Please enter a valid email address.");
  assert.equal(en.errors.name, "Please enter your name.");
  assert.equal(validateEnquiry({ email: "x" }).errors.email, "Zadejte platnou e-mailovou adresu.");
  const valid = { name: "Jane Doe", company: "Acme", email: "jane@example.com", consent: "on" };
  assert.equal(validateEnquiry(valid, "en").ok, true);
});

test("the notification names the form's page in the subject, text and HTML", () => {
  const enquiry = { name: "Jane Doe", company: "Acme", email: "jane@example.com", phone: null, participants: null, note: null, consent: true, tracking: {}, landingUrl: null };
  const en = buildMessage(enquiry, 1, "https://www.sivak.ai", "/en/ai-training");
  assert.match(en.subject, /anglická stránka/);
  assert.ok(en.text.includes("www.sivak.ai/en/ai-training") && en.html.includes("www.sivak.ai/en/ai-training"));
  const cs = buildMessage(enquiry, 2, "https://www.sivak.ai");
  assert.ok(cs.html.includes("www.sivak.ai/ai-skoleni") && !cs.subject.includes("anglická"));
});
