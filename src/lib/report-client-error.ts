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
  const payload = unwrapEvent(err);
  if (payload === null) return;
  const e =
    payload instanceof Error
      ? payload
      : new Error(typeof payload === "string" ? payload : safeString(payload));
  const message = (e.message || "").trim().slice(0, 500);
  // «Script error.» — кросс-доменный скрипт без деталей, разбирать нечего.
  if (!message || message === "Script error.") return;
  const stack = (e.stack || "").slice(0, 2000);
  // Расширения браузера (MetaMask и прочие кошельки) роняют свои ошибки в наше
  // окно — код сайта к ним отношения не имеет, а алерт выглядит как поломка.
  if (/-extension:\/\//.test(stack)) return;
  sent += 1;
  const body = JSON.stringify({
    message,
    stack,
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

/**
 * В unhandledrejection регулярно прилетает не Error, а Event — сорванная
 * загрузка ресурса, media, beacon. JSON.stringify такого объекта даёт
 * бесполезное {"isTrusted":true}: ни сообщения, ни стека, в алерте виден лишь
 * сам маячок. ErrorEvent хотя бы несёт message — его пропускаем строкой,
 * остальное гасим. null = «слать нечего».
 */
function unwrapEvent(err: unknown): unknown {
  if (typeof Event === "undefined" || !(err instanceof Event)) return err;
  return err instanceof ErrorEvent && err.message ? err.message : null;
}

function safeString(v: unknown): string {
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
}
