import type { Locale } from "@/i18n/config";
import { FIELD, STALE_FORM_MESSAGES, SUPPORTED_CONSENT_VERSIONS, TRACKING_KEYS, enquirySource, formLang, validateEnquiry, type FieldErrors } from "@/lib/enquiry/fields";
import { hmacSha256Hex } from "./crypto";
import { siteMode, type ServerEnv } from "./env";
import { errorCode } from "./log";
import { escapeHtml } from "@/lib/escape";
import { notifyEnquiry } from "./notify";
import { allowAttempt } from "./rate-limit";
import { insertEnquiry, markNotified } from "./store";
import { TEST_TOKEN, isTestSecret, verifyTurnstile } from "./turnstile";

// POST /api/poptavka — the enquiry form in the dialog that every call to action opens
// (src/components/site/EnquiryDialog.astro, on every page of both languages).
// The form's hidden `lang` field picks the language of the answer; until the body is parsed (configuration
// errors, size, rate limit) the Referer path does ("/en…" = English).
// The dialog sends `Accept: application/json` and shows the answer in place. The dialog needs JavaScript
// (and so does Turnstile); a plain form post still gets a short HTML page, never a redirect to a form page.
//
// Order: configuration, body size, rate limit (cheap, before anything is parsed), parsing and validation,
// Turnstile, the D1 insert. The visitor only hears "accepted" once the row is stored.
// Production and the public preview ("strict") refuse submissions rather than run without IP_HASH_SALT
// or a working rate limit; only SITE_ENV=development may skip them (with a logged warning).
// Logs carry the enquiry id, a reason and error codes, never what the visitor typed, their IP or user agent.

// The home page of each language: the link back from the HTML answer
const HOME: Record<Locale, string> = { cs: "/", en: "/en" };
export const MAX_BODY = 32 * 1024;

type Context = { env: ServerEnv; waitUntil: (promise: Promise<unknown>) => void };
type Failure = { status: number; message: string; errors?: FieldErrors };

const MESSAGES: Record<Locale, Record<"invalid" | "tooMany" | "robot" | "unavailable" | "tooLarge" | "stale" | "failed" | "ok", string>> = {
  cs: {
    invalid: "Zkontrolujte prosím zvýrazněná pole.",
    tooMany: "Odeslali jste příliš mnoho poptávek za krátkou dobu. Zkuste to prosím znovu za pár minut.",
    robot: "Nepodařilo se ověřit, že nejste robot. Zkuste formulář odeslat znovu.",
    unavailable: "Formulář je teď dočasně nedostupný. Zkuste to prosím znovu později.",
    tooLarge: "Poptávka je příliš dlouhá. Zkraťte prosím zprávu.",
    stale: STALE_FORM_MESSAGES.cs,
    failed: "Poptávku se teď nepodařilo uložit. Zkuste to prosím znovu později.",
    ok: "Děkujeme, poptávku jsme přijali. Ozveme se vám co nejdříve.",
  },
  en: {
    invalid: "Please check the highlighted fields.",
    tooMany: "You have sent too many enquiries in a short time. Please try again in a few minutes.",
    robot: "We could not verify that you are not a robot. Please try sending the form again.",
    unavailable: "The form is temporarily unavailable. Please try again later.",
    tooLarge: "Your enquiry is too long. Please shorten your message.",
    stale: STALE_FORM_MESSAGES.en,
    failed: "We could not save your enquiry just now. Please try again later.",
    ok: "Thank you, we have received your enquiry. We will get back to you as soon as possible.",
  },
};

// The answer page for a plain form post (no JavaScript)
const ANSWER_PAGE: Record<Locale, { failed: string; ok: string; back: (href: string) => string }> = {
  cs: {
    failed: "Poptávku se nepodařilo odeslat",
    ok: "Poptávku jsme přijali",
    back: (href) => `Vraťte se tlačítkem Zpět v prohlížeči, nebo <a href="${href}">přejděte na úvodní stránku</a>.`,
  },
  en: {
    failed: "Your enquiry could not be sent",
    ok: "We have received your enquiry",
    back: (href) => `Use your browser's Back button, or <a href="${href}">go to the home page</a>.`,
  },
};

