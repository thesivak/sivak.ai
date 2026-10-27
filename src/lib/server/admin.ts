import { safeEqual } from "./crypto";
import type { ServerEnv } from "./env";

// /admin/* is protected by HTTP Basic auth with ADMIN_USER / ADMIN_PASSWORD.
// Without both secrets the admin does not exist (404) — it never falls open.
// Cloudflare Access in front of /admin/* is the recommended extra layer (README → Admin).

export const ADMIN_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

export type AdminAccess = { ok: true } | { ok: false; response: Response };

export async function checkAdmin(request: Request, env: ServerEnv): Promise<AdminAccess> {
  const user = env.ADMIN_USER;
  const password = env.ADMIN_PASSWORD;
  if (!user || !password) {
    return { ok: false, response: new Response("Not found", { status: 404, headers: ADMIN_HEADERS }) };
  }

  const header = request.headers.get("authorization") ?? "";
  let given = ["", ""];
  if (header.toLowerCase().startsWith("basic ")) {
    try {
      const decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0)));
      const colon = decoded.indexOf(":");
      if (colon >= 0) given = [decoded.slice(0, colon), decoded.slice(colon + 1)];
    } catch {
      // malformed header: treated as wrong credentials
    }
  }
  // Both comparisons always run, so the response time doesn't tell which part was wrong
  const [userOk, passwordOk] = await Promise.all([safeEqual(given[0], user), safeEqual(given[1], password)]);
  if (userOk && passwordOk) return { ok: true };

  return {
    ok: false,
    response: new Response("Přihlaste se prosím.", {
      status: 401,
      headers: { ...ADMIN_HEADERS, "WWW-Authenticate": 'Basic realm="sivak.ai admin", charset="UTF-8"', "Content-Type": "text/plain; charset=utf-8" },
    }),
  };
}
