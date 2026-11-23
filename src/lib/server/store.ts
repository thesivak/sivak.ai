import type { Enquiry } from "@/lib/enquiry/fields";

// consentVersion: the checkbox wording version the page submitted, already checked against SUPPORTED_CONSENT_VERSIONS.
// source: where the enquiry came from, `lang:page#place:label` (enquirySource in src/lib/enquiry/fields.ts).
export type Meta = { createdAt: string; userAgent: string | null; ipHash: string | null; source: string; consentVersion: string };

// Columns of migrations/0001 that the dialog's form does not fill:
//  - phone, participants: from the earlier training form; always NULL now;
//  - company: NOT NULL since 0001, and optional in the form: an empty string means "not given";
//  - note: holds the visitor's message.
export async function insertEnquiry(db: D1Database, enquiry: Enquiry, meta: Meta): Promise<number> {
  const t = enquiry.tracking;
  const row = await db
    .prepare(
      `INSERT INTO enquiries (created_at, source, name, company, email, phone, participants, note,
         consent, consent_at, consent_text_version, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
         gclid, landing_url, user_agent, ip_hash)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
    )
    .bind(
      meta.createdAt, meta.source, enquiry.name, enquiry.company ?? "", enquiry.email, enquiry.message,
      meta.createdAt, meta.consentVersion,
      t.utm_source ?? null, t.utm_medium ?? null, t.utm_campaign ?? null, t.utm_term ?? null, t.utm_content ?? null,
      t.gclid ?? null, enquiry.landingUrl, meta.userAgent?.slice(0, 500) ?? null, meta.ipHash,
    )
    .first<{ id: number }>();
  if (!row?.id) throw new Error("insert returned no id");
  return row.id;
}

export async function markNotified(db: D1Database, id: number, at: string): Promise<void> {
  await db.prepare("UPDATE enquiries SET notified_at = ? WHERE id = ?").bind(at, id).run();
}

// Enquiries are kept for 24 months (privacy policy). Anything that leads to a contract is copied into
// the contract records before then; this table is only the enquiry form's inbox. Run by the hourly cron.
export const ENQUIRY_RETENTION_MONTHS = 24;

export async function pruneEnquiries(db: D1Database, now = new Date()): Promise<number> {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - ENQUIRY_RETENTION_MONTHS);
  return (await db.prepare("DELETE FROM enquiries WHERE created_at < ?").bind(cutoff.toISOString()).run()).meta.changes;
}
