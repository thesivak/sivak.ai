// The enquiry dialog (src/components/site/EnquiryDialog.astro), in the page's language.
// Every [data-enquiry-open] button opens it with its own label as the title; the label, the button's place
// on the page and the page's path go with the enquiry as hidden fields. Focus moves into the dialog and
// back to the button when it closes (Escape, the close button, a click on the backdrop). The form is
// validated with the server's own code (src/lib/enquiry/fields.ts), messages next to the fields, and sent
// without leaving the page; Turnstile loads on the first opening (turnstile.ts) and the submit waits for it.
import { FIELD_NAMES, formLang, validateEnquiry, type FieldErrors, type FieldName } from "@/lib/enquiry/fields";
import { lazyTurnstile } from "./turnstile";

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

function values(form: HTMLFormElement): Record<string, string> {
  const data: Record<string, string> = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") data[key] = value;
  });
  return data;
}

const TABBABLE = 'a[href], button:not([disabled]), input:not([type="hidden"]):not([tabindex="-1"]):not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
const visible = (element: HTMLElement) => (element.checkVisibility ? element.checkVisibility() : element.offsetParent !== null);

export function setupEnquiryDialog(dialog: HTMLDialogElement) {
  const title = dialog.querySelector<HTMLElement>("[data-enquiry-title]")!;
  const defaultTitle = title.textContent ?? "";
  const body = dialog.querySelector<HTMLElement>("[data-enquiry-body]");
  const form = dialog.querySelector<HTMLFormElement>("[data-enquiry-form]");
  const success = dialog.querySelector<HTMLElement>("[data-enquiry-success]")!;
  const hidden = (name: string) => dialog.querySelector<HTMLInputElement>(`[data-enquiry-field="${name}"]`);
  const formApi = form && body ? enhanceForm(form, body, success) : null;
  let opener: HTMLElement | null = null;

  function open(button: HTMLElement) {
    opener = button;
    const label = (button.dataset.enquiryCta ?? "").trim();
    title.textContent = label || defaultTitle;
    const cta = hidden("cta");
    const place = hidden("place");
    const page = hidden("page");
    if (cta) cta.value = label;
    if (place) place.value = button.dataset.enquiryPlace ?? "";
    if (page) page.value = window.location.pathname;
    // After a sent enquiry the next opening starts with an empty form
    if (!success.hidden && form && body) {
      form.reset();
      body.hidden = false;
      success.hidden = true;
      formApi?.clear();
    }
    dialog.showModal();
    formApi?.opened();
    // The first field, or the dialog's only link / button when the form is unavailable
    const first = form?.querySelector<HTMLElement>("input:not([type=hidden]):not([tabindex='-1']), textarea");
    (first ?? dialog.querySelector<HTMLElement>(".enq-close"))?.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener("close", () => {
    // Back to the button that opened it; a header button hidden in the closed mobile menu gives way to the menu toggle
    const target = opener && visible(opener) ? opener : document.querySelector<HTMLElement>(".top-toggle");
    if (target && visible(target)) target.focus();
    opener = null;
  });

  document.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest<HTMLElement>("[data-enquiry-open]");
    if (!button) return;
    event.preventDefault();
    open(button);
  });
  dialog.querySelectorAll("[data-enquiry-close]").forEach((button) => button.addEventListener("click", close));

  // Focus trap: the page behind a modal dialog is inert, but Tab past the last control would leave for the
  // browser's own toolbar; wrap around instead (the Turnstile frame is one of the stops)
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const stops = [...dialog.querySelectorAll<HTMLElement>(TABBABLE)].filter(visible);
    if (stops.length === 0) return;
    const first = stops[0];
    const last = stops[stops.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // A click on the backdrop (the dialog element itself, outside its content) closes it; a press that
  // starts inside, e.g. selecting text, and ends outside does not
  let pressedOutside = false;
  dialog.addEventListener("pointerdown", (event) => (pressedOutside = event.target === dialog));
  dialog.addEventListener("click", (event) => {
    if (pressedOutside && event.target === dialog) close();
    pressedOutside = false;
  });
}

function enhanceForm(form: HTMLFormElement, body: HTMLElement, success: HTMLElement) {
  const turnstile = lazyTurnstile(form);
  const status = form.querySelector<HTMLElement>("[data-enquiry-status]")!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const touched = new Set<FieldName>();
  const lang = formLang(values(form));
  const say = STATUS[lang];

  function showErrors(errors: FieldErrors, only?: Set<FieldName>) {
    for (const name of FIELD_NAMES) {
      if (only && !only.has(name)) continue;
      const input = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      const slot = form.querySelector<HTMLElement>(`#enq-${name}-error`);
      const message = errors[name] ?? "";
      if (slot) slot.textContent = message;
      if (input) {
        if (message) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
    }
  }

  function focusFirstError(errors: FieldErrors) {
    const first = FIELD_NAMES.find((name) => errors[name]);
    if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
  }

  // Feedback once a field has been left, then on every change
  form.addEventListener("focusout", (event) => {
    const name = (event.target as HTMLInputElement).name as FieldName;
    if (!FIELD_NAMES.includes(name)) return;
    // An untouched empty field is not an error yet
    if (!touched.has(name) && !(event.target as HTMLInputElement).value) return;
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
    if (button.disabled) return;
    const result = validateEnquiry(values(form), lang);
    FIELD_NAMES.forEach((name) => touched.add(name));
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
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      const answer = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; errors?: FieldErrors };
      if (!res.ok || !answer.ok) {
        showErrors(answer.errors ?? {});
        status.textContent = answer.message ?? say.failed;
        focusFirstError(answer.errors ?? {});
        turnstile?.reset();
        return;
      }

      turnstile?.reset();
      body.hidden = true;
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

  return {
    opened: () => turnstile?.start(),
    clear: () => {
      touched.clear();
      showErrors({});
      status.textContent = "";
    },
  };
}
