import "server-only";
import { backendFetch, BACKEND_URL } from "@/lib/api/backend";
import { notifySiteError } from "./telegram";

/**
 * Единая точка для ошибок сайта: сервер (instrumentation.onRequestError) и
 * браузер (/api/track-error). Считает отпечаток, гасит повторы и шлёт алерт
 * в Telegram — без таблицы в БД (миграции ждут Vladimir, а алерт нужен уже).
 *
 * Дедупликация в два слоя: память процесса (10 мин — от потопа, если лёг
 * backend и /ratelimit недоступен) + Postgres-лимит backend'а (6 ч на
 * отпечаток, общий для всех инстансов Vercel).
 */
export type SiteError = {
  source: "client" | "server";
  message: string;
  stack?: string;
  url?: string;
  digest?: string;
  ua?: string;
};

const DEDUPE_SEC = 6 * 3600;
const LOCAL_DEDUPE_MS = 10 * 60_000;
const seen = new Map<string, number>();

/** Шум браузеров и сетей — не ошибки нашего кода. */
const NOISE = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /^Load failed$/i, // Safari: прерванный fetch при уходе со страницы
  /NetworkError when attempting to fetch/i,
  /Failed to fetch$/i,
  /AbortError/i,
  /The operation was aborted/i,
];

export function isNoise(message: string): boolean {
  return NOISE.some((re) => re.test(message.trim()));
}

/** Путь без query и без номеров: /object/RW-V0012?x → /object/RW-* */
export function normalizePath(url?: string): string {
  try {
    const path = new URL(url ?? "/", "https://rightwaygroup.co").pathname;
    return path.replace(/RW-[A-Z]?\d+/g, "RW-*").replace(/\d+/g, "*") || "/";
  } catch {
    return "/";
  }
}

/**
 * FNV-1a 32 бит: instrumentation.ts собирается и под edge, где node:crypto
 * недоступен (прод-сборка #324 упала именно на нём). Для дедупа алертов
 * криптостойкость не нужна, коллизии на наших объёмах — нереальны.
 */
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Отпечаток: источник + сообщение без чисел + нормализованный путь. */
export function errorFingerprint(e: Pick<SiteError, "source" | "message" | "url">): string {
  const msg = e.message.replace(/\d+/g, "#").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 160);
  return fnv1a(`${e.source}|${msg}|${normalizePath(e.url)}`);
}

export async function reportSiteError(e: SiteError): Promise<void> {
  if (!e.message || isNoise(e.message)) return;
  const fp = errorFingerprint(e);
  const now = Date.now();
  const last = seen.get(fp);
  if (last && now - last < LOCAL_DEDUPE_MS) return;
  seen.set(fp, now);
  if (!(await firstInWindow(fp))) return;
  await notifySiteError({ ...e, fingerprint: fp, path: normalizePath(e.url) });
}

async function firstInWindow(fp: string): Promise<boolean> {
  if (!BACKEND_URL) return true;
  try {
    const res = await backendFetch("/ratelimit", {
      scope: "track",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ key: `siterr:${fp}`, limit: 1, windowSec: DEDUPE_SEC }),
    });
    if (!res.ok) return true;
    const { allowed } = (await res.json()) as { allowed?: boolean };
    return allowed !== false;
  } catch {
    return true;
  }
}
