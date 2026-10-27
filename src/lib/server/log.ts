// What the Worker logs about a failure: the error's class and, for D1/SQLite and Email Service errors, its code.
// Never the message itself — provider and database messages can echo what the visitor typed.
export function errorCode(error: unknown): string {
  if (!(error instanceof Error)) return typeof error;
  // Cloudflare Email Service sets error.code (E_SENDER_NOT_VERIFIED, E_RATE_LIMIT_EXCEEDED, …)
  const own = (error as Error & { code?: unknown }).code;
  const code = typeof own === "string" && /^E_[A-Z_]+$/.test(own) ? own : /\b(D1_[A-Z_]+|SQLITE_[A-Z_]+|E_[A-Z_]{3,})\b/.exec(error.message)?.[1];
  return code ? `${error.name}:${code}` : error.name;
}
