import { env } from "cloudflare:workers";

export type ServerEnv = Cloudflare.Env;

export function serverEnv(): ServerEnv {
  return env;
}

/** Anything not explicitly marked as development counts as production, so a missing variable fails safe. */
export function isProduction(e: ServerEnv): boolean {
  return (e.SITE_ENV ?? "production") !== "development";
}

export function flag(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes((value ?? "").trim().toLowerCase());
}
