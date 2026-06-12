/**
 * Due-diligence statuses — двухуровневая система (чек-лист DD v0.2, 2026-06-12).
 * Mirrors bot/dictionaries.py DD_STATUSES and the amoCRM DD_STATUS enum:
 * Pending → в очереди L1 · Vetted → L1 пройден (бейдж на сайте) ·
 * Full DD → L2-отчёт по сделке · Red flag → стоп-фактор, бейджа нет.
 */
export const DD_STATUSES = ["Pending", "Vetted", "Full DD", "Red flag"] as const;
export type DdStatus = (typeof DD_STATUSES)[number];

export function isVetted(ddStatus?: string): boolean {
  return ddStatus === "Vetted" || ddStatus === "Full DD";
}

/**
 * Пункты Phase 1.5 Listing Vetting (чек-лист DD v0.2 — docs/sop). Ключи V1–V7
 * хранятся в objects.dd_checklist (jsonb, непубличное). Лейблы — RU (админка).
 */
export const DD_CHECKLIST = [
  { key: "V1", label: "Копия титула получена; имя собственника = документу (или PoA)" },
  { key: "V2", label: "Зона по landsmaps.dol.go.th (стандартные цвета)" },
  { key: "V3", label: "Phangan Zone 2/3 (регуляция мая 2025) — попадание и следствия" },
  { key: "V4", label: "Доступ: дорога public/private, easement, физический заезд" },
  { key: "V5", label: "Координаты и площадь соответствуют документу (sanity)" },
  { key: "V6", label: "Опрос собственника об обременениях — письменно" },
  { key: "V7", label: "Вердикт юриста по флагам V1–V6" },
] as const;
export type DdChecklistKey = (typeof DD_CHECKLIST)[number]["key"];
