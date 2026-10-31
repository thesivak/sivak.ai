/* global URL */
// Run with `npm test`. src/data/lastmod.json (the sitemap's <lastmod>) has a valid date for every sitemap
// page and nothing else, and is not behind git (`npm run lastmod:check`, skipped in a shallow clone).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = await build({ entryPoints: [`${root}src/i18n/pages.ts`], bundle: true, write: false, format: "esm", platform: "neutral" });
const { SITEMAP_PAGES } = await import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);
const manifest = JSON.parse(readFileSync(`${root}src/data/lastmod.json`, "utf8"));

test("every sitemap page has a W3C datetime, no extra entries", () => {
  assert.deepEqual(Object.keys(manifest).sort(), [...SITEMAP_PAGES].sort());
  for (const [path, date] of Object.entries(manifest)) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, path);
    assert.ok(Date.parse(date) <= Date.now() + 86_400_000, `${path}: ${date} is in the future`);
  }
});

test("not behind git", () => {
  execFileSync("node", [`${root}scripts/gen-lastmod.mjs`, "--check"], { cwd: root, stdio: "inherit" });
});
