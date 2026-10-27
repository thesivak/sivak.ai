import { env } from "cloudflare:workers";

export type ServerEnv = Cloudflare.Env;

export function serverEnv(): ServerEnv {
  return env;
}

// SITE_ENV: "production" (wrangler.jsonc), "preview" (env.preview, the noindexed workers.dev copy)
// or "development" (.dev.vars). Anything unknown or missing counts as production, so it fails safe.
export type SiteMode = "production" | "preview" | "development";

export function siteMode(e: Pick<ServerEnv, "SITE_ENV">): SiteMode {
  const value = (e.SITE_ENV ?? "").trim().toLowerCase();
  return value === "development" || value === "preview" ? value : "production";
}

export function isProduction(e: Pick<ServerEnv, "SITE_ENV">): boolean {
  return siteMode(e) === "production";
}

export function flag(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes((value ?? "").trim().toLowerCase());
}
