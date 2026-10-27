// The /ai-skoleni enquiry form: field names, limits, wording and validation.
// Shared by the browser (instant feedback) and the Worker (the authoritative check).

export const FIELD = {
  name: "name",
  company: "company",
  email: "email",
  phone: "phone",
  participants: "participants",
  note: "note",
  consent: "consent",
  // Honeypot: hidden from people, filled in by naive bots
  website: "website",
  turnstile: "cf-turnstile-response",
  // Hidden: which checkbox wording the page showed (CONSENT_VERSION at build time)
  consentVersion: "consent_version",
} as const;

export const LIMITS = {
  name: { min: 2, max: 100 },
  company: { min: 2, max: 150 },
  email: { max: 254 },
  phone: { max: 30, minDigits: 9, maxDigits: 15 },
  participants: { min: 1, max: 500 },
  note: { max: 2000 },
  tracking: { max: 200 },
} as const;

// Bump the version whenever the wording changes; each enquiry stores the version it was given.
// The box confirms the visitor has read how the data is processed. It is not a GDPR consent: the legal
// basis is art. 6(1)(b), steps taken at their request before a contract (see /ochrana-osobnich-udaju).
// v2: was "Souhlasím se zpracováním osobních údajů uvedených ve formuláři za účelem vyřízení mé poptávky."
export const CONSENT_VERSION = "2026-10-27-v2";
// Versions the server still accepts. A page with any other (or none, e.g. a cached old page) gets 409
// "reload"; when the wording changes, add the new version here and drop the old one once pages are gone.
export const SUPPORTED_CONSENT_VERSIONS: readonly string[] = [CONSENT_VERSION];
export const STALE_FORM_ANCHOR = "formular-zmenen";
export const STALE_FORM_MESSAGE = "Formulář se mezitím změnil. Obnovte prosím stránku a odešlete ho znovu.";
export const CONSENT_TEXT =
  "Beru na vědomí, že údaje z formuláře zpracujete za účelem vyřízení mé poptávky.";

// Campaign parameters copied from the landing URL into hidden fields
export const TRACKING_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"] as const;
export type TrackingKey = (typeof TRACKING_KEYS)[number];

export type Enquiry = {
  name: string;
  company: string;
  email: string;
  phone: string | null;
  participants: number | null;
  note: string | null;
  consent: true;
  tracking: Partial<Record<TrackingKey, string>>;
  landingUrl: string | null;
};

export type FieldName = "name" | "company" | "email" | "phone" | "participants" | "note" | "consent";
export type FieldErrors = Partial<Record<FieldName, string>>;
export type Validation = { ok: true; value: Enquiry } | { ok: false; errors: FieldErrors };

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const PHONE_CHARS = /^\+?[\d\s()./-]+$/;
// Control characters other than tab and line breaks never belong in the form
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function clean(value: unknown, multiline = false): string {
  if (typeof value !== "string") return "";
  const text = value.replace(CONTROL, "").replace(/\r\n?/g, "\n");
  return (multiline ? text : text.replace(/\s+/g, " ")).trim();
}

function lengthError(value: string, label: string, min: number, max: number): string | undefined {
  if (!value) return `Vyplňte ${label}.`;
  if (value.length < min) return `Vyplňte ${label} (aspoň ${min} znaky).`;
  if (value.length > max) return `Zkraťte prosím ${label} na nejvýše ${max} znaků.`;
}

/** Validates raw form values (strings as submitted). */
export function validateEnquiry(raw: Record<string, unknown>): Validation {
  const errors: FieldErrors = {};

  const name = clean(raw[FIELD.name]);
  const company = clean(raw[FIELD.company]);
  const email = clean(raw[FIELD.email]).toLowerCase();
  const phone = clean(raw[FIELD.phone]);
  const participantsRaw = clean(raw[FIELD.participants]);
  const note = clean(raw[FIELD.note], true);
  const consent = ["on", "true", "1", "yes"].includes(clean(raw[FIELD.consent]).toLowerCase());

  errors.name = lengthError(name, "jméno", LIMITS.name.min, LIMITS.name.max);
  errors.company = lengthError(company, "název firmy", LIMITS.company.min, LIMITS.company.max);

  if (!email) errors.email = "Vyplňte e-mail.";
  else if (email.length > LIMITS.email.max || !EMAIL.test(email)) errors.email = "Zadejte platnou e-mailovou adresu.";

  if (phone) {
    const digits = phone.replace(/\D/g, "").length;
    if (phone.length > LIMITS.phone.max || !PHONE_CHARS.test(phone) || digits < LIMITS.phone.minDigits || digits > LIMITS.phone.maxDigits) {
      errors.phone = "Zadejte platné telefonní číslo včetně předvolby, nebo pole nechte prázdné.";
    }
  }

  let participants: number | null = null;
  if (participantsRaw) {
    const n = Number(participantsRaw);
    if (!/^\d+$/.test(participantsRaw) || !Number.isSafeInteger(n) || n < LIMITS.participants.min || n > LIMITS.participants.max) {
      errors.participants = `Zadejte počet účastníků jako celé číslo od ${LIMITS.participants.min} do ${LIMITS.participants.max}.`;
    } else {
      participants = n;
    }
  }

  if (note.length > LIMITS.note.max) errors.note = `Zkraťte prosím poznámku na nejvýše ${LIMITS.note.max} znaků.`;
  if (!consent) errors.consent = "Potvrďte prosím, že jste se seznámili se zpracováním osobních údajů.";

  for (const key of Object.keys(errors) as FieldName[]) if (!errors[key]) delete errors[key];
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const tracking: Enquiry["tracking"] = {};
  for (const key of TRACKING_KEYS) {
    const value = clean(raw[key]).slice(0, LIMITS.tracking.max);
    if (value) tracking[key] = value;
  }
  const landingUrl = clean(raw.landing_url).slice(0, 500) || null;

  return {
    ok: true,
    value: {
      name,
      company,
      email,
      phone: phone || null,
      participants,
      note: note || null,
      consent: true,
      tracking,
      landingUrl,
    },
  };
}
