import type { Locale } from "./config";

// Pages that exist in both languages, by their canonical path (no trailing slash, no .html).
// The language switch, the ?lang= compatibility redirect, hreflang and the sitemap all use this list.
export const TWIN_PAGES: Record<Locale, string>[] = [
  { cs: "/", en: "/en" },
  { cs: "/ai-agenti", en: "/en/ai-agents" },
  { cs: "/ai-automatizace", en: "/en/ai-automation" },
  { cs: "/pilotni-projekt", en: "/en/pilot-project" },
  // The one-day AI training (the Czech page is the Google Ads landing page)
  { cs: "/ai-skoleni", en: "/en/ai-training" },
];

// Pages in Czech only: no hreflang alternates and no English URL in the sitemap. None at the moment;
// /ai-skoleni has had its English twin /en/ai-training since November 2026.
export const CZECH_ONLY_PAGES: string[] = [];

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
