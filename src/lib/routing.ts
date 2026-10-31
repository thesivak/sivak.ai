import { defaultLocale, isLocale } from "@/i18n/config";
import { pageIn } from "@/i18n/pages";
import { safePath } from "@/lib/safe-path";

// Canonical URLs, answered by the Worker before the static assets (wrangler.jsonc → run_worker_first).
// The asset server would redirect these variants with 307 (html_handling "auto-trailing-slash"), which
// search engines treat as temporary; here they get a permanent 308 to the one URL each page has:
//   /ai-skoleni/  /ai-skoleni.html  /ai-skoleni/index.html  → /ai-skoleni   (the query string is kept)
//   /index.html → /     /en/ → /en     /cs, /cs/… → /, /…  (the old Czech prefix)
//   ?lang=en|cs → that language's version of the page when it has one, else the same page; the
//                 parameter is dropped. Old language-switch links of the Next.js site used it.
// There is no language detection: "/" is always the Czech page (200) for browsers and crawlers alike.
// A visitor whose browser prefers the other language gets a small suggestion instead (LanguageHint).
export const LANG_COOKIE = "lang";
const YEAR = 60 * 60 * 24 * 365;

function redirect(url: URL, headers: HeadersInit = {}): Response {
  // A relative Location, as the Next.js site sent; never "//host" or "/\host" (open redirect)
  return new Response(null, { status: 308, headers: { Location: safePath(url.pathname) + url.search, ...headers } });
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
  return url.pathname + url.search === original ? null : redirect(url, headers);
}
