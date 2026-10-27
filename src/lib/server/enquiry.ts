import { FIELD, TRACKING_KEYS, validateEnquiry, type FieldErrors } from "@/lib/enquiry/fields";
import { sha256Hex } from "./crypto";
import { isProduction, type ServerEnv } from "./env";
import { escapeHtml, notifyEnquiry } from "./notify";
import { allowAttempt } from "./rate-limit";
import { insertEnquiry, markNotified } from "./store";
import { verifyTurnstile } from "./turnstile";

// POST /api/poptavka — the /ai-skoleni form.
// With JavaScript the form sends `Accept: application/json` and shows the answer in place;
// without it the browser posts the form and gets a redirect to the thank-you page (or an error page).

export const THANK_YOU_PATH = "/ai-skoleni/odeslano";
const FORM_PATH = "/ai-skoleni#poptavka";
const MAX_BODY = 32 * 1024;
const FALLBACK_CONTACT = "matous@sivak.ai";

type Context = { env: ServerEnv; waitUntil: (promise: Promise<unknown>) => void };
type Failure = { status: number; message: string; errors?: FieldErrors };

const MESSAGES = {
  invalid: "Zkontrolujte prosím zvýrazněná pole.",
  tooMany: `Odeslali jste příliš mnoho poptávek za krátkou dobu. Zkuste to prosím za pár minut, nebo napište na ${FALLBACK_CONTACT}.`,
  robot: "Nepodařilo se ověřit, že nejste robot. Zkuste formulář odeslat znovu.",
  unavailable: `Formulář je teď nedostupný. Napište nám prosím na ${FALLBACK_CONTACT}.`,
  tooLarge: "Poptávka je příliš dlouhá. Zkraťte prosím poznámku.",
  failed: `Poptávku se nepodařilo uložit. Zkuste to prosím znovu, nebo napište na ${FALLBACK_CONTACT}.`,
  ok: "Děkujeme, poptávku jsme přijali. Ozveme se vám co nejdříve.",
};

async function readFields(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const data = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")]));
  }
  const form = await request.formData();
  const fields: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") fields[key] = value;
  });
  return fields;
}

// Without JavaScript the hidden campaign fields stay empty; the Referer still carries the landing URL
function fillTrackingFromReferer(fields: Record<string, string>, referer: string | null) {
  if (!referer || TRACKING_KEYS.some((key) => fields[key])) return;
  try {
    const url = new URL(referer);
    for (const key of TRACKING_KEYS) {
      const value = url.searchParams.get(key);
      if (value) fields[key] = value;
    }
    fields.landing_url ||= url.pathname + url.search;
  } catch {
    // not a URL: nothing to copy
  }
}

export async function handleEnquiry(request: Request, { env, waitUntil }: Context): Promise<Response> {
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  const respond = (result: Failure | null) => (wantsJson ? jsonResponse(result) : htmlResponse(result));

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return respond({ status: 413, message: MESSAGES.tooLarge });

  let fields: Record<string, string>;
  try {
    fields = await readFields(request);
  } catch {
    return respond({ status: 400, message: MESSAGES.invalid });
  }

  // A filled honeypot is a bot: answer as if all went well, keep nothing
  if (fields[FIELD.website]) {
    console.log("[enquiry] honeypot filled, dropped");
    return respond(null);
  }

  const ip = request.headers.get("cf-connecting-ip");
  const production = isProduction(env);
  if (!env.IP_HASH_SALT && production) console.warn("[enquiry] IP_HASH_SALT is not set; using the built-in salt");
  const ipHash = (await sha256Hex(`${env.IP_HASH_SALT ?? "sivak.ai/ai-skoleni"}:${ip ?? "unknown"}`)).slice(0, 32);

  try {
    if (!(await allowAttempt(env.DB, ipHash))) return respond({ status: 429, message: MESSAGES.tooMany });
  } catch (error) {
    // A broken rate-limit table must not cost us the enquiry
    console.error("[enquiry] rate limit check failed", error);
  }

  fillTrackingFromReferer(fields, request.headers.get("referer"));
  const result = validateEnquiry(fields);
  if (!result.ok) return respond({ status: 400, message: MESSAGES.invalid, errors: result.errors });

  if (!env.TURNSTILE_SECRET_KEY) {
    if (production) {
      console.error("[enquiry] TURNSTILE_SECRET_KEY is not set in production; refusing the submission");
      return respond({ status: 503, message: MESSAGES.unavailable });
    }
    console.warn("[enquiry] TURNSTILE_SECRET_KEY is not set: Turnstile check skipped (allowed outside production only)");
  } else {
    const check = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, fields[FIELD.turnstile] ?? "", ip);
    if (!check.ok) return respond({ status: check.reason === "unavailable" ? 503 : 400, message: MESSAGES.robot });
  }

  const enquiry = result.value;
  const createdAt = new Date().toISOString();
  let id: number | null = null;
  if (env.DB) {
    try {
      id = await insertEnquiry(env.DB, enquiry, { createdAt, userAgent: request.headers.get("user-agent"), ipHash });
    } catch (error) {
      console.error("[enquiry] storing failed", error);
      return respond({ status: 500, message: MESSAGES.failed });
    }
  } else {
    (production ? console.error : console.warn)("[enquiry] D1 binding DB is missing: the enquiry is not stored");
  }

  waitUntil(
    notifyEnquiry(env, enquiry, id).then(async (sent) => {
      if (sent.sent && id && env.DB) await markNotified(env.DB, id, new Date().toISOString());
    }),
  );

  return respond(null);
}

function jsonResponse(failure: Failure | null): Response {
  const body = failure ? { ok: false, message: failure.message, errors: failure.errors ?? {} } : { ok: true, message: MESSAGES.ok };
  return Response.json(body, { status: failure?.status ?? 200, headers: { "Cache-Control": "no-store" } });
}

function htmlResponse(failure: Failure | null): Response {
  if (!failure) return new Response(null, { status: 303, headers: { Location: THANK_YOU_PATH, "Cache-Control": "no-store" } });
  const errors = Object.values(failure.errors ?? {});
  const html = `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Poptávku se nepodařilo odeslat – sivak.ai</title>
<style>body{margin:0;padding:48px 20px;font:17px/1.6 system-ui,sans-serif;background:#F2F0EB;color:#0B1220}main{max-width:640px;margin:auto}h1{font-size:28px;line-height:1.2}a{color:#0B1220}li{margin:6px 0}</style>
</head><body><main>
<h1>Poptávku se nepodařilo odeslat</h1>
<p>${escapeHtml(failure.message)}</p>
${errors.length ? `<ul>${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>` : ""}
<p>Vraťte se tlačítkem Zpět v prohlížeči – vyplněné údaje by tam měly zůstat – nebo <a href="${FORM_PATH}">otevřete formulář znovu</a>.</p>
<p>Případně nám napište na <a href="mailto:${FALLBACK_CONTACT}">${FALLBACK_CONTACT}</a>.</p>
</main></body></html>`;
  return new Response(html, {
    status: failure.status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
