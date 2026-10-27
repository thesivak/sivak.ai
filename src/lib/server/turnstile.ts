import { errorCode } from "./log";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare's published test keys (https://developers.cloudflare.com/turnstile/troubleshooting/testing/).
// The test secrets accept or reject any token without a real challenge, and the test site keys
// produce this dummy token: fine for development and preview, never for production.
const TEST_SECRETS = [
  "1x0000000000000000000000000000000AA",
  "2x0000000000000000000000000000000AA",
  "3x0000000000000000000000000000000AA",
];
export const TEST_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";

export function isTestSecret(secret: string | undefined): boolean {
  return !!secret && TEST_SECRETS.includes(secret.trim());
}

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
    console.warn("[enquiry] Turnstile rejected the token", { errors: data["error-codes"] ?? [] });
    return { ok: false, reason: "invalid" };
  } catch (error) {
    console.error("[enquiry] Turnstile siteverify failed", { error: errorCode(error) });
    return { ok: false, reason: "unavailable" };
  }
}
