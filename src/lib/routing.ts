import { defaultLocale, isLocale } from "@/i18n/config";
import { MOVED_PAGES, pageIn, removedPageTarget } from "@/i18n/pages";
import { safePath } from "@/lib/safe-path";

// Canonical URLs, answered by the Worker before the static assets (wrangler.jsonc → run_worker_first).
// The asset server would redirect these variants with 307 (html_handling "auto-trailing-slash"), which
// search engines treat as temporary; here they get a permanent 308 to the one URL each page has:
//   /o-nas/  /o-nas.html  /o-nas/index.html  → /o-nas   (the query string is kept)
//   /index.html → /     /en/ → /en     /cs, /cs/… → /, /…  (the old Czech prefix)
//   /ai-agenti, /ai-bezpecnost… → the service page that replaced them (MOVED_PAGES)
//   /ai-skoleni, /en/ai-training and everything under them → / and /en, with 301: pages that were
//                 removed without a replacement (REMOVED_PAGES), in any of the variants above
//   ?lang=en|cs → that language's version of the page when it has one, else the same page; the
//                 parameter is dropped. Old language-switch links of the Next.js site used it.
// There is no language detection: "/" is always the Czech page (200) for browsers and crawlers alike.
// A visitor whose browser prefers the other language gets a small suggestion instead (LanguageHint).
export const LANG_COOKIE = "lang";
const YEAR = 60 * 60 * 24 * 365;

function redirect(url: URL, headers: HeadersInit = {}, status: 301 | 308 = 308): Response {
  // A relative Location, as the Next.js site sent; never "//host" or "/\host" (open redirect)
  return new Response(null, { status, headers: { Location: safePath(url.pathname) + url.search, ...headers } });
}

/** Returns the redirect to the canonical URL, or null when the request already is canonical. */
export function canonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const original = url.pathname + url.search;
  // "//host/" and "/\host/" would become a protocol-relative Location: one leading "/" only
  let pathname = safePath(url.pathname);

  // Czech used to have a /cs prefix internally: /cs/… → /…
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    pathname = safePath(pathname.slice(defaultLocale.length + 1));
  }
  // /x/ → /x: the URLs never end with a slash (Next.js answered 308 here too)
  const stripSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") || "/" : path);
  pathname = stripSlash(pathname);
  // /x.html → /x, /x/index.html → /x, /index.html → /, /en/index.html/ → /en (one hop)
  if (pathname.endsWith(".html")) pathname = stripSlash(pathname.slice(0, -".html".length).replace(/\/index$/, "/"));

  // A service page of the earlier site → the page that replaced it
  pathname = MOVED_PAGES[pathname] ?? pathname;
  // A page removed without a replacement (and anything under it) → the home page of its language, 301
  const removed = removedPageTarget(pathname);
  pathname = removed ?? pathname;

  const headers: Record<string, string> = {};
  const chosen = url.searchParams.get("lang");
  if (chosen !== null) {
    url.searchParams.delete("lang");
    if (isLocale(chosen)) {
      pathname = pageIn(pathname, chosen) ?? pathname;
      // The same remembered choice the language switch stores from JavaScript
      headers["Set-Cookie"] = `${LANG_COOKIE}=${chosen}; Path=/; Max-Age=${YEAR}; SameSite=Lax`;
    }
  }

  url.pathname = pathname;
  return url.pathname + url.search === original ? null : redirect(url, headers, removed ? 301 : 308);
}
