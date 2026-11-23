// The enquiry form in the dialog that every call to action opens (src/components/site/EnquiryDialog.astro):
// field names, limits, wording and validation, in both languages.
// Shared by the browser (instant feedback) and the Worker (the authoritative check).
import type { Locale } from "@/i18n/config";

export const FIELD = {
  name: "name",
  email: "email",
  company: "company",
  message: "message",
  consent: "consent",
  // Honeypot: hidden from people, filled in by naive bots
  website: "website",
  turnstile: "cf-turnstile-response",
  // Hidden: which checkbox wording the page showed (CONSENT[lang].version at build time)
  consentVersion: "consent_version",
  // Hidden: the page's language ("cs" / "en"), for the server's messages; missing = cs
  lang: "lang",
  // Hidden, set when the dialog opens: the button's label, where on the page it is (hero, contact,
  // header…) and the page's path. Together they become the stored `source` (enquirySource below).
  cta: "cta",
  ctaPlace: "cta_place",
  page: "page",
} as const;

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  company: { min: 2, max: 150 },
  message: { min: 10, max: 2000 },
  tracking: { max: 200 },
  cta: { max: 120 },
  page: { max: 200 },
} as const;

// Bump the version whenever the wording changes; each enquiry stores the version it was given.
// The box confirms the visitor has read how the data is processed. It is not a GDPR consent: the legal
// basis is art. 6(1)(b), steps taken at their request before a contract (see /ochrana-osobnich-udaju).
// Czech v2: was "Souhlasím se zpracováním osobních údajů uvedených ve formuláři za účelem vyřízení mé poptávky."
// English: the same acknowledgement in English, a wording of its own with its own version.
export const CONSENT: Record<Locale, { version: string; text: string }> = {
  cs: { version: "2026-10-27-v2", text: "Beru na vědomí, že údaje z formuláře zpracujete za účelem vyřízení mé poptávky." },
  en: { version: "2026-11-01-en-v1", text: "I understand that you will process the details in this form to handle my enquiry." },
};
// Versions the server still accepts. A page with any other (or none, e.g. a cached old page) gets 409
// "reload"; when the wording changes, add the new version here and drop the old one once pages are gone.
export const SUPPORTED_CONSENT_VERSIONS: readonly string[] = [CONSENT.cs.version, CONSENT.en.version];
export const STALE_FORM_MESSAGES: Record<Locale, string> = {
  cs: "Formulář se mezitím změnil. Obnovte prosím stránku a odešlete ho znovu.",
  en: "The form has changed in the meantime. Please reload the page and send it again.",
};

/** The form's language from its hidden `lang` field: "en" or, for anything else, "cs". */
export function formLang(raw: Record<string, unknown>): Locale {
  return raw[FIELD.lang] === "en" ? "en" : "cs";
}

// Campaign parameters of the landing URL (sent by the browser, or read from the Referer by the server)
export const TRACKING_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"] as const;
export type TrackingKey = (typeof TRACKING_KEYS)[number];

/** Which call to action the enquiry came from. Empty strings when the page did not say. */
export type EnquiryOrigin = { lang: Locale; page: string; place: string; cta: string };

export type Enquiry = {
  name: string;
  email: string;
  /** Optional: null when not given */
  company: string | null;
  message: string;
  consent: true;
  origin: EnquiryOrigin;
  tracking: Partial<Record<TrackingKey, string>>;
  landingUrl: string | null;
};

export type FieldName = "name" | "email" | "company" | "message" | "consent";
export const FIELD_NAMES: readonly FieldName[] = ["name", "email", "company", "message", "consent"];
export type FieldErrors = Partial<Record<FieldName, string>>;
export type Validation = { ok: true; value: Enquiry } | { ok: false; errors: FieldErrors };

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
// Control characters other than tab and line breaks never belong in the form
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
// A page path as the site writes them: "/", "/en", "/vyvoj-softwaru"…
const PAGE_PATH = /^\/[A-Za-z0-9/._-]*$/;
// Where on the page the button is: an id such as "hero", "contact", "header"
const PLACE = /^[a-z0-9-]{1,40}$/;

