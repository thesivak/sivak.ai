// Progressive enhancement of the training enquiry form (/ai-skoleni, /en/ai-training), in the form's language.
// Without JavaScript the browser validates the inputs and posts the form; the server redirects to a thank-you page.
// With it: the same validation as the server, messages next to the fields, submission without leaving the page,
// and the Google Ads conversion after a successful submit. Turnstile loads only once the visitor gets to the
// form (turnstile.ts); the submit waits for its token.
import { TRACKING_STORAGE_KEY as STORAGE_KEY, readConsent } from "@/lib/consent";
import { TRACKING_KEYS, formLang, validateEnquiry, type FieldErrors, type FieldName } from "@/lib/enquiry/fields";
import { lazyTurnstile } from "./turnstile";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const FIELDS: FieldName[] = ["name", "company", "email", "phone", "participants", "note", "consent"];
// Status line under the submit button
const STATUS = {
  cs: {
    invalid: "Zkontrolujte prosím zvýrazněná pole.",
    verifying: "Ověřujeme, že nejste robot…",
    robot: "Nepodařilo se ověřit, že nejste robot. Zkuste formulář odeslat znovu.",
    sending: "Odesíláme poptávku…",
    failed: "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.",
    offline: "Spojení se nezdařilo. Zkontrolujte připojení k internetu a zkuste to znovu.",
  },
  en: {
    invalid: "Please check the highlighted fields.",
    verifying: "Checking that you are not a robot…",
    robot: "We could not verify that you are not a robot. Please try sending the form again.",
    sending: "Sending your enquiry…",
    failed: "Your enquiry could not be sent. Please try again.",
    offline: "Connection failed. Please check your internet connection and try again.",
  },
};
// How long a submit waits for Turnstile, e.g. while the visitor answers an interactive check
const TOKEN_WAIT_MS = 60_000;

// Campaign parameters from the URL the visitor landed on. Kept for the session (in case they browse
// first) only with marketing consent: that storage isn't strictly necessary. Without it the values still
// go with a submission made on the page they arrived on.
function tracking(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = Object.fromEntries(TRACKING_KEYS.map((key) => [key, params.get(key) ?? ""]).filter(([, v]) => v));
  const mayStore = readConsent()?.marketing === true;
  try {
    if (!mayStore) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else if (Object.keys(fromUrl).length === 0) {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
    }
  } catch {
    // storage blocked or garbage: only this page's parameters
  }
  if (Object.keys(fromUrl).length === 0) return {};
  const value = { ...fromUrl, landing_url: window.location.pathname + window.location.search };
  if (mayStore) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // storage blocked: the values still go with this submission
    }
  }
  return value;
}

function values(form: HTMLFormElement): Record<string, string> {
  const data: Record<string, string> = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") data[key] = value;
  });
  return data;
}

export function enhanceEnquiryForm(form: HTMLFormElement) {
  const turnstile = lazyTurnstile(form);
  const status = form.querySelector<HTMLElement>("[data-status]")!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const success = form.parentElement!.querySelector<HTMLElement>("[data-success]")!;
  const touched = new Set<FieldName>();
  // The hidden `lang` field (missing = cs): messages here and from the server in the page's language
  const lang = formLang(values(form));
  const say = STATUS[lang];
  form.noValidate = true;

  const saved = tracking();
  for (const [key, value] of Object.entries(saved)) {
    const input = form.elements.namedItem(key);
    if (input instanceof HTMLInputElement && input.type === "hidden") input.value = value;
  }

  function showErrors(errors: FieldErrors, only?: Set<FieldName>) {
    for (const name of FIELDS) {
      if (only && !only.has(name)) continue;
      const input = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      const slot = form.querySelector<HTMLElement>(`#${name}-error`);
      const message = errors[name] ?? "";
      if (slot) slot.textContent = message;
      if (input) {
        if (message) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
    }
  }

  function focusFirstError(errors: FieldErrors) {
    const first = FIELDS.find((name) => errors[name]);
    if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
  }

  // Feedback once a field has been left, then on every change
  form.addEventListener("focusout", (event) => {
    const name = (event.target as HTMLInputElement).name as FieldName;
    if (!FIELDS.includes(name)) return;
    touched.add(name);
    const result = validateEnquiry(values(form), lang);
    showErrors(result.ok ? {} : result.errors, touched);
  });
  form.addEventListener("input", (event) => {
    const name = (event.target as HTMLInputElement).name as FieldName;
    if (!touched.has(name)) return;
    const result = validateEnquiry(values(form), lang);
    showErrors(result.ok ? {} : result.errors, new Set([name]));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = values(form);
    const result = validateEnquiry(data, lang);
    FIELDS.forEach((name) => touched.add(name));
    if (!result.ok) {
      showErrors(result.errors);
      status.textContent = say.invalid;
      focusFirstError(result.errors);
      return;
    }
    showErrors({});

    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    try {
      if (turnstile) {
        status.textContent = say.verifying;
        try {
          await turnstile.token(TOKEN_WAIT_MS);
        } catch {
          status.textContent = say.robot;
          return;
        }
      }
      status.textContent = say.sending;
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const answer = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; errors?: FieldErrors };
      if (!res.ok || !answer.ok) {
        showErrors(answer.errors ?? {});
        status.textContent = answer.message ?? say.failed;
        focusFirstError(answer.errors ?? {});
        turnstile?.reset();
        return;
      }

      reportConversion(form.dataset.conversion);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // nothing stored
      }
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch {
      status.textContent = say.offline;
      turnstile?.reset();
    } finally {
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
}

// Google Ads conversion: only when PUBLIC_GOOGLE_ADS_ID and the label are set at build time AND the
// visitor allowed marketing cookies (ad_storage granted); otherwise nothing. Plus a dataLayer event.
function reportConversion(sendTo: string | undefined) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "ai_skoleni_lead" });
  if (sendTo && readConsent()?.marketing === true && typeof window.gtag === "function") window.gtag("event", "conversion", { send_to: sendTo });
}
