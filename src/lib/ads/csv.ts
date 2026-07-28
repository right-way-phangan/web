/**
 * Выгрузка креативов в CSV.
 *
 * Смысл шага: пока у нас нет Marketing API (упирается в Business verification,
 * а та — в юрлицо), кампании собираются руками в Ads Manager. Файл ниже кладётся
 * в его bulk-импорт, поэтому колонки названы так, как их ждёт импорт Meta, а не
 * так, как удобно нам.
 */
import type { CreativeSet } from "./creatives";

const HEADERS = [
  "RW",
  "Channel",
  "Language",
  "Headline",
  "Primary Text",
  "Description",
  "Website URL",
] as const;

/** Экранирование по RFC 4180: кавычки удваиваются, поле берётся в кавычки. */
function cell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function creativesToCsv(sets: CreativeSet[]): string {
  const rows = [HEADERS.join(",")];
  for (const set of sets) {
    for (const v of set.variants) {
      rows.push(
        [set.rwNumber, set.channel, v.lang, v.headline, v.primary, v.description, set.landingUrl]
          .map(cell)
          .join(","),
      );
    }
  }
  // BOM — иначе Excel на macOS открывает кириллицу кракозябрами.
  return `﻿${rows.join("\r\n")}\r\n`;
}
