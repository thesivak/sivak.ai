import { CONSENT_VERSION, type Enquiry } from "@/lib/enquiry/fields";

export type StoredEnquiry = {
  id: number;
  created_at: string;
  source: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  participants: number | null;
  note: string | null;
  consent: number;
  consent_at: string | null;
  consent_text_version: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  landing_url: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  notified_at: string | null;
};

export const COLUMNS: (keyof StoredEnquiry)[] = [
  "id", "created_at", "source", "name", "company", "email", "phone", "participants", "note",
  "consent", "consent_at", "consent_text_version",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "landing_url",
  "user_agent", "ip_hash", "notified_at",
];

export type Meta = { createdAt: string; userAgent: string | null; ipHash: string; source: string };

export async function insertEnquiry(db: D1Database, enquiry: Enquiry, meta: Meta): Promise<number> {
  const t = enquiry.tracking;
  const row = await db
    .prepare(
      `INSERT INTO enquiries (created_at, source, name, company, email, phone, participants, note,
         consent, consent_at, consent_text_version, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
         gclid, landing_url, user_agent, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
    )
    .bind(
      meta.createdAt, meta.source, enquiry.name, enquiry.company, enquiry.email, enquiry.phone, enquiry.participants, enquiry.note,
      meta.createdAt, CONSENT_VERSION,
      t.utm_source ?? null, t.utm_medium ?? null, t.utm_campaign ?? null, t.utm_term ?? null, t.utm_content ?? null,
      t.gclid ?? null, enquiry.landingUrl, meta.userAgent?.slice(0, 500) ?? null, meta.ipHash,
    )
    .first<{ id: number }>();
  return row?.id ?? 0;
}

export async function markNotified(db: D1Database, id: number, at: string): Promise<void> {
  await db.prepare("UPDATE enquiries SET notified_at = ? WHERE id = ?").bind(at, id).run();
}

export async function listEnquiries(db: D1Database, limit?: number): Promise<StoredEnquiry[]> {
  const sql = `SELECT ${COLUMNS.join(", ")} FROM enquiries ORDER BY created_at DESC, id DESC${limit ? " LIMIT ?" : ""}`;
  const statement = limit ? db.prepare(sql).bind(limit) : db.prepare(sql);
  const { results } = await statement.all<StoredEnquiry>();
  return results;
}

export async function countEnquiries(db: D1Database): Promise<number> {
  return (await db.prepare("SELECT COUNT(*) AS n FROM enquiries").first<{ n: number }>())?.n ?? 0;
}
