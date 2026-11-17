import type { Locale } from "./config";

/** Home page sections that exist in both languages (src/site/{cs,en}.ts), by their id in each. */
export const SECTION_IDS: readonly Record<Locale, string>[] = [
  { cs: "pro-koho", en: "who-we-work-for" },
  { cs: "sluzby", en: "services" },
  { cs: "co-nedelame", en: "what-we-dont-do" },
  { cs: "z-praxe", en: "case-study" },
  { cs: "otazky", en: "faq" },
  { cs: "postup", en: "process" },
  { cs: "kontakt", en: "contact" },
];

/** Home page sections one language has and the other does not: the language switch drops their fragment.
    Every home page section is in SECTION_IDS or here (tests/section-anchors.test.mjs). */
export const UNPAIRED_SECTION_IDS: Record<Locale, readonly string[]> = {
  cs: [],
  en: [],
};

/** The fragment to carry to the page's version in `lang`: the section's id in that language, nothing for a
    section only the other language has, and any other fragment (a malformed one too) as it is. */
export function sectionHashIn(hash: string, lang: Locale): string {
  let id: string;
  try {
    id = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return hash;
  }
  const pair = SECTION_IDS.find((pair) => pair.cs === id || pair.en === id);
  if (pair) return `#${pair[lang]}`;
  const elsewhere = (Object.keys(UNPAIRED_SECTION_IDS) as Locale[]).some((other) => other !== lang && UNPAIRED_SECTION_IDS[other].includes(id));
  return elsewhere ? "" : hash;
}
