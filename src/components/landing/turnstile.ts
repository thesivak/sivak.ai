// Cloudflare Turnstile, loaded only when the visitor gets to the form: on the first focus or pointer
// press inside it, or when it comes within reach of the viewport. Rendered explicitly into the slot
// (data-turnstile-sitekey), which keeps the widget's height reserved, so nothing moves when it appears.
// The widget adds the hidden cf-turnstile-response field to the form; the server verifies it.
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let script: Promise<TurnstileApi> | null = null;

function loadScript(): Promise<TurnstileApi> {
  script ??= new Promise<TurnstileApi>((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = SRC;
    tag.async = true;
    tag.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile missing")));
    tag.onerror = () => reject(new Error("turnstile failed to load"));
    document.head.appendChild(tag);
  }).catch((error) => {
    // A later attempt (e.g. the next submit) may try again
    script = null;
    throw error;
  });
  return script;
}

export type Turnstile = {
  /** Resolves with a token: the current one, or the next the widget produces. Rejects after `timeoutMs`. */
  token: (timeoutMs: number) => Promise<string>;
  /** After a failed submission: a token is single use, so ask for a fresh one */
  reset: () => void;
};

export function lazyTurnstile(form: HTMLFormElement): Turnstile | null {
  const slot = form.querySelector<HTMLElement>("[data-turnstile-sitekey]");
  if (!slot) return null;
  let widgetId: string | undefined;
  let rendering: Promise<void> | null = null;
  let current = "";
  let waiting: ((token: string) => void)[] = [];

  const render = () => {
    rendering ??= loadScript()
      .then((api) => {
        widgetId = api.render(slot, {
          sitekey: slot.dataset.turnstileSitekey,
          language: "cs",
          theme: "light",
          size: "flexible",
          callback: (token: string) => {
            current = token;
            waiting.splice(0).forEach((resolve) => resolve(token));
          },
          "expired-callback": () => (current = ""),
          "error-callback": () => (current = ""),
        });
      })
      .catch((error) => {
        rendering = null;
        throw error;
      });
    return rendering;
  };

  // Load early enough that the check is usually done before the visitor presses "Odeslat"
  const start = () => void render().catch(() => {});
  form.addEventListener("focusin", start, { once: true });
  form.addEventListener("pointerdown", start, { once: true });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    }, { rootMargin: "600px 0px" });
    observer.observe(form);
  }

  return {
    // One timeout covers loading api.js and producing the token, so a stalled script request also
    // ends the wait (and the submit button comes back) after timeoutMs
    token(timeoutMs) {
      return new Promise<string>((resolve, reject) => {
        let settled = false;
        const done = (token: string) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(token);
        };
        const fail = (error: Error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          waiting = waiting.filter((fn) => fn !== done);
          reject(error);
        };
        const timer = setTimeout(() => fail(new Error("turnstile timeout")), timeoutMs);
        render().then(
          () => (current ? done(current) : waiting.push(done)),
          (error: unknown) => fail(error instanceof Error ? error : new Error("turnstile failed")),
        );
      });
    },
    reset() {
      current = "";
      if (widgetId !== undefined) window.turnstile?.reset(widgetId);
    },
  };
}
