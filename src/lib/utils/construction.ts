import type { ConstructionUpdate } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";

/** Дата записи на языке страницы; RU/TH-варианты необязательны → падаем в EN. */
export function updateDate(u: ConstructionUpdate, locale: Locale): string {
  const local = locale === "ru" ? u.dateRu : locale === "th" ? u.dateTh : u.date;
  return local?.trim() || u.date;
}

/** Подпись к записи на языке страницы; RU/TH-варианты необязательны → падаем в EN. */
export function updateNote(u: ConstructionUpdate, locale: Locale): string | undefined {
  const local = locale === "ru" ? u.noteRu : locale === "th" ? u.noteTh : u.note;
  return (local?.trim() || u.note?.trim()) || undefined;
}

/** Сколько всего фото во всех записях — для подписей «N фото». */
export function countPhotos(updates: ConstructionUpdate[]): number {
  return updates.reduce((n, u) => n + u.photos.length, 0);
}
