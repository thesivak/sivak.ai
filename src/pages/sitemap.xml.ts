import type { APIRoute } from "astro";
import { TWIN_PAGES } from "@/i18n/pages";
import { SITE_URL } from "@/lib/site";

// Prerendered at build time; <lastmod> is the day of the build (BUILD_DATE, astro.config.mjs), when the
// content was last published.
type Entry = { loc: string; priority: number; alternates?: Record<string, string> };

const absolute = (path: string) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);
const lastmod: string = import.meta.env.BUILD_DATE;

// Every page that exists in both languages, each language with its alternates (cs, en, x-default = cs)
const twins: Entry[] = TWIN_PAGES.flatMap((pair) => {
  const alternates = { cs: absolute(pair.cs), en: absolute(pair.en), "x-default": absolute(pair.cs) };
  const home = pair.cs === "/";
  return [
    { loc: absolute(pair.cs), priority: home ? 1 : 0.8, alternates },
    { loc: absolute(pair.en), priority: home ? 0.8 : 0.6, alternates },
  ];
});
const ENTRIES: Entry[] = [
  ...twins,
  // Czech only, so no alternates
  { loc: `${SITE_URL}/ai-skoleni`, priority: 0.9 },
];

export const GET: APIRoute = () => {
  const urls = ENTRIES.map(({ loc, priority, alternates = {} }) =>
    [
      "<url>",
      `<loc>${loc}</loc>`,
      ...Object.entries(alternates).map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`),
      `<lastmod>${lastmod}</lastmod>`,
      "<changefreq>monthly</changefreq>",
      `<priority>${priority}</priority>`,
      "</url>",
    ].join("\n"),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
