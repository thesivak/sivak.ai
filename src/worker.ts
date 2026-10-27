import { handle } from "@astrojs/cloudflare/handler";
import { routeLanguage } from "@/lib/lang-routing";

// The Worker entry: the language redirects first, then Astro, which serves the prerendered
// pages from the asset store and renders the on-demand routes (/api/*, /admin/*).
// Requests for other static files never reach this code (see assets.run_worker_first in wrangler.jsonc).
export default {
  async fetch(request, env, ctx) {
    const redirect = routeLanguage(request);
    if (redirect) return redirect;

    const response = await handle(request, env, ctx);
    if (new URL(request.url).pathname !== "/") return response;
    // "/" depends on the browser language and the cookie, so caches must keep the variants apart
    const varied = new Response(response.body, response);
    varied.headers.append("Vary", "Accept-Language, Cookie");
    return varied;
  },
} satisfies ExportedHandler<Env>;
