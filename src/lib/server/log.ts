// What the Worker logs about a failure: the error's class and, for D1/SQLite and HTTP errors, its code.
// Never the message itself — provider and database messages can echo what the visitor typed.
export function errorCode(error: unknown): string {
  if (!(error instanceof Error)) return typeof error;
  const code = /\b(D1_[A-Z_]+|SQLITE_[A-Z_]+|HTTP_\d{3})\b/.exec(error.message)?.[1];
  return code ? `${error.name}:${code}` : error.name;
}
