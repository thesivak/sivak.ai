import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

// Czech lives at "/", English at "/en".
// Visitors whose browser doesn't list Czech (or Slovak) are sent to English,
// unless they picked a language with the switch, which is remembered in a cookie.
const LANG_COOKIE = "lang";
const CZECH_READERS = ["cs", "sk"];

function browserLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language");
  // No header usually means a crawler: serve the default so "/" is indexed in Czech
  if (!header) return defaultLocale;
  const langs = header.split(",").map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  return langs.some((lang) => CZECH_READERS.includes(lang)) ? "cs" : "en";
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const url = request.nextUrl.clone();

  // The language switch links carry ?lang=…: remember the choice and drop the parameter
  const chosen = searchParams.get("lang");
  if (chosen && isLocale(chosen)) {
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url, 307);
    response.cookies.set(LANG_COOKIE, chosen, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return response;
  }

  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) return;

  const remembered = request.cookies.get(LANG_COOKIE)?.value;
  const locale = remembered && isLocale(remembered) ? remembered : browserLocale(request);
  if (locale === "en") {
    url.pathname = `/en${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
