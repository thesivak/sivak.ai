import { hmacSha256Hex, safeEqual } from "./crypto";
import { siteMode, type ServerEnv } from "./env";
import { errorCode } from "./log";

// /admin/* is protected by HTTP Basic auth with ADMIN_USER / ADMIN_PASSWORD. It never falls open:
//  - no ADMIN_USER, or an ADMIN_PASSWORD shorter than 24 characters → 503 "admin not configured";
//  - no D1 binding, or (outside development) no IP_HASH_SALT → 503 as well: without them the failed
//    logins can't be counted, and there is nothing to show anyway;
//  - at most FAILURE_LIMIT wrong logins per IP hash in FAILURE_WINDOW_MS → 429, counted in D1 table
//    admin_auth_failures (migrations/0002). The hourly cron deletes rows older than a day.
// Cloudflare Access and/or a WAF rate-limiting rule in front of /admin/* are recommended on top (README → Admin).

export const ADMIN_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

export const MIN_PASSWORD_LENGTH = 24;
export const FAILURE_LIMIT = 10;
export const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const FAILURE_KEEP_MS = 23 * 60 * 60 * 1000;

export type AdminAccess = { ok: true; db: D1Database } | { ok: false; response: Response };

const text = (body: string, status: number, headers: Record<string, string> = {}) => ({
  ok: false as const,
  response: new Response(body, { status, headers: { ...ADMIN_HEADERS, "Content-Type": "text/plain; charset=utf-8", ...headers } }),
});

function credentials(request: Request): [string, string] | null {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("basic ")) return null;
  try {
    const decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0)));
    const colon = decoded.indexOf(":");
    return colon >= 0 ? [decoded.slice(0, colon), decoded.slice(colon + 1)] : ["", ""];
  } catch {
    // malformed header: counted as wrong credentials
    return ["", ""];
  }
}

export async function checkAdmin(request: Request, env: ServerEnv): Promise<AdminAccess> {
  const user = env.ADMIN_USER;
  const password = env.ADMIN_PASSWORD;
  const db = env.DB;
  const salt = env.IP_HASH_SALT?.trim();
  const development = siteMode(env) === "development";
  if (!user || !password || password.length < MIN_PASSWORD_LENGTH || !db || (!salt && !development)) {
    console.error("[admin] config error: admin not configured; refusing");
    return text("Admin not configured.", 503);
  }

  const challenge = text("Přihlaste se prosím.", 401, { "WWW-Authenticate": 'Basic realm="sivak.ai admin", charset="UTF-8"' });
  const given = credentials(request);
  // The browser's first request carries no credentials: only answer with the login prompt, count nothing
  if (!given) return challenge;

  // Each login attempt is recorded first, in one statement that refuses once the limit is reached, so
  // parallel guesses can't overshoot. A correct login removes its own row: only failures stay counted.
  // Development without the key shares one bucket; there is no visitor IP to protect locally.
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const ipHash = salt ? (await hmacSha256Hex(salt, `admin:${ip}`)).slice(0, 32) : "development";
  const now = Date.now();
  let attemptId: number;
  try {
    const [admitted] = await db.batch([
      db
        .prepare(
          `INSERT INTO admin_auth_failures (ip_hash, created_at)
           SELECT ?1, ?2 WHERE (SELECT COUNT(*) FROM admin_auth_failures WHERE ip_hash = ?1 AND created_at > ?3) < ?4`,
        )
        .bind(ipHash, now, now - FAILURE_WINDOW_MS, FAILURE_LIMIT),
      pruneStatement(db, now),
    ]);
    if (admitted.meta.changes !== 1) {
      console.warn("[admin] too many failed logins; refused");
      return text("Příliš mnoho neúspěšných pokusů o přihlášení. Zkuste to prosím později.", 429, { "Retry-After": String(FAILURE_WINDOW_MS / 1000) });
    }
    attemptId = admitted.meta.last_row_id;
  } catch (error) {
    console.error("[admin] login limiter failed; refusing", { error: errorCode(error) });
    return text("Admin is unavailable.", 503);
  }

  // Both comparisons always run, so the response time doesn't tell which part was wrong
  const [userOk, passwordOk] = await Promise.all([safeEqual(given[0], user), safeEqual(given[1], password)]);
  if (!(userOk && passwordOk)) {
    console.warn("[admin] failed login");
    return challenge;
  }
  try {
    await db.prepare("DELETE FROM admin_auth_failures WHERE rowid = ?").bind(attemptId).run();
  } catch (error) {
    // The login is valid; a leftover row only counts against the limit until it ages out
    console.warn("[admin] could not clear the login attempt", { error: errorCode(error) });
  }
  return { ok: true, db };
}

function pruneStatement(db: D1Database, now: number): D1PreparedStatement {
  return db.prepare("DELETE FROM admin_auth_failures WHERE created_at < ?").bind(now - FAILURE_KEEP_MS);
}

export async function pruneAdminFailures(db: D1Database, now = Date.now()): Promise<number> {
  return (await pruneStatement(db, now).run()).meta.changes;
}
