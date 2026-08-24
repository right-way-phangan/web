/**
 * `dateAdded` объекта приходит строкой Unix-секунд ("1755018000") — наследство
 * amoCRM, сохранённое при переезде на свою БД; отдельные строки несут ISO-дату
 * или мусор. `new Date("1755018000")` и `Date.parse` такую строку не читают:
 * фид отдавал «Invalid Date» на всех позициях, а бейдж «New» не загорался
 * никогда (NaN → не свежий).
 *
 * Возвращает валидную дату или fallback — Invalid Date наружу не уходит.
 */
export function parseListingDate(raw: string | undefined, fallback: Date): Date {
  if (!raw) return fallback;
  const secs = Number(raw);
  // Строка-число — это Unix-секунды, и осмысленны только положительные.
  // Без этой ветки "-5" и "0" уезжали в new Date("-5") и давали 2000 год
  // вместо fallback (поймано тестом при выносе функции из sitemap).
  if (Number.isFinite(secs)) return secs > 0 ? new Date(secs * 1000) : fallback;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? fallback : d;
}
