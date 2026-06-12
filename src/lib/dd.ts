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
