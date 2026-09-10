import type { InstrumentationOnRequestError } from "next/dist/server/instrumentation/types";

/**
 * Серверные ошибки Next (render / route / action) → Telegram через
 * notify/site-error.ts. Раньше их было видно только в логах Vercel, куда
 * никто не смотрит, пока не позвонит клиент. Только node-рантайм: в edge
 * нет node:crypto, а edge-маршрутов с логикой у нас нет.
 */
export const onRequestError: InstrumentationOnRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { reportSiteError } = await import("@/lib/notify/site-error");
  const e = (err ?? {}) as { message?: unknown; stack?: unknown; digest?: unknown };
  const ua = request.headers["user-agent"];
  await reportSiteError({
    source: "server",
    message: `${context.routeType} ${request.method} ${context.routePath}: ${String(e.message ?? err)}`.slice(0, 500),
    stack: typeof e.stack === "string" ? e.stack.slice(0, 2000) : undefined,
    url: request.path,
    digest: typeof e.digest === "string" ? e.digest : undefined,
    ua: typeof ua === "string" ? ua : undefined,
  });
};
