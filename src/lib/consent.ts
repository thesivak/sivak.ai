import type { Locale } from "@/i18n/config";

// Cookie consent with Google Consent Mode v2. Everything starts denied; the visitor's choice is kept
// first-party in localStorage as { v, at, analytics, marketing } for six months, and asked again when
// it expires or COOKIE_CONSENT_VERSION changes (bump it when the purposes or the banner text change).
//   analytics → analytics_storage (Google Analytics 4)
//   marketing → ad_storage, ad_user_data, ad_personalization (Google Ads, only if PUBLIC_GOOGLE_ADS_ID is set)
// The privacy policy (/ochrana-osobnich-udaju) lists the same storage and cookies; change both together.

export const COOKIE_CONSENT_KEY = "sivak-ai-consent";
export const COOKIE_CONSENT_VERSION = "2026-10-27";
export const COOKIE_CONSENT_MAX_AGE_MS = 183 * 24 * 60 * 60 * 1000; // ~6 months
export const COOKIE_CONSENT_MONTHS = 6;
// The landing form's campaign parameters in sessionStorage: kept only with marketing consent
export const TRACKING_STORAGE_KEY = "sivak-ai-tracking";

export type ConsentChoice = { v: string; at: number; analytics: boolean; marketing: boolean };
type ConsentState = "granted" | "denied";

/** The stored choice if it is current (right version, younger than six months), otherwise null. */
export function readConsent(now = Date.now()): ConsentChoice | null {
  try {
    const value = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) ?? "null") as Partial<ConsentChoice> | null;
    if (!value || value.v !== COOKIE_CONSENT_VERSION || typeof value.at !== "number" || now - value.at >= COOKIE_CONSENT_MAX_AGE_MS || value.at > now) {
      return null;
    }
    return { v: value.v, at: value.at, analytics: value.analytics === true, marketing: value.marketing === true };
  } catch {
    // storage blocked or garbage: no choice
    return null;
  }
}

export function consentParams(choice: Pick<ConsentChoice, "analytics" | "marketing">): Record<string, ConsentState> {
  const ads: ConsentState = choice.marketing ? "granted" : "denied";
  return {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
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
if(c&&c.v===${JSON.stringify(COOKIE_CONSENT_VERSION)}&&typeof c.at==='number'&&c.at<=n&&n-c.at<${COOKIE_CONSENT_MAX_AGE_MS}){var a=c.marketing===true?'granted':'denied';
gtag('consent','update',{analytics_storage:c.analytics===true?'granted':'denied',ad_storage:a,ad_user_data:a,ad_personalization:a});}}catch(e){}`;
}

export const CONSENT_TEXT = {
  cs: {
    title: "Cookies na sivak.ai",
    text: "Rádi bychom měřili návštěvnost webu (Google Analytics) a účinnost našich reklam (Google Ads). Tyto cookies použijeme jen s vaším souhlasem. Volbu můžete kdykoli změnit odkazem Nastavení cookies v patičce.",
    policy: "Zásady zpracování osobních údajů",
    accept: "Přijmout vše",
    reject: "Odmítnout vše",
    settings: "Nastavení",
    save: "Uložit volbu",
    categories: "Kategorie cookies",
    necessary: "Nezbytné",
    necessaryText: "Fungování webu a uložení této volby. Vždy zapnuté.",
    analytics: "Analytické",
    analyticsText: "Google Analytics: statistiky návštěvnosti webu.",
    marketing: "Marketingové",
    marketingText: "Google Ads: měření, zda návštěva z naší reklamy vedla k poptávce.",
    footerLink: "Nastavení cookies",
  },
  en: {
    title: "Cookies on sivak.ai",
    text: "We would like to measure visits to the site (Google Analytics) and the effect of our ads (Google Ads). We only use these cookies with your consent. You can change your choice at any time via Cookie settings in the footer.",
    policy: "Privacy policy (in Czech)",
    accept: "Accept all",
    reject: "Reject all",
    settings: "Settings",
    save: "Save choice",
    categories: "Cookie categories",
    necessary: "Necessary",
    necessaryText: "Running the site and storing this choice. Always on.",
    analytics: "Analytics",
    analyticsText: "Google Analytics: visitor statistics for the site.",
    marketing: "Marketing",
    marketingText: "Google Ads: measuring whether a visit from our ad led to an enquiry.",
    footerLink: "Cookie settings",
  },
} satisfies Record<Locale, Record<string, string>>;
