/**
 * Клиентский маячок ошибок → /api/track-error → Telegram (см. notify/site-error.ts).
 *
 * Зачем: до этого у сайта не было захвата runtime-ошибок вообще — «пропавший
 * калькулятор» и битую RU-404 пришлось разбирать вслепую. Здесь только
 * отправка: без хранилища, без внешнего сервиса, без PII (сообщение, стек,
 * URL страницы). Не больше трёх маячков за загрузку страницы — цикл ошибок
 * в каком-нибудь эффекте не должен превращаться в поток запросов.
 */
const MAX_PER_PAGE = 3;
let sent = 0;

export type ClientErrorSource = "window" | "promise" | "boundary";

export function reportClientError(err: unknown, source: ClientErrorSource): void {
  if (typeof window === "undefined" || sent >= MAX_PER_PAGE) return;
  const e = err instanceof Error ? err : new Error(typeof err === "string" ? err : safeString(err));
  const message = (e.message || "").trim().slice(0, 500);
  // «Script error.» — кросс-доменный скрипт без деталей, разбирать нечего.
  if (!message || message === "Script error.") return;
  sent += 1;
  const body = JSON.stringify({
    message,
    stack: (e.stack || "").slice(0, 2000),
    url: window.location.href,
    source,
    digest: (e as { digest?: string }).digest,
  });
  try {
    if (!navigator.sendBeacon?.("/api/track-error", body)) {
      void fetch("/api/track-error", { method: "POST", body, keepalive: true });
    }
  } catch {
    // маячок — не повод для второй ошибки
  }
}

function safeString(v: unknown): string {
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
}