function clean(value: unknown, multiline = false): string {
  if (typeof value !== "string") return "";
  const text = value.replace(CONTROL, "").replace(/\r\n?/g, "\n");
  return (multiline ? text : text.replace(/\s+/g, " ")).trim();
}

/**
 * The stored `source` of an enquiry: language, page, place on the page and the button's label, e.g.
 * `cs:/#hero:Objednat AI diagnostiku` or `en:/en/security#contact:Book a security review`.
 * Queryable with LIKE: `source LIKE 'en:%'` (English pages), `source LIKE '%#header:%'` (the header button),
 * `source LIKE '%:Odhad návratnosti zdarma'` (one call to action). The label is the last part and may
 * contain a colon; the other parts never do.
 */
export function enquirySource(origin: EnquiryOrigin): string {
  const where = `${origin.page || "?"}${origin.place ? `#${origin.place}` : ""}`;
  return `${origin.lang}:${where}:${origin.cta || "?"}`.slice(0, 300);
}

// Validation messages. Czech names the field in the accusative ("Vyplňte jméno"), English as is.
const ERRORS = {
  cs: {
    labels: { name: "jméno", company: "název firmy", message: "zprávu" },
    empty: (label: string) => `Vyplňte ${label}.`,
    short: (label: string, min: number) => `Vyplňte ${label} (aspoň ${min} ${min >= 5 ? "znaků" : "znaky"}).`,
    long: (label: string, max: number) => `Zkraťte prosím ${label} na nejvýše ${max} znaků.`,
    emailEmpty: "Vyplňte e-mail.",
    email: "Zadejte platnou e-mailovou adresu.",
    companyShort: (min: number) => `Název firmy musí mít aspoň ${min} znaky, nebo pole nechte prázdné.`,
    consent: "Potvrďte prosím, že jste se seznámili se zpracováním osobních údajů.",
  },
  en: {
    labels: { name: "your name", company: "your company name", message: "a message" },
    empty: (label: string) => `Please enter ${label}.`,
    short: (label: string, min: number) => `Please enter ${label} (at least ${min} characters).`,
    long: (label: string, max: number) => `Please shorten ${label} to ${max} characters or fewer.`,
    emailEmpty: "Please enter your email address.",
    email: "Please enter a valid email address.",
    companyShort: (min: number) => `The company name needs at least ${min} characters, or leave the field empty.`,
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
  const email = clean(raw[FIELD.email]).toLowerCase();
  const company = clean(raw[FIELD.company]);
  const message = clean(raw[FIELD.message], true);
  const consent = ["on", "true", "1", "yes"].includes(clean(raw[FIELD.consent]).toLowerCase());

  errors.name = lengthError(name, m.labels.name, LIMITS.name.min, LIMITS.name.max);

  if (!email) errors.email = m.emailEmpty;
  else if (email.length > LIMITS.email.max || !EMAIL.test(email)) errors.email = m.email;

  // Optional, but when given it has to look like a name
  if (company && company.length < LIMITS.company.min) errors.company = m.companyShort(LIMITS.company.min);
  else if (company.length > LIMITS.company.max) errors.company = m.long(m.labels.company, LIMITS.company.max);

  errors.message = lengthError(message, m.labels.message, LIMITS.message.min, LIMITS.message.max);
  if (!consent) errors.consent = m.consent;

  for (const key of Object.keys(errors) as FieldName[]) if (!errors[key]) delete errors[key];
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const tracking: Enquiry["tracking"] = {};
  for (const key of TRACKING_KEYS) {
    const value = clean(raw[key]).slice(0, LIMITS.tracking.max);
    if (value) tracking[key] = value;
  }
  const landingUrl = clean(raw.landing_url).slice(0, 500) || null;

  // Where the enquiry came from: not the visitor's input, so never an error, only cleaned up
  const page = clean(raw[FIELD.page]);
  const place = clean(raw[FIELD.ctaPlace]);
  const origin: EnquiryOrigin = {
    lang,
    page: page.length <= LIMITS.page.max && PAGE_PATH.test(page) ? page : "",
    place: PLACE.test(place) ? place : "",
    cta: clean(raw[FIELD.cta]).slice(0, LIMITS.cta.max),
  };

  return {
    ok: true,
    value: { name, email, company: company || null, message, consent: true, origin, tracking, landingUrl },
  };
}