/** The page's language before the body is read: the Referer's path ("/en/…" is English). */
function refererLang(referer: string | null): Locale {
  try {
    const path = referer ? new URL(referer).pathname : "";
    return path === "/en" || path.startsWith("/en/") ? "en" : "cs";
  } catch {
    return "cs";
  }
}

/** Reads the body, but never more than `max` bytes: null when it is larger, whatever Content-Length says. */
async function readBody(request: Request, max: number): Promise<Uint8Array<ArrayBuffer> | null> {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

async function parseFields(body: Uint8Array<ArrayBuffer>, type: string): Promise<Record<string, string>> {
  if (type.includes("application/json")) {
    const data = JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")]));
  }
  // urlencoded or multipart; the original Content-Type carries the multipart boundary
  const form = await new Response(body, { headers: { "Content-Type": type } }).formData();
  const fields: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") fields[key] = value;
  });
  return fields;
}

// The dialog sends no campaign fields: the Referer (the page the dialog was opened on) carries them, and
// it also stands in for the page path when the hidden `page` field is missing
function fillFromReferer(fields: Record<string, string>, referer: string | null) {
  if (!referer) return;
  let url: URL;
  try {
    url = new URL(referer);
  } catch {
    return; // not a URL: nothing to copy
  }
  fields[FIELD.page] ||= url.pathname;
  if (TRACKING_KEYS.some((key) => fields[key])) return;
  for (const key of TRACKING_KEYS) {
    const value = url.searchParams.get(key);
    if (value) fields[key] = value;
  }
  fields.landing_url ||= url.pathname + url.search;
}

