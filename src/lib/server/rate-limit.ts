// At most LIMIT submissions per visitor (ip_hash) in WINDOW_MS, counted in D1 (table enquiry_attempts).
export const LIMIT = 5;
export const WINDOW_MS = 10 * 60 * 1000;
// Attempts older than this are deleted on every submission and by the hourly cron (src/worker.ts),
// so no row lives longer than 24 hours, as the privacy policy says.
export const KEEP_MS = 23 * 60 * 60 * 1000;

/**
 * Records this attempt and returns false when the visitor is over the limit. Throws when D1 fails.
 * Counting and inserting are one statement, and D1 runs statements one at a time, so parallel
 * requests can't all slip under the limit.
 */
export async function allowAttempt(db: D1Database, ipHash: string, now = Date.now()): Promise<boolean> {
  const [admitted] = await db.batch([
    db
      .prepare(
        `INSERT INTO enquiry_attempts (ip_hash, created_at)
         SELECT ?1, ?2 WHERE (SELECT COUNT(*) FROM enquiry_attempts WHERE ip_hash = ?1 AND created_at > ?3) < ?4`,
      )
      .bind(ipHash, now, now - WINDOW_MS, LIMIT),
    pruneStatement(db, now),
  ]);
  return admitted.meta.changes === 1;
}

function pruneStatement(db: D1Database, now: number): D1PreparedStatement {
  return db.prepare("DELETE FROM enquiry_attempts WHERE created_at < ?").bind(now - KEEP_MS);
}

export async function pruneAttempts(db: D1Database, now = Date.now()): Promise<number> {
  return (await pruneStatement(db, now).run()).meta.changes;
}
