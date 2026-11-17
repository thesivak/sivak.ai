import type { Locale } from "@/i18n/config";

// Cookie consent with Google Consent Mode v2. Everything starts denied; the visitor's choice is kept
// first-party in localStorage as { v, at, analytics } for six months, and asked again when it expires or
// COOKIE_CONSENT_VERSION changes (bump it when the purposes or the banner text change).
//   analytics → analytics_storage (Google Analytics 4)
// There is one optional purpose only. The site uses no Google Ads and no marketing cookies: the ad
// consent types (ad_storage, ad_user_data, ad_personalization) are set to denied and never granted.
// The privacy policy (/ochrana-osobnich-udaju) lists the same storage and cookies; change both together.

export const COOKIE_CONSENT_KEY = "sivak-ai-consent";
// 2026-11-17: the marketing purpose (Google Ads) was removed from the banner, so every visitor is asked again
export const COOKIE_CONSENT_VERSION = "2026-11-17";
export const COOKIE_CONSENT_MAX_AGE_MS = 183 * 24 * 60 * 60 * 1000; // ~6 months
export const COOKIE_CONSENT_MONTHS = 6;
// Campaign parameters the removed enquiry form kept in sessionStorage (under the former marketing consent).
// Nothing writes this key any more; the cookie banner clears what an earlier visit may have left.
export const TRACKING_STORAGE_KEY = "sivak-ai-tracking";

export type ConsentChoice = { v: string; at: number; analytics: boolean };
type ConsentState = "granted" | "denied";

/** The stored choice if it is current (right version, younger than six months), otherwise null. */
export function readConsent(now = Date.now()): ConsentChoice | null {
  try {
    const value = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) ?? "null") as Partial<ConsentChoice> | null;
    if (!value || value.v !== COOKIE_CONSENT_VERSION || typeof value.at !== "number" || now - value.at >= COOKIE_CONSENT_MAX_AGE_MS || value.at > now) {
      return null;
    }
    return { v: value.v, at: value.at, analytics: value.analytics === true };
  } catch {
    // storage blocked or garbage: no choice
    return null;
  }
}

export function consentParams(choice: Pick<ConsentChoice, "analytics">): Record<string, ConsentState> {
  return {
    analytics_storage: choice.analytics ? "granted" : "denied",
    // No advertising on the site: never granted
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

/**
 * Inline script for the top of <head>, before gtag.js and any `gtag('config', …)`: defines gtag,
 * sets every consent type to denied and, if there is a current stored choice, applies it at once.
 */
export function consentHeadSnippet(): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
gtag('set','ads_data_redaction',true);
try{var c=JSON.parse(localStorage.getItem(${JSON.stringify(COOKIE_CONSENT_KEY)})||'null'),n=Date.now();
if(c&&c.v===${JSON.stringify(COOKIE_CONSENT_VERSION)}&&typeof c.at==='number'&&c.at<=n&&n-c.at<${COOKIE_CONSENT_MAX_AGE_MS}){
gtag('consent','update',{analytics_storage:c.analytics===true?'granted':'denied'});}}catch(e){}`;
}

export const CONSENT_TEXT = {
  cs: {
    title: "Cookies na sivak.ai",
    // Two paragraphs, the same wording as before: smaller text blocks than the page's own (never the LCP element)
    text: "Rádi bychom měřili návštěvnost webu (Google Analytics). Analytické cookies použijeme jen s vaším souhlasem. Reklamní ani marketingové cookies nepoužíváme.",
    change: "Volbu můžete kdykoli změnit odkazem Nastavení cookies v patičce.",
    policy: "Zásady zpracování osobních údajů",
    accept: "Přijmout",
    reject: "Odmítnout",
    settings: "Nastavení",
    save: "Uložit volbu",
    categories: "Kategorie cookies",
    necessary: "Nezbytné",
    necessaryText: "Fungování webu a uložení této volby. Vždy zapnuté.",
    analytics: "Analytické",
    analyticsText: "Google Analytics: statistiky návštěvnosti webu.",
    footerLink: "Nastavení cookies",
  },
  en: {
    title: "Cookies on sivak.ai",
    text: "We would like to measure visits to the site (Google Analytics). We only use analytics cookies with your consent. We use no advertising or marketing cookies.",
    change: "You can change your choice at any time via Cookie settings in the footer.",
    policy: "Privacy policy (in Czech)",
    accept: "Accept",
    reject: "Reject",
    settings: "Settings",
    save: "Save choice",
    categories: "Cookie categories",
    necessary: "Necessary",
    necessaryText: "Running the site and storing this choice. Always on.",
    analytics: "Analytics",
    analyticsText: "Google Analytics: visitor statistics for the site.",
    footerLink: "Cookie settings",
  },
} satisfies Record<Locale, Record<string, string>>;
