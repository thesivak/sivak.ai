/* global process, console, URL */
// `npm run lastmod`: writes src/data/lastmod.json, every sitemap page → the time of the last commit that
// changed it (`git log -1 --format=%cI -- <its source files>`). The sitemap reads that file, so the build
// needs no git history: Workers Builds may clone shallow, where `git log` would only see the last commit.
// Sources with uncommitted changes count as changed now, so the file can be regenerated and committed
// together with the change.
// `npm run lastmod:check`: exits 1 when the file is missing a page or is behind git (also run by `npm test`).
// Both need the full history; in a shallow clone the write refuses and the check is skipped.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const MANIFEST = "src/data/lastmod.json";
const check = process.argv.includes("--check");
const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).trim();
// Paths as written, never as a glob
const literal = (path) => `:(literal)${path}`;

// What a page is made of: its route, its own components and its copy. Shared chrome (the Base layout,
// header, footer, global styles, src/lib/site.ts, the homepage's nav and contact strings reused
// elsewhere) is left out on purpose: a footer tweak does not make every page "modified".
function training(page, copy) {
  return [
    page,
    "src/components/landing",
    "src/components/sections/Faq.astro",
    "src/styles/landing.css",
    `src/content/landing/${copy}.yaml`,
    `src/content/faq/${copy}`,
  ];
}
// The home page and the three service pages (the 2026 redesign): the route, the page's own components and
// the copy. The copy of one language is one module (src/site/cs.ts, en.ts), so a change to one page's
// copy re-dates that language's four pages.
const PARTS = ["src/components/site/Questions.astro", "src/components/site/Steps.astro", "src/components/site/ContactBlock.astro"];
const home = (route, lang) => [route, "src/components/site/Home.astro", "src/components/site/SystemDiagram.astro", ...PARTS, `src/site/${lang}.ts`];
const service = (route, lang) => [route, "src/components/site/ServicePage.astro", "src/components/site/Sheet.astro", ...PARTS, `src/site/${lang}.ts`];
const SOURCES = {
  "/": home("src/pages/index.astro", "cs"),
  "/en": home("src/pages/en.astro", "en"),
  "/ai-reseni": service("src/pages/ai-reseni.astro", "cs"),
  "/en/ai-solutions": service("src/pages/en/ai-solutions.astro", "en"),
  "/vyvoj-softwaru": service("src/pages/vyvoj-softwaru.astro", "cs"),
  "/en/software-development": service("src/pages/en/software-development.astro", "en"),
  "/bezpecnost": service("src/pages/bezpecnost.astro", "cs"),
  "/en/security": service("src/pages/en/security.astro", "en"),
  // The training page and its English twin share the template (src/components/landing) but not the copy
  "/ai-skoleni": training("src/pages/ai-skoleni.astro", "ai-skoleni"),
  "/en/ai-training": training("src/pages/en/ai-training.astro", "ai-training"),
};

const { SITEMAP_PAGES } = await loadPages();
const sourcesOf = (path) => {
  if (SOURCES[path]) return SOURCES[path];
  throw new Error(`${path} is in the sitemap but scripts/gen-lastmod.mjs does not know its source files: add it to SOURCES`);
};

if (git("rev-parse", "--is-shallow-repository") === "true") {
  const message = "shallow clone: git log cannot date the pages (git fetch --unshallow first)";
  if (check) {
    console.warn(`lastmod:check skipped, ${message}`);
    process.exit(0);
  }
  console.error(`lastmod: ${message}`);
  process.exit(1);
}

const fresh = Object.fromEntries(SITEMAP_PAGES.map((path) => [path, latest(sourcesOf(path).map(dateOf))]));

if (!check) {
  writeFileSync(`${root}${MANIFEST}`, `${JSON.stringify(fresh, null, 2)}\n`);
  for (const [path, date] of Object.entries(fresh)) console.log(`${date}  ${path}`);
  process.exit(0);
}

const stored = existsSync(`${root}${MANIFEST}`) ? JSON.parse(readFileSync(`${root}${MANIFEST}`, "utf8")) : {};
const problems = [
  ...SITEMAP_PAGES.filter((path) => !stored[path]).map((path) => `${path}: missing`),
  ...Object.keys(stored).filter((path) => !SITEMAP_PAGES.includes(path)).map((path) => `${path}: not in the sitemap`),
  // By day: a squash merge re-dates the commit, which is fine as long as it lands the same day
  ...SITEMAP_PAGES.filter((path) => stored[path] && stored[path].slice(0, 10) < fresh[path].slice(0, 10)).map(
    (path) => `${path}: ${stored[path]} in the file, last changed ${fresh[path]}`,
  ),
];
if (problems.length) {
  console.error(`${MANIFEST} is out of date (run npm run lastmod and commit it):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`${MANIFEST} is up to date (${SITEMAP_PAGES.length} pages)`);

/** Last change of one source, a file or folder. */
function dateOf(source) {
  if (git("status", "--porcelain", "--", literal(source))) return now();
  // An untracked path with no history yet is new: now
  return git("log", "-1", "--format=%cI", "--", literal(source)) || now();
}

function latest(dates) {
  return dates.reduce((a, b) => (Date.parse(b) > Date.parse(a) ? b : a));
}

/** The current time like git's %cI: seconds and the local UTC offset. */
function now() {
  const date = new Date();
  const offset = -date.getTimezoneOffset();
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");
  const local = new Date(date.getTime() + offset * 60_000).toISOString().slice(0, 19);
  return `${local}${offset >= 0 ? "+" : "-"}${pad(offset / 60)}:${pad(offset % 60)}`;
}

async function loadPages() {
  const out = await build({
    entryPoints: [`${root}src/i18n/pages.ts`],
    bundle: true,
    write: false,
    format: "esm",
    platform: "neutral",
  });
  return import(`data:text/javascript,${encodeURIComponent(out.outputFiles[0].text)}`);
}
