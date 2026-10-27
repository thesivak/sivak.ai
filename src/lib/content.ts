import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n/config";
import { czechSpacing, czechSpacingHtml } from "@/lib/czech";

export type Home = CollectionEntry<"home">["data"];
export type Landing = CollectionEntry<"landing">["data"];
export type FaqEntry = CollectionEntry<"faq">;
export type Topics = CollectionEntry<"topic">["data"];
export type Topic = Topics["pages"][number];

// Czech copy gets its no-break spaces here, in the data and in the rendered Markdown
export async function getHome(lang: Locale): Promise<Home> {
  const entry = await getEntry("home", lang);
  if (!entry) throw new Error(`Missing src/content/home/${lang}.yaml`);
  return lang === "cs" ? czechSpacing(entry.data) : entry.data;
}

export async function getLanding(id: string): Promise<Landing> {
  const entry = await getEntry("landing", id);
  if (!entry) throw new Error(`Missing src/content/landing/${id}.yaml`);
  return czechSpacing(entry.data);
}

/** The service pages of one language (src/content/topic/{cs,en}.yaml). */
export async function getTopics(lang: Locale): Promise<Topics> {
  const entry = await getEntry("topic", lang);
  if (!entry) throw new Error(`Missing src/content/topic/${lang}.yaml`);
  return lang === "cs" ? czechSpacing(entry.data) : entry.data;
}

export type FaqItem = { question: string; answerHtml: string };

/** FAQ of one folder in src/content/faq ("cs", "en", "ai-skoleni"), in `order`, answers rendered to HTML. */
export async function getFaq(folder: string): Promise<FaqItem[]> {
  const entries = await getCollection("faq", (entry) => entry.id.startsWith(`${folder}/`));
  const czech = folder !== "en";
  return entries
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry: FaqEntry) => {
      const html = entry.rendered?.html ?? "";
      return {
        question: czech ? czechSpacing(entry.data.question) : entry.data.question,
        answerHtml: czech ? czechSpacingHtml(html) : html,
      };
    });
}
