import type { APIRoute } from "astro";
import { ADMIN_HEADERS, checkAdmin } from "@/lib/server/admin";
import { toCsv } from "@/lib/server/csv";
import { serverEnv } from "@/lib/server/env";
import { COLUMNS, listEnquiries } from "@/lib/server/store";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const env = serverEnv();
  const access = await checkAdmin(request, env);
  if (!access.ok) return access.response;
  if (!env.DB) return new Response("DB není nakonfigurovaná.", { status: 503, headers: { ...ADMIN_HEADERS, "Content-Type": "text/plain; charset=utf-8" } });

  const rows = await listEnquiries(env.DB);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(COLUMNS, rows.map((row) => COLUMNS.map((column) => row[column]))), {
    headers: {
      ...ADMIN_HEADERS,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="poptavky-${date}.csv"`,
    },
  });
};
