import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { cs: `${SITE_URL}/`, en: `${SITE_URL}/en` };
  return [
    { url: languages.cs, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: languages.en, changeFrequency: "monthly", priority: 0.8, alternates: { languages } },
  ];
}
