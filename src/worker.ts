import { handle } from "@astrojs/cloudflare/handler";
import { routeLanguage } from "@/lib/lang-routing";

// The Worker entry: the language redirects first, then Astro, which serves the prerendered
// pages from the asset store and renders the on-demand routes (/api/*, /admin/*).
// In production other static files never reach this code (assets.run_worker_first in wrangler.jsonc);
// the preview environment sends everything through here so it can keep search engines out.
export default {
  async fetch(request, env, ctx) {
    const preview = (env.SITE_ENV ?? "").trim().toLowerCase() === "preview";
    const pathname = new URL(request.url).pathname;
    if (preview && pathname === "/robots.txt") {
      return new Response("User-Agent: *\nDisallow: /\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" },
      });
    }

    let response = routeLanguage(request) ?? (await handle(request, env, ctx));
    if (pathname === "/" || preview) response = new Response(response.body, response);
    // "/" depends on the browser language and the cookie, so caches must keep the variants apart
    if (pathname === "/") response.headers.append("Vary", "Accept-Language, Cookie");
    return preview ? noindex(response) : response;
  },
} satisfies ExportedHandler<Env>;

// Preview (ai-skoleni-nahled on workers.dev): never indexed, whatever the page says
function noindex(response: Response): Response {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  let replaced = false;
  return new HTMLRewriter()
    .on('meta[name="robots"]', {
      element(meta) {
        meta.setAttribute("content", "noindex,nofollow");
        replaced = true;
      },
    })
    .on("head", {
      element(head) {
        head.onEndTag((end) => {
          if (!replaced) end.before('<meta name="robots" content="noindex,nofollow">', { html: true });
        });
      },
    })
    .transform(response);
}
