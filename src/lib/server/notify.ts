import type { Enquiry } from "@/lib/enquiry/fields";
import { flag, isProduction, type ServerEnv } from "./env";
import { errorCode } from "./log";

// Tells the addresses in ENQUIRY_NOTIFY_TO (mirek@ and matous@) about a new enquiry, through Cloudflare
// Email Service: the `EMAIL` send_email binding (wrangler.jsonc), sender ENQUIRY_FROM_EMAIL on sivak.ai,
// which is onboarded for Email Sending. There is no other channel: without the binding nothing is sent
// and the enquiry is only in D1 (admin /admin/poptavky).
// Nothing is ever sent outside production (SITE_ENV=development or preview), when NOTIFY_DISABLED=1,
// or without a sender address (ENQUIRY_FROM_EMAIL) and recipients (ENQUIRY_NOTIFY_TO).
// It is only called once the enquiry is stored, and its failures never change the visitor's answer.
// The log gets the enquiry id and a reason or error code, never the visitor's details or the message.

export type NotifyResult = { sent: boolean; reason?: string; messageId?: string };

const SENDER_NAME = "sivak.ai – poptávky";

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ESCAPES[c]);

function rows(enquiry: Enquiry, id: number): [string, string][] {
  const t = enquiry.tracking;
  const campaign = [t.utm_source, t.utm_medium, t.utm_campaign, t.utm_term, t.utm_content].filter(Boolean).join(" / ");
  return [
    ["Jméno", enquiry.name],
    ["Firma", enquiry.company],
    ["E-mail", enquiry.email],
    ["Telefon", enquiry.phone ?? "–"],
    ["Počet účastníků", enquiry.participants?.toString() ?? "–"],
    ["Poznámka / termín", enquiry.note ?? "–"],
    ["Kampaň (utm)", campaign || "–"],
    ["gclid", t.gclid ? "ano" : "ne"],
    ["Číslo poptávky", `#${id}`],
  ];
}

// A test submission (name or company starting with "TEST") is marked in the subject
export const isTestEnquiry = (enquiry: Pick<Enquiry, "name" | "company">) => enquiry.name.startsWith("TEST") || enquiry.company.startsWith("TEST");

/** `origin` is the site the form was sent from (e.g. https://www.sivak.ai), for the admin link. */
export function buildMessage(enquiry: Enquiry, id: number, origin: string) {
  const prefix = isTestEnquiry(enquiry) ? "[TEST] " : "";
  const subject = `${prefix}Poptávka AI školení: ${enquiry.company} (${enquiry.name})`.replace(/[\r\n]+/g, " ").slice(0, 200);
  const list = rows(enquiry, id);
  const host = new URL(origin).host;
  const admin = `${origin}/admin/poptavky`;
  const text = `Nová poptávka jednodenního AI školení z ${host}/ai-skoleni\n\n${list
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}\n\nOdpovědí na tento e-mail napíšete přímo poptávajícímu.\nVšechny poptávky: ${admin}\n`;
  const html = `<!doctype html><html lang="cs"><body style="font-family:Arial,sans-serif;color:#0B1220">
<h1 style="font-size:18px">Nová poptávka AI školení</h1>
<table cellpadding="6" style="border-collapse:collapse;font-size:14px">${list
    .map(
      ([k, v]) =>
        `<tr><th align="left" valign="top" style="border-bottom:1px solid #ddd">${escapeHtml(k)}</th><td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="font-size:13px;color:#5B6069">Odpovědí na tento e-mail napíšete přímo poptávajícímu. Všechny poptávky: <a href="${escapeHtml(admin)}">${escapeHtml(`${host}/admin/poptavky`)}</a></p>
</body></html>`;
  return { subject, text, html };
}

export async function notifyEnquiry(env: ServerEnv, enquiry: Enquiry, id: number, origin: string): Promise<NotifyResult> {
  const recipients = (env.ENQUIRY_NOTIFY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const from = env.ENQUIRY_FROM_EMAIL?.trim();

  const skip = flag(env.NOTIFY_DISABLED)
    ? "NOTIFY_DISABLED is set"
    : !isProduction(env)
      ? "not production (SITE_ENV)"
      : !env.EMAIL
        ? "no EMAIL send_email binding"
        : !from || recipients.length === 0
          ? "ENQUIRY_FROM_EMAIL or ENQUIRY_NOTIFY_TO is empty"
          : null;

  if (skip || !env.EMAIL || !from) {
    console.log("[enquiry] e-mail not sent", { id, reason: skip });
    return { sent: false, reason: skip ?? "not configured" };
  }

  const message = buildMessage(enquiry, id, origin);
  try {
    const result = await env.EMAIL.send({
      from: { email: from, name: SENDER_NAME },
      to: recipients,
      replyTo: enquiry.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    console.log("[enquiry] e-mail sent", { id });
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    // Email Service errors carry a code such as E_RECIPIENT_NOT_ALLOWED; the message may quote addresses
    const code = errorCode(error);
    console.error("[enquiry] e-mail failed", { id, error: code });
    return { sent: false, reason: code };
  }
}
