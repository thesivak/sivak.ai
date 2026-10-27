import type { APIRoute } from "astro";
import { handleEnquiry } from "@/lib/server/enquiry";
import { serverEnv } from "@/lib/server/env";

export const prerender = false;

export const POST: APIRoute = ({ request, locals }) =>
  handleEnquiry(request, { env: serverEnv(), waitUntil: (promise) => locals.cfContext.waitUntil(promise) });
