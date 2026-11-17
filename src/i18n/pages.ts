import type { Locale } from "./config";

// Pages that exist in both languages, by their canonical path (no trailing slash, no .html).
// The language switch, the ?lang= compatibility redirect, hreflang and the sitemap all use this list.
export const TWIN_PAGES: Record<Locale, string>[] = [
  { cs: "/", en: "/en" },
  // The three service pages (src/site/{cs,en}.ts)
  { cs: "/ai-reseni", en: "/en/ai-solutions" },
  { cs: "/vyvoj-softwaru", en: "/en/software-development" },
  { cs: "/bezpecnost", en: "/en/security" },
];

// Service pages of the earlier site, each answered with a 308 to the page that replaced it
// (src/lib/routing.ts). Keep these paths in wrangler.jsonc → run_worker_first, or the Worker never sees them.
export const MOVED_PAGES: Record<string, string> = {
  "/ai-agenti": "/ai-reseni",
  "/en/ai-agents": "/en/ai-solutions",
  "/ai-automatizace": "/ai-reseni",
  "/en/ai-automation": "/en/ai-solutions",
  "/pilotni-projekt": "/jak-pracujeme",
  "/en/pilot-project": "/en/ai-solutions",
  "/ai-bezpecnost": "/bezpecnost",
  "/en/ai-security": "/en/security",
};

// Pages that no longer exist and have no replacement: each one, and everything under it (its former
// thank-you page, …), is answered with a 301 to the home page of its language (src/lib/routing.ts).
// Keep "<path>" and "<path>/*" in wrangler.jsonc → run_worker_first: there is no static file left, so
// without the Worker these URLs would be a 404.
export const REMOVED_PAGES: Record<string, string> = {
  "/ai-skoleni": "/",
  "/en/ai-training": "/en",
};

/** The home page a removed page (or anything under it) redirects to, or undefined. */
export function removedPageTarget(path: string): string | undefined {
  for (const [removed, target] of Object.entries(REMOVED_PAGES)) {
    if (path === removed || path.startsWith(`${removed}/`)) return target;
  }
  return undefined;
}

// Pages in Czech only (src/site/pages.ts): no hreflang alternates and no English URL in the sitemap. Their
// language link leads to the English home page. The trailing-slash and .html redirects reach them through
// the wildcards in wrangler.jsonc → run_worker_first; they need no entry of their own, having no ?lang= twin.
// The first three are the industry pages, reached from the home page's "Pro koho" section.
export const CZECH_ONLY_PAGES: string[] = ["/ai-pro-vyrobni-firmy", "/ai-pro-softwarove-firmy", "/ai-pro-obchod-a-eshopy", "/jak-pracujeme", "/vysledky", "/o-nas"];

/** Every indexable page, in sitemap order: the twins (Czech, then English), then the Czech-only pages. */
export const SITEMAP_PAGES: string[] = [...TWIN_PAGES.flatMap((pair) => [pair.cs, pair.en]), ...CZECH_ONLY_PAGES];

/** The pair `path` belongs to, if it has a twin. */
export function twinPair(path: string): Record<Locale, string> | undefined {
  return TWIN_PAGES.find((pair) => pair.cs === path || pair.en === path);
}

/** The page's version in `lang`: its twin, the page itself when it is in `lang` already, or undefined. */
export function pageIn(path: string, lang: Locale): string | undefined {
  return twinPair(path)?.[lang];
}
