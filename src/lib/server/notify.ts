import type { Enquiry } from "@/lib/enquiry/fields";
import { flag, isProduction, type ServerEnv } from "./env";

// Tells mirek@ and matous@ about a new enquiry. Channels, in order of preference:
//   1. Cloudflare Email Service — the `EMAIL` send_email binding (commented out in wrangler.jsonc)
//   2. Resend HTTP API — RESEND_API_KEY
//   3. Log only
// Nothing is ever sent outside production (SITE_ENV=development or preview log instead), when NOTIFY_DISABLED=1,
// or without a sender address (ENQUIRY_FROM_EMAIL) and recipients (ENQUIRY_NOTIFY_TO).

export type NotifyResult = { channel: "cloudflare" | "resend" | "log"; sent: boolean; reason?: string };

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ESCAPES[c]);

function rows(enquiry: Enquiry, id: number | null): [string, string][] {
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
    ["Číslo poptávky", id ? `#${id}` : "neuloženo (DB není nakonfigurovaná)"],
  ];
}

export function buildMessage(enquiry: Enquiry, id: number | null) {
  const subject = `Poptávka AI školení: ${enquiry.company} (${enquiry.name})`.replace(/[\r\n]+/g, " ").slice(0, 200);
  const list = rows(enquiry, id);
  const text = `Nová poptávka jednodenního AI školení z www.sivak.ai/ai-skoleni\n\n${list
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}\n\nOdpovědí na tento e-mail napíšete přímo poptávajícímu.\nVšechny poptávky: https://www.sivak.ai/admin/poptavky\n`;
  const html = `<!doctype html><html lang="cs"><body style="font-family:Arial,sans-serif;color:#0B1220">
<h1 style="font-size:18px">Nová poptávka AI školení</h1>
<table cellpadding="6" style="border-collapse:collapse;font-size:14px">${list
    .map(
      ([k, v]) =>
        `<tr><th align="left" valign="top" style="border-bottom:1px solid #ddd">${escapeHtml(k)}</th><td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="font-size:13px;color:#5B6069">Odpovědí na tento e-mail napíšete přímo poptávajícímu. Všechny poptávky: <a href="https://www.sivak.ai/admin/poptavky">www.sivak.ai/admin/poptavky</a></p>
</body></html>`;
  return { subject, text, html };
}

export async function notifyEnquiry(env: ServerEnv, enquiry: Enquiry, id: number | null): Promise<NotifyResult> {
  const recipients = (env.ENQUIRY_NOTIFY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const from = env.ENQUIRY_FROM_EMAIL?.trim();
  const channel = env.EMAIL ? "cloudflare" : env.RESEND_API_KEY ? "resend" : "log";

  const skip = flag(env.NOTIFY_DISABLED)
    ? "NOTIFY_DISABLED is set"
    : !isProduction(env)
      ? "not production (SITE_ENV)"
      : channel === "log"
        ? "no e-mail channel configured (EMAIL binding or RESEND_API_KEY)"
        : !from || recipients.length === 0
          ? "ENQUIRY_FROM_EMAIL or ENQUIRY_NOTIFY_TO is empty"
          : null;

  const message = buildMessage(enquiry, id);
  if (skip) {
    // Mock delivery: the summary goes to the Worker log. Without a database this is the only copy, so it's complete.
    console.log(`[enquiry] e-mail not sent (${skip})`, id ? { id, subject: message.subject } : message.text);
    return { channel: "log", sent: false, reason: skip };
  }

  try {
    if (channel === "cloudflare") {
      await env.EMAIL!.send({ from: from!, to: recipients, replyTo: enquiry.email, subject: message.subject, text: message.text, html: message.html });
    } else {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: recipients, reply_to: enquiry.email, subject: message.subject, text: message.text, html: message.html }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    return { channel, sent: true };
  } catch (error) {
    console.error(`[enquiry] e-mail via ${channel} failed`, id ? { id } : message.text, error);
    return { channel, sent: false, reason: String(error) };
  }
}
