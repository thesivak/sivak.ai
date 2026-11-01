import type { APIRoute } from "astro";
import { CZECH_ONLY_PAGES, TWIN_PAGES } from "@/i18n/pages";
import { SITE_URL } from "@/lib/site";
import LASTMOD from "@/data/lastmod.json";

// Prerendered at build time. <lastmod> is when the page's own sources last changed in git, from
// src/data/lastmod.json (`npm run lastmod`, see README): the build itself may run on a shallow clone.
// A page missing from that file gets no <lastmod> (and a build warning), never the build date.
type Entry = { path: string; priority: number; alternates?: Record<string, string> };

const absolute = (path: string) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);
const lastmod: Record<string, string | undefined> = LASTMOD;

// Priority of each pair's Czech and English page: the homepage, the training page (the Czech one is the
// Google Ads landing page), then the service pages
const PRIORITY: Record<string, [number, number]> = { "/": [1, 0.8], "/ai-skoleni": [0.9, 0.7] };

// Every page that exists in both languages, each language with its alternates (cs, en, x-default = cs)
const twins: Entry[] = TWIN_PAGES.flatMap((pair) => {
  const alternates = { cs: absolute(pair.cs), en: absolute(pair.en), "x-default": absolute(pair.cs) };
  const [cs, en] = PRIORITY[pair.cs] ?? [0.8, 0.6];
  return [
    { path: pair.cs, priority: cs, alternates },
    { path: pair.en, priority: en, alternates },
  ];
});
const ENTRIES: Entry[] = [
  ...twins,
  // Czech only, so no alternates
  ...CZECH_ONLY_PAGES.map((path) => ({ path, priority: 0.9 })),
];

export const GET: APIRoute = () => {
  const urls = ENTRIES.map(({ path, priority, alternates = {} }) => {
    const date = lastmod[path];
    if (!date) console.warn(`sitemap: no lastmod for ${path} in src/data/lastmod.json (run npm run lastmod)`);
    return [
      "<url>",
      `<loc>${absolute(path)}</loc>`,
      ...Object.entries(alternates).map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`),
      ...(date ? [`<lastmod>${date}</lastmod>`] : []),
      "<changefreq>monthly</changefreq>",
      `<priority>${priority}</priority>`,
      "</url>",
    ].join("\n");
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
