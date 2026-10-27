import type { APIRoute } from "astro";
import { SITE_URL } from "@/lib/site";

type Entry = { loc: string; priority: number; alternates?: Record<string, string> };

const home = { cs: `${SITE_URL}/`, en: `${SITE_URL}/en` };
const ENTRIES: Entry[] = [
  { loc: home.cs, priority: 1, alternates: home },
  { loc: home.en, priority: 0.8, alternates: home },
  // Czech only, so no alternates
  { loc: `${SITE_URL}/ai-skoleni`, priority: 0.9 },
];

export const GET: APIRoute = () => {
  const urls = ENTRIES.map(({ loc, priority, alternates = {} }) =>
    [
      "<url>",
      `<loc>${loc}</loc>`,
      ...Object.entries(alternates).map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`),
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
