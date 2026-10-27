import type { APIRoute } from "astro";
import { SITE_URL } from "@/lib/site";

// Same rules as the Next.js site; the enquiry API is kept out of crawlers' way
export const GET: APIRoute = () =>
  new Response(`User-Agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
