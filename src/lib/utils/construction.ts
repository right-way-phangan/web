import type { ConstructionUpdate } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";

/** Дата записи на языке страницы; RU-вариант необязателен. */
export function updateDate(u: ConstructionUpdate, locale: Locale): string {
  return (locale === "ru" ? u.dateRu : u.date)?.trim() || u.date;
}

/** Подпись к записи на языке страницы; RU-вариант необязателен → падаем в EN. */
export function updateNote(u: ConstructionUpdate, locale: Locale): string | undefined {
  return ((locale === "ru" ? u.noteRu : u.note) || u.note)?.trim() || undefined;
}

/** Сколько всего фото во всех записях — для подписей «N фото». */
export function countPhotos(updates: ConstructionUpdate[]): number {
  return updates.reduce((n, u) => n + u.photos.length, 0);
}
