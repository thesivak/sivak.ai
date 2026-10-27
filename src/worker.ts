import { handle } from "@astrojs/cloudflare/handler";
import { routeLanguage } from "@/lib/lang-routing";
import { pruneAdminFailures } from "@/lib/server/admin";
import { errorCode } from "@/lib/server/log";
import { pruneAttempts } from "@/lib/server/rate-limit";
import { pruneEnquiries } from "@/lib/server/store";

// The Worker entry: the language redirects first, then Astro, which serves the prerendered
// pages from the asset store and renders the on-demand routes (/api/*, /admin/*).
// In production other static files never reach this code (assets.run_worker_first in wrangler.jsonc);
// the preview environment sends everything through here so it can keep search engines out.
//
// Search engines are kept out of every *.workers.dev host (production "sivak-ai" before the cutover,
// and the preview), keyed on the hostname, so sivak.ai / www.sivak.ai are unaffected later:
//  - responses from this code get X-Robots-Tag (and HTML a robots meta tag), robots.txt is "Disallow: /";
//  - static files served without the Worker get X-Robots-Tag from public/_headers, whose rule only
//    matches https://<worker>.<account>.workers.dev/*.
function isWorkersDev(hostname: string): boolean {
  return hostname === "workers.dev" || hostname.endsWith(".workers.dev");
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const preview = (env.SITE_ENV ?? "").trim().toLowerCase() === "preview";
    const hidden = preview || isWorkersDev(url.hostname);
    const pathname = url.pathname;
    if (hidden && pathname === "/robots.txt") {
      return new Response("User-Agent: *\nDisallow: /\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" },
      });
    }

    let response = routeLanguage(request) ?? (await handle(request, env, ctx));
    if (pathname === "/" || hidden) response = new Response(response.body, response);
    // "/" depends on the browser language and the cookie, so caches must keep the variants apart
    if (pathname === "/") response.headers.append("Vary", "Accept-Language, Cookie");
    return hidden ? noindex(response) : response;
  },

  // Hourly cron (wrangler.jsonc → triggers): deletes what the privacy policy says we no longer keep,
  // rate-limit attempts and failed admin logins older than a day, and enquiries older than 24 months
  async scheduled(_controller, env) {
    if (!env.DB) return;
    try {
      const attempts = await pruneAttempts(env.DB);
      const enquiries = await pruneEnquiries(env.DB);
      const adminFailures = await pruneAdminFailures(env.DB);
      console.log("[retention] pruned", { attempts, enquiries, adminFailures });
    } catch (error) {
      console.error("[retention] pruning failed", { error: errorCode(error) });
    }
  },
} satisfies ExportedHandler<Env>;

// workers.dev (production before the cutover, and the preview): never indexed, whatever the page says
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
