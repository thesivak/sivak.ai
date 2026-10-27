-- Enquiries from the /ai-skoleni form, and the attempts used for rate limiting.
-- Apply with: wrangler d1 migrations apply sivak-ai --local   (or --remote in production)

CREATE TABLE enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,                 -- ISO 8601, UTC
  source TEXT NOT NULL DEFAULT 'ai-skoleni', -- which form sent it
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  participants INTEGER CHECK (participants IS NULL OR participants BETWEEN 1 AND 500),
  note TEXT,
  consent INTEGER NOT NULL CHECK (consent IN (0, 1)),
  consent_at TEXT,                          -- when the box was ticked (= submission time)
  consent_text_version TEXT NOT NULL,       -- which wording of the consent text was shown
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  landing_url TEXT,                         -- page the visitor arrived on (path and query only)
  user_agent TEXT,
  ip_hash TEXT,                             -- salted SHA-256 of the IP address, never the address itself
  notified_at TEXT                          -- when the e-mail notification was sent, if it was
);

CREATE INDEX enquiries_created_at ON enquiries (created_at DESC);

-- One row per form submission, kept for a day: at most 5 submissions per ip_hash in 10 minutes
CREATE TABLE enquiry_attempts (
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL               -- Unix time in milliseconds
);

CREATE INDEX enquiry_attempts_ip_time ON enquiry_attempts (ip_hash, created_at);
