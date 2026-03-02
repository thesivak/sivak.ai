import type { Locale } from "@/i18n/config";
import en from "./en.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./en.json").then((m) => m.default),
  cs: () => import("./cs.json").then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
