-- Failed /admin logins, for the per-visitor login limit (src/lib/server/admin.ts): at most 10 per
-- ip_hash in 15 minutes. Every attempt with credentials is recorded first and a correct login deletes
-- its own row, so only failures remain. The hourly cron deletes rows older than a day.
-- Apply with: npm run db:migrate:local / db:migrate:preview / db:migrate:remote

CREATE TABLE admin_auth_failures (
  ip_hash TEXT NOT NULL,                    -- HMAC-SHA256(IP_HASH_SALT, "admin:" + IP), never the address
  created_at INTEGER NOT NULL               -- Unix time in milliseconds
);

CREATE INDEX admin_auth_failures_ip_time ON admin_auth_failures (ip_hash, created_at);
