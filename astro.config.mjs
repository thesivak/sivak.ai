// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { satteri } from "@astrojs/markdown-satteri";

// Content pages are prerendered to static HTML and served from Cloudflare's asset store.
// Only the enquiry API and the admin pages run on the Worker (`export const prerender = false`).
// The language redirect on "/" lives in src/worker.ts, in front of the static assets.
export default defineConfig({
  site: "https://www.sivak.ai",
  output: "static",
  // "/en" and "/ai-skoleni", never "/en/": pages are written as en.html, ai-skoleni.html…
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "never" },
  adapter: cloudflare({ imageService: "passthrough" }),
  // No Astro sessions: they would provision a KV namespace the site does not need
  session: false,
  markdown: {
    // Keep the copy exactly as written: no curly-quote rewriting
    processor: satteri({ features: { smartPunctuation: false } }),
  },
  devToolbar: { enabled: false },
  prefetch: false,
});
