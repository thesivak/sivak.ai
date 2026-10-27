// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { satteri } from "@astrojs/markdown-satteri";

// Content pages are prerendered to static HTML and served from Cloudflare's asset store.
// Only the enquiry API (POST /api/poptavka) runs on the Worker (`export const prerender = false`).
// The language redirect on "/" lives in src/worker.ts, in front of the static assets.
// The day of the build, for the sitemap's <lastmod>. Taken here, in Node: inside workerd, where pages are
// prerendered, a module-level `new Date()` is the epoch.
const BUILD_DATE = new Date().toISOString().slice(0, 10);

export default defineConfig({
  site: "https://www.sivak.ai",
  output: "static",
  // "/en" and "/ai-skoleni", never "/en/": pages are written as en.html, ai-skoleni.html…
  trailingSlash: "never",
  // CSS inline in every page: no render-blocking stylesheet request (about 10 kB gzipped per page)
  build: { format: "file", inlineStylesheets: "always" },
  adapter: cloudflare({ imageService: "passthrough" }),
  // No Astro sessions: they would provision a KV namespace the site does not need
  session: false,
  markdown: {
    // Keep the copy exactly as written: no curly-quote rewriting
    processor: satteri({ features: { smartPunctuation: false } }),
  },
  vite: { define: { "import.meta.env.BUILD_DATE": JSON.stringify(BUILD_DATE) } },
  devToolbar: { enabled: false },
  prefetch: false,
});
