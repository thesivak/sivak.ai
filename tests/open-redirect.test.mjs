/* global URL, Request */
// Run with `npm test`. Bundles the routing module with esbuild (resolving the "@/" alias) and checks
// that no redirect can point off-site via "//host" or "/\host".
import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = await build({
  entryPoints: [`${root}src/lib/routing.ts`],
  bundle: true,
  write: false,
  format: "esm",
  platform: "neutral",
  alias: { "@": `${root}src` },
});
const { canonicalRedirect } = await import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);

const location = (path) => canonicalRedirect(new Request(`https://www.sivak.ai${path}`))?.headers.get("location");

for (const [path, expected] of [
  ["//x/", "/x"],
  ["//evil.example/", "/evil.example"],
  ["///x//", "/x"],
  ["/\\x/", "/x"],
  ["/cs//x", "/x"],
  ["/cs//evil.example", "/evil.example"],
  ["/cs/\\x", "/x"],
  ["/cs///x/", "/x"],
  ["/en/", "/en"],
  ["/en/index.html/", "/en"],
  ["/index.html", "/"],
  ["/ai-skoleni.html", "/ai-skoleni"],
  ["/cs/ai-skoleni", "/ai-skoleni"],
  ["/ai-agenti?lang=en", "/en/ai-agents"],
  ["//x/?lang=en", "/x"],
]) {
  test(`${path} → ${expected}`, () => {
    const loc = location(path);
    assert.equal(loc, expected);
    assert.match(loc, /^\/(?![/\\])/);
  });
}
