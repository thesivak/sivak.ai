import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

// Czech lives at "/", English at "/en".
// Visitors whose browser doesn't list Czech (or Slovak) are sent to English,
// unless they picked a language with the switch, which is remembered in a cookie.
// Only the home page is redirected: other pages (e.g. the Czech-only /ai-skoleni) have no English twin.
export const LANG_COOKIE = "lang";
const CZECH_READERS = ["cs", "sk"];
const YEAR = 60 * 60 * 24 * 365;

function browserLocale(header: string | null): Locale {
  // No header usually means a crawler: serve the default so "/" is indexed in Czech
  if (!header) return defaultLocale;
  const langs = header.split(",").map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  return langs.some((lang) => CZECH_READERS.includes(lang)) ? "cs" : "en";
}

/** The cookie's value, or undefined when it is missing or malformed (e.g. `lang=%`): then there is no preference. */
function readCookie(header: string | null, name: string): string | undefined {
  for (const pair of header?.split(";") ?? []) {
    const [key, ...value] = pair.trim().split("=");
    if (key !== name) continue;
    try {
      return decodeURIComponent(value.join("="));
    } catch {
      return undefined;
    }
  }
}

function redirect(url: URL, status: 307 | 308, headers: HeadersInit = {}): Response {
  // A relative Location, as the Next.js site sent
  return new Response(null, { status, headers: { Location: url.pathname + url.search + url.hash, ...headers } });
}

/** Returns the redirect for this request, or null when the page should be served as is. */
export function routeLanguage(request: Request): Response | null {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  // The language switch links carry ?lang=…: remember the choice and drop the parameter
  const chosen = searchParams.get("lang");
  if (chosen && isLocale(chosen)) {
    url.searchParams.delete("lang");
    return redirect(url, 307, {
      "Set-Cookie": `${LANG_COOKIE}=${chosen}; Path=/; Max-Age=${YEAR}; SameSite=Lax`,
    });
  }

  // Czech used to have a /cs prefix internally: /cs/… → /…
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return redirect(url, 308);
  }

  // "/en/" → "/en": the URLs never end with a slash (Next.js answered 308 here too)
  if (pathname.length > 1 && pathname.endsWith("/")) {
    url.pathname = pathname.replace(/\/+$/, "");
    return redirect(url, 308);
  }

  if (pathname !== "/") return null;

  const remembered = readCookie(request.headers.get("cookie"), LANG_COOKIE);
  const locale = remembered && isLocale(remembered) ? remembered : browserLocale(request.headers.get("accept-language"));
  if (locale === "en") {
    url.pathname = "/en";
    return redirect(url, 307, { Vary: "Accept-Language, Cookie" });
  }
  return null;
}
