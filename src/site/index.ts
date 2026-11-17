import type { Locale } from "@/i18n/config";
import { czechSpacing } from "@/lib/czech";
import { cs } from "./cs";
import { en } from "./en";
import { pages } from "./pages";
import type { Page, Service, ServiceKey, Site } from "./types";

export type { Block, Cta, IndexItem, Link, Page, Question, Section, Service, ServiceKey, Sheet, Site, Step } from "./types";

// Czech copy gets its no-break spaces here
const SITES: Record<Locale, Site> = { cs: czechSpacing(cs), en };

export function getSite(lang: Locale): Site {
  return SITES[lang];
}

export function getService(lang: Locale, key: ServiceKey): Service {
  const service = SITES[lang].services.find((item) => item.key === key);
  if (!service) throw new Error(`Missing service "${key}" in src/site/${lang}.ts`);
  return service;
}

// The Czech-only pages (src/site/pages.ts), spaced like the rest of the Czech copy
const PAGES = czechSpacing(pages);
export type PageKey = keyof typeof pages;

export function getPage(key: PageKey): Page {
  return PAGES[key];
}