export async function handleEnquiry(request: Request, { env, waitUntil }: Context): Promise<Response> {
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  // The Referer's guess until the form's own `lang` field is read
  let lang = refererLang(request.headers.get("referer"));
  const respond = (result: Failure | null) => (wantsJson ? jsonResponse(result, lang) : htmlResponse(result, lang));
  const mode = siteMode(env);
  const production = mode === "production";
  const strict = mode !== "development";

  // Configuration: without it nothing could be stored (or stored safely), so the body isn't even read
  const db = env.DB;
  if (!db) {
    console.error("[enquiry] config error: the D1 binding DB is missing; refusing the submission", { mode });
    return respond({ status: 503, message: MESSAGES[lang].unavailable });
  }
  const salt = env.IP_HASH_SALT?.trim();
  if (!salt && strict) {
    console.error("[enquiry] config error: IP_HASH_SALT is not set; refusing the submission", { mode });
    return respond({ status: 503, message: MESSAGES[lang].unavailable });
  }
  const turnstileSecret = env.TURNSTILE_SECRET_KEY?.trim();
  if (production && !turnstileSecret) {
    console.error("[enquiry] config error: TURNSTILE_SECRET_KEY is not set in production; refusing the submission");
    return respond({ status: 503, message: MESSAGES[lang].unavailable });
  }
  if (production && isTestSecret(turnstileSecret)) {
    // Test keys would let any bot through
    console.error("[enquiry] config error: Turnstile test secret in production; refusing the submission");
    return respond({ status: 503, message: MESSAGES[lang].unavailable });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return respond({ status: 413, message: MESSAGES[lang].tooLarge });
  let body: Uint8Array<ArrayBuffer> | null;
  try {
    body = await readBody(request, MAX_BODY);
  } catch {
    return respond({ status: 400, message: MESSAGES[lang].invalid });
  }
  if (!body) return respond({ status: 413, message: MESSAGES[lang].tooLarge });

  // Keyed hash of the IP: the rate limit and the ip_hash column. Without the key (development only) neither.
  const ip = request.headers.get("cf-connecting-ip");
  const ipHash = salt ? (await hmacSha256Hex(salt, ip ?? "unknown")).slice(0, 32) : null;
  if (ipHash) {
    try {
      if (!(await allowAttempt(db, ipHash))) return respond({ status: 429, message: MESSAGES[lang].tooMany });
    } catch (error) {
      if (strict) {
        console.error("[enquiry] rate limit failed; refusing the submission", { error: errorCode(error) });
        return respond({ status: 503, message: MESSAGES[lang].failed });
      }
      console.warn("[enquiry] rate limit failed; let through in development only", { error: errorCode(error) });
    }
  } else {
    console.warn("[enquiry] config warning: IP_HASH_SALT is not set: no rate limit and no ip_hash (development only)");
  }

  let fields: Record<string, string>;
  try {
    fields = await parseFields(body, request.headers.get("content-type") ?? "");
  } catch {
    return respond({ status: 400, message: MESSAGES[lang].invalid });
  }
  lang = formLang(fields);

  // A filled honeypot is a bot: answer as if all went well, keep nothing
  if (fields[FIELD.website]) {
    console.log("[enquiry] honeypot filled, dropped");
    return respond(null);
  }

  // The page must have shown a checkbox wording we still accept; an old cached page has to be reloaded
  const consentVersion = (fields[FIELD.consentVersion] ?? "").trim();
  if (!SUPPORTED_CONSENT_VERSIONS.includes(consentVersion)) {
    console.warn("[enquiry] unsupported consent_version; asked to reload", { missing: consentVersion === "" });
    return respond({ status: 409, message: MESSAGES[lang].stale });
  }

  fillFromReferer(fields, request.headers.get("referer"));
  const result = validateEnquiry(fields, lang);
  if (!result.ok) return respond({ status: 400, message: MESSAGES[lang].invalid, errors: result.errors });

  const token = fields[FIELD.turnstile] ?? "";
  if (!turnstileSecret) {
    console.warn(`[enquiry] TURNSTILE_SECRET_KEY is not set: Turnstile check skipped (SITE_ENV=${mode}, allowed outside production only)`);
  } else if (production && token === TEST_TOKEN) {
    // The page was built with the test site key
    console.error("[enquiry] config error: Turnstile test token in production; refusing the submission");
    return respond({ status: 503, message: MESSAGES[lang].unavailable });
  } else {
    const check = await verifyTurnstile(turnstileSecret, token, ip);
    if (!check.ok) return respond({ status: check.reason === "unavailable" ? 503 : 400, message: MESSAGES[lang].robot });
  }

  const enquiry = result.value;
  const createdAt = new Date().toISOString();
  let id: number;
  try {
    // Which button on which page, e.g. "cs:/#hero:Objednat AI diagnostiku" (enquirySource in fields.ts).
    // Preview and development have databases of their own, so the source carries no mode.
    const source = enquirySource(enquiry.origin);
    id = await insertEnquiry(db, enquiry, { createdAt, userAgent: request.headers.get("user-agent"), ipHash, source, consentVersion });
  } catch (error) {
    console.error("[enquiry] storing failed; the visitor was asked to retry", { error: errorCode(error) });
    return respond({ status: 503, message: MESSAGES[lang].failed });
  }
  console.log("[enquiry] stored", { id });

  // The row is stored: from here on it's a success, even if the e-mail fails
  waitUntil(
    notifyEnquiry(env, enquiry, id, new URL(request.url).origin)
      .then(async (sent) => {
        if (sent.sent) await markNotified(db, id, new Date().toISOString());
      })
      .catch((error) => console.error("[enquiry] notification bookkeeping failed", { id, error: errorCode(error) })),
  );

  return respond(null);
}

function jsonResponse(failure: Failure | null, lang: Locale): Response {
  const body = failure ? { ok: false, message: failure.message, errors: failure.errors ?? {} } : { ok: true, message: MESSAGES[lang].ok };
  return Response.json(body, { status: failure?.status ?? 200, headers: { "Cache-Control": "no-store" } });
}

function htmlResponse(failure: Failure | null, lang: Locale): Response {
  const page = ANSWER_PAGE[lang];
  const title = failure ? page.failed : page.ok;
  const errors = Object.values(failure?.errors ?? {});
  const html = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${title} – sivak.ai</title>
<style>body{margin:0;padding:48px 20px;font:17px/1.6 system-ui,sans-serif;background:#F4F5F2;color:#0B1220}main{max-width:640px;margin:auto}h1{font-size:28px;line-height:1.2}a{color:#0B1220}li{margin:6px 0}</style>
</head><body><main>
<h1>${title}</h1>
<p>${escapeHtml(failure ? failure.message : MESSAGES[lang].ok)}</p>
${errors.length ? `<ul>${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>` : ""}
<p>${page.back(HOME[lang])}</p>
</main></body></html>`;
  return new Response(html, {
    status: failure?.status ?? 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
