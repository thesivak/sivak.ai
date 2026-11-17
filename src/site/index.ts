import type { Locale } from "@/i18n/config";
import { czechSpacing } from "@/lib/czech";
import { cs } from "./cs";
import { en } from "./en";
import { pages } from "./pages";
import { pagesEn } from "./pages-en";
import type { Page, Service, ServiceKey, Site } from "./types";

export type { Block, Cta, IndexItem, Link, Page, Question, Result, Section, Service, ServiceKey, Sheet, Site, Step } from "./types";

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

// The content pages (src/site/pages.ts), spaced like the rest of the Czech copy; the ones that also exist
// in English are in src/site/pages-en.ts
const PAGES = czechSpacing(pages);
export type PageKey = keyof typeof pages;
export type EnglishPageKey = keyof typeof pagesEn;

export function getPage(key: PageKey, lang: Locale = "cs"): Page {
  if (lang === "cs") return PAGES[key];
  const page = (pagesEn as Partial<Record<PageKey, Page>>)[key];
  if (!page) throw new Error(`Missing page "${key}" in src/site/pages-en.ts`);
  return page;
}
