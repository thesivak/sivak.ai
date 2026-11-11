import type { Locale } from "@/i18n/config";
import { czechSpacing } from "@/lib/czech";
import { cs } from "./cs";
import { en } from "./en";
import type { Service, ServiceKey, Site } from "./types";

export type { Block, Question, Service, ServiceKey, Sheet, Site, Step } from "./types";

// Czech copy gets its no-break spaces here, as in src/lib/content.ts
const SITES: Record<Locale, Site> = { cs: czechSpacing(cs), en };

export function getSite(lang: Locale): Site {
  return SITES[lang];
}

export function getService(lang: Locale, key: ServiceKey): Service {
  const service = SITES[lang].services.find((item) => item.key === key);
  if (!service) throw new Error(`Missing service "${key}" in src/site/${lang}.ts`);
  return service;
}
