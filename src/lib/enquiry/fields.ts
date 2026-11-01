// The training enquiry form (/ai-skoleni and its English twin /en/ai-training): field names, limits,
// wording and validation, in both languages.
// Shared by the browser (instant feedback) and the Worker (the authoritative check).
import type { Locale } from "@/i18n/config";

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
  // Hidden: the page's language ("cs" / "en"), for the server's messages and redirects; missing = cs
  lang: "lang",
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
// Czech v2: was "Souhlasím se zpracováním osobních údajů uvedených ve formuláři za účelem vyřízení mé poptávky."
// English (/en/ai-training): the same acknowledgement in English, a wording of its own with its own version.
export const CONSENT: Record<Locale, { version: string; text: string }> = {
  cs: { version: "2026-10-27-v2", text: "Beru na vědomí, že údaje z formuláře zpracujete za účelem vyřízení mé poptávky." },
  en: { version: "2026-11-01-en-v1", text: "I understand that you will process the details in this form to handle my enquiry." },
};
export const CONSENT_VERSION = CONSENT.cs.version;
export const CONSENT_TEXT = CONSENT.cs.text;
// Versions the server still accepts. A page with any other (or none, e.g. a cached old page) gets 409
// "reload"; when the wording changes, add the new version here and drop the old one once pages are gone.
export const SUPPORTED_CONSENT_VERSIONS: readonly string[] = [CONSENT.cs.version, CONSENT.en.version];
export const STALE_FORM_ANCHOR = "formular-zmenen";
export const STALE_FORM_MESSAGES: Record<Locale, string> = {
  cs: "Formulář se mezitím změnil. Obnovte prosím stránku a odešlete ho znovu.",
  en: "The form has changed in the meantime. Please reload the page and send it again.",
};
export const STALE_FORM_MESSAGE = STALE_FORM_MESSAGES.cs;

/** The form's language from its hidden `lang` field: "en" or, for anything else (old pages), "cs". */
export function formLang(raw: Record<string, unknown>): Locale {
  return raw[FIELD.lang] === "en" ? "en" : "cs";
}

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

// Validation messages. Czech names the field in the accusative ("Vyplňte jméno"), English as is.
const ERRORS = {
  cs: {
    labels: { name: "jméno", company: "název firmy" },
    empty: (label: string) => `Vyplňte ${label}.`,
    short: (label: string, min: number) => `Vyplňte ${label} (aspoň ${min} znaky).`,
    long: (label: string, max: number) => `Zkraťte prosím ${label} na nejvýše ${max} znaků.`,
    emailEmpty: "Vyplňte e-mail.",
    email: "Zadejte platnou e-mailovou adresu.",
    phone: "Zadejte platné telefonní číslo včetně předvolby, nebo pole nechte prázdné.",
    participants: (min: number, max: number) => `Zadejte počet účastníků jako celé číslo od ${min} do ${max}.`,
    note: (max: number) => `Zkraťte prosím poznámku na nejvýše ${max} znaků.`,
    consent: "Potvrďte prosím, že jste se seznámili se zpracováním osobních údajů.",
  },
  en: {
    labels: { name: "your name", company: "your company name" },
    empty: (label: string) => `Please enter ${label}.`,
    short: (label: string, min: number) => `Please enter ${label} (at least ${min} characters).`,
    long: (label: string, max: number) => `Please shorten ${label} to ${max} characters or fewer.`,
    emailEmpty: "Please enter your email address.",
    email: "Please enter a valid email address.",
    phone: "Please enter a valid phone number including the country code, or leave the field empty.",
    participants: (min: number, max: number) => `Please enter the number of participants as a whole number from ${min} to ${max}.`,
    note: (max: number) => `Please shorten your note to ${max} characters or fewer.`,
    consent: "Please confirm that you have read how we process your personal data.",
  },
} satisfies Record<Locale, unknown>;

/** Validates raw form values (strings as submitted); messages in `lang`. */
export function validateEnquiry(raw: Record<string, unknown>, lang: Locale = "cs"): Validation {
  const errors: FieldErrors = {};
  const m = ERRORS[lang];
  const lengthError = (value: string, label: string, min: number, max: number): string | undefined => {
    if (!value) return m.empty(label);
    if (value.length < min) return m.short(label, min);
    if (value.length > max) return m.long(label, max);
  };

  const name = clean(raw[FIELD.name]);
  const company = clean(raw[FIELD.company]);
  const email = clean(raw[FIELD.email]).toLowerCase();
  const phone = clean(raw[FIELD.phone]);
  const participantsRaw = clean(raw[FIELD.participants]);
  const note = clean(raw[FIELD.note], true);
  const consent = ["on", "true", "1", "yes"].includes(clean(raw[FIELD.consent]).toLowerCase());

  errors.name = lengthError(name, m.labels.name, LIMITS.name.min, LIMITS.name.max);
  errors.company = lengthError(company, m.labels.company, LIMITS.company.min, LIMITS.company.max);

  if (!email) errors.email = m.emailEmpty;
  else if (email.length > LIMITS.email.max || !EMAIL.test(email)) errors.email = m.email;

  if (phone) {
    const digits = phone.replace(/\D/g, "").length;
    if (phone.length > LIMITS.phone.max || !PHONE_CHARS.test(phone) || digits < LIMITS.phone.minDigits || digits > LIMITS.phone.maxDigits) {
      errors.phone = m.phone;
    }
  }

  let participants: number | null = null;
  if (participantsRaw) {
    const n = Number(participantsRaw);
    if (!/^\d+$/.test(participantsRaw) || !Number.isSafeInteger(n) || n < LIMITS.participants.min || n > LIMITS.participants.max) {
      errors.participants = m.participants(LIMITS.participants.min, LIMITS.participants.max);
    } else {
      participants = n;
    }
  }

  if (note.length > LIMITS.note.max) errors.note = m.note(LIMITS.note.max);
  if (!consent) errors.consent = m.consent;

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
