// Progressive enhancement of the /ai-skoleni enquiry form.
// Without JavaScript the browser validates the inputs and posts the form; the server redirects to a thank-you page.
// With it: the same validation as the server, messages next to the fields, submission without leaving the page,
// and the Google Ads conversion after a successful submit.
import { TRACKING_KEYS, validateEnquiry, type FieldErrors, type FieldName } from "@/lib/enquiry/fields";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

const STORAGE_KEY = "sivak-ai-tracking";
const FIELDS: FieldName[] = ["name", "company", "email", "phone", "participants", "note", "consent"];

// Campaign parameters from the URL the visitor landed on, kept for the session in case they browse first
function tracking(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = Object.fromEntries(TRACKING_KEYS.map((key) => [key, params.get(key) ?? ""]).filter(([, v]) => v));
  if (Object.keys(fromUrl).length > 0) {
    const value = { ...fromUrl, landing_url: window.location.pathname + window.location.search };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // storage blocked: the values still go with this submission
    }
    return value;
  }
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function values(form: HTMLFormElement): Record<string, string> {
  const data: Record<string, string> = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") data[key] = value;
  });
  return data;
}

export function enhanceEnquiryForm(form: HTMLFormElement) {
  const status = form.querySelector<HTMLElement>("[data-status]")!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const success = form.parentElement!.querySelector<HTMLElement>("[data-success]")!;
  const touched = new Set<FieldName>();
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
    const result = validateEnquiry(values(form));
    showErrors(result.ok ? {} : result.errors, touched);
  });
  form.addEventListener("input", (event) => {
    const name = (event.target as HTMLInputElement).name as FieldName;
    if (!touched.has(name)) return;
    const result = validateEnquiry(values(form));
    showErrors(result.ok ? {} : result.errors, new Set([name]));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = values(form);
    const result = validateEnquiry(data);
    FIELDS.forEach((name) => touched.add(name));
    if (!result.ok) {
      showErrors(result.errors);
      status.textContent = "Zkontrolujte prosím zvýrazněná pole.";
      focusFirstError(result.errors);
      return;
    }
    showErrors({});

    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    status.textContent = "Odesíláme poptávku…";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const answer = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; errors?: FieldErrors };
      if (!res.ok || !answer.ok) {
        showErrors(answer.errors ?? {});
        status.textContent = answer.message ?? "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.";
        focusFirstError(answer.errors ?? {});
        window.turnstile?.reset();
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
      status.textContent = "Spojení se nezdařilo. Zkontrolujte připojení k internetu a zkuste to znovu.";
      window.turnstile?.reset();
    } finally {
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
}

// Google Ads conversion (only when PUBLIC_GOOGLE_ADS_ID and the label are set at build time),
// plus a dataLayer event for Google Tag Manager or GA4.
function reportConversion(sendTo: string | undefined) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "ai_skoleni_lead" });
  if (sendTo && typeof window.gtag === "function") window.gtag("event", "conversion", { send_to: sendTo });
}
