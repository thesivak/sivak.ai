import type { Locale } from "./config";

/** Homepage section IDs only; navigation items with page hrefs are not sections. */
export const SECTION_IDS: readonly Record<Locale, string>[] = [
  { cs: "pravidlo-80-20", en: "80-20-rule" },
  { cs: "sluzby", en: "services" },
  { cs: "priklady", en: "examples" },
  { cs: "postup", en: "process" },
  { cs: "nasazeni", en: "deployment" },
  { cs: "bezpecnost", en: "security" },
  { cs: "z-praxe", en: "case-study" },
  { cs: "otazky", en: "faq" },
  { cs: "kontakt", en: "contact" },
];

/** Accept either language; preserve unknown fragments and tolerate malformed escapes. */
export function sectionHashIn(hash: string, lang: Locale): string {
  let id: string;
  try {
    id = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return hash;
  }
  const pair = SECTION_IDS.find((pair) => pair.cs === id || pair.en === id);
  return pair ? `#${pair[lang]}` : hash;
}
