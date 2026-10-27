// The cookie banner (CookieConsent.astro). The defaults and a stored choice are already applied by the
// inline snippet in <head> (src/lib/consent.ts); this script shows the banner when there is no current
// choice, saves the visitor's decision and lets the footer link ("Nastavení cookies") reopen it.
// Without JavaScript nothing here runs: no banner, and no Google tags either.
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION, TRACKING_STORAGE_KEY, consentParams, readConsent, type ConsentChoice } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_COOKIE = /^_ga($|_)/;
const ADS_COOKIE = /^_gcl_/;

/** Deletes matching cookies host-only and on every parent domain (e.g. www.sivak.ai, .sivak.ai). */
function deleteCookies(pattern: RegExp) {
  const names = document.cookie
    .split(";")
    .map((pair) => pair.split("=")[0].trim())
    .filter((name) => pattern.test(name));
  if (names.length === 0) return;
  const labels = location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i++) {
    const domain = labels.slice(i).join(".");
    domains.push(`; domain=${domain}`, `; domain=.${domain}`);
  }
  for (const name of names) {
    for (const domain of domains) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${domain}`;
  }
}

function apply(choice: Pick<ConsentChoice, "analytics" | "marketing">) {
  window.gtag?.("consent", "update", consentParams(choice));
  // Withdrawn or never given: the Google cookies go too
  if (!choice.analytics) deleteCookies(GA_COOKIE);
  if (!choice.marketing) {
    deleteCookies(ADS_COOKIE);
    try {
      sessionStorage.removeItem(TRACKING_STORAGE_KEY);
    } catch {
      // storage blocked: nothing stored either
    }
  }
}

function store(choice: Pick<ConsentChoice, "analytics" | "marketing">) {
  const value: ConsentChoice = { v: COOKIE_CONSENT_VERSION, at: Date.now(), analytics: choice.analytics, marketing: choice.marketing };
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  } catch {
    // storage blocked: the choice holds for this page only, and the banner comes back next time
  }
}

export function setupCookieConsent(banner: HTMLElement) {
  const settings = banner.querySelector<HTMLElement>("[data-cc-settings]")!;
  const settingsButton = banner.querySelector<HTMLButtonElement>('[data-cc="settings"]')!;
  const saveButton = banner.querySelector<HTMLButtonElement>('[data-cc="save"]')!;
  const analytics = banner.querySelector<HTMLInputElement>('[data-cc-toggle="analytics"]')!;
  const marketing = banner.querySelector<HTMLInputElement>('[data-cc-toggle="marketing"]')!;
  let opener: HTMLElement | null = null;

  function showSettings(open: boolean) {
    settings.hidden = !open;
    saveButton.hidden = !open;
    settingsButton.setAttribute("aria-expanded", String(open));
  }

  function open(from: HTMLElement | null) {
    const current = readConsent();
    // Toggles show the stored choice, and nothing is pre-ticked without one
    analytics.checked = current?.analytics ?? false;
    marketing.checked = current?.marketing ?? false;
    showSettings(false);
    banner.hidden = false;
    opener = from;
    // Opened on purpose (footer link): focus moves into the banner. Shown on arrival: focus stays put.
    if (from) banner.focus();
  }

  function close() {
    banner.hidden = true;
    showSettings(false);
    opener?.focus();
    opener = null;
  }

  function decide(choice: Pick<ConsentChoice, "analytics" | "marketing">) {
    store(choice);
    apply(choice);
    close();
  }

  banner.addEventListener("click", (event) => {
    const action = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-cc]")?.dataset.cc;
    if (action === "accept") decide({ analytics: true, marketing: true });
    else if (action === "reject") decide({ analytics: false, marketing: false });
    else if (action === "save") decide({ analytics: analytics.checked, marketing: marketing.checked });
    else if (action === "settings") {
      const expand = settingsButton.getAttribute("aria-expanded") !== "true";
      showSettings(expand);
      if (expand) analytics.focus();
    }
  });

  // Escape closes the settings; it never counts as a choice. With a choice already made (reopened from
  // the footer) it closes the banner and leaves that choice as it was.
  banner.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (settingsButton.getAttribute("aria-expanded") === "true") {
      showSettings(false);
      settingsButton.focus();
    } else if (readConsent()) {
      close();
    }
  });

  // Links and their wrappers are hidden in the HTML: without this script they would do nothing
  for (const wrap of document.querySelectorAll<HTMLElement>("[data-cookie-settings-wrap]")) wrap.hidden = false;
  for (const link of document.querySelectorAll<HTMLButtonElement>("[data-cookie-settings]")) {
    link.hidden = false;
    link.addEventListener("click", () => open(link));
  }

  if (!readConsent()) {
    // No current choice (never asked, expired or a new version): nothing of Google's may stay behind
    deleteCookies(GA_COOKIE);
    deleteCookies(ADS_COOKIE);
    open(null);
  }
}
