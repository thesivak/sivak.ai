// At most LIMIT submissions per visitor (ip_hash) in WINDOW_MS.
// Counted in D1 when it is bound, otherwise in this isolate's memory (good enough for previews).
export const LIMIT = 5;
export const WINDOW_MS = 10 * 60 * 1000;
const KEEP_MS = 24 * 60 * 60 * 1000;

const memory = new Map<string, number[]>();

/** Records this attempt and returns false when the visitor is over the limit. */
export async function allowAttempt(db: D1Database | undefined, ipHash: string, now = Date.now()): Promise<boolean> {
  const since = now - WINDOW_MS;
  if (!db) {
    const recent = (memory.get(ipHash) ?? []).filter((t) => t > since);
    if (recent.length >= LIMIT) return false;
    memory.set(ipHash, [...recent, now]);
    return true;
  }
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM enquiry_attempts WHERE ip_hash = ? AND created_at > ?")
    .bind(ipHash, since)
    .first<{ n: number }>();
  if ((row?.n ?? 0) >= LIMIT) return false;
  await db.batch([
    db.prepare("INSERT INTO enquiry_attempts (ip_hash, created_at) VALUES (?, ?)").bind(ipHash, now),
    db.prepare("DELETE FROM enquiry_attempts WHERE created_at < ?").bind(now - KEEP_MS),
  ]);
  return true;
}
