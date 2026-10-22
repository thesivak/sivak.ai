import type { Locale } from "@/i18n/config";
import en from "./en.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./en.json").then((m) => m.default),
  cs: () => import("./cs.json").then((m) => czechSpacing(m.default)),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

// Czech typesetting keeps one-letter prepositions and conjunctions ("v", "k", "a"…)
// on the same line as the next word, and never starts a line with a dash.
const LONE_LETTER = /(?<=^|[\s(„])([AaIiKkOoSsUuVvZz]) /g;

function czechSpacing<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(LONE_LETTER, "$1 ").replaceAll(" – ", " – ") as T;
  }
  if (Array.isArray(value)) return value.map(czechSpacing) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, czechSpacing(v)])) as T;
  }
  return value;
}
