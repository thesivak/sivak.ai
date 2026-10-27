const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = { ok: true; skipped: boolean } | { ok: false; reason: "missing-token" | "invalid" | "unavailable" };

/** Verifies a Turnstile token server-side. Without a secret the check is skipped (the caller decides whether that's allowed). */
export async function verifyTurnstile(secret: string | undefined, token: string, ip: string | null): Promise<TurnstileResult> {
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false, reason: "missing-token" };
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetch(SITEVERIFY, { method: "POST", body });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success) return { ok: true, skipped: false };
    console.warn("Turnstile rejected the token", data["error-codes"]);
    return { ok: false, reason: "invalid" };
  } catch (error) {
    console.error("Turnstile siteverify failed", error);
    return { ok: false, reason: "unavailable" };
  }
}
