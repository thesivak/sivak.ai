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

/** Sections of the content pages that exist in both languages (src/site/pages.ts ↔ pages-en.ts: how we
    work), by their id in each. Their other sections (what we do not do, questions, contact) carry ids the
    home page has too, so SECTION_IDS already pairs them (tests/section-anchors.test.mjs). */
export const PAGE_SECTION_IDS: readonly Record<Locale, string>[] = [
  { cs: "faze", en: "phases" },
  { cs: "zasady", en: "principles" },
  { cs: "bezpecnostni-proverka", en: "security-review" },
];

/** Ids that are the same in both languages: the page's main content and the fixed sections of a service
    page (src/components/site/ServicePage.astro). */
export const SHARED_SECTION_IDS: readonly string[] = ["main", "steps", "questions"];

/** The fragment to carry to the page's version in `lang`: the section's id in that language, an id both
    languages share as it is, and nothing for anything else (a section only the other language has, an
    unknown or malformed fragment): better the top of the page than an anchor that does not exist there. */
export function sectionHashIn(hash: string, lang: Locale): string {
  let id: string;
  try {
    id = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return "";
  }
  const pair = [...SECTION_IDS, ...PAGE_SECTION_IDS].find((pair) => pair.cs === id || pair.en === id);
  if (pair) return `#${pair[lang]}`;
  return SHARED_SECTION_IDS.includes(id) ? `#${id}` : "";
}
