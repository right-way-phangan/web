import type { TenureType } from "@/types/object";

/**
 * Normalize raw tenure values to the canonical TenureType union so the
 * ?tenure= filter and `includes("Leasehold")` checks work. The DB / amoCRM
 * store enum labels ("Freehold (Thai)", "Mixed / N.A.", "Leasehold 30 years")
 * that never equal the clean filter values — map by keyword:
 *   contains "freehold"  → "Freehold"
 *   contains "leasehold" → "Leasehold"
 *   contains "mixed"     → "Mixed"
 * «Mixed / N.A.» в CRM означает «форма владения НЕ установлена», а не «freehold
 * или leasehold на выбор». Раскрывать его в обе формы нельзя: сайт начинал
 * печатать «Tenure: Freehold, Leasehold» и объявлять проект фрихолдом там, где
 * право неизвестно. Токен остаётся отдельным, а в выдачу такой объект попадает
 * за счёт matchesTenure() ниже — правило feedback_leasehold_everywhere
 * выполняется фильтром, а не подменой данных.
 * Other labels (Superficies, Usufruct, Thai Company, Condo Foreign Quota…)
 * pass through unchanged so spec tables keep showing them; the filter only
 * matches Freehold/Leasehold, so pass-through values are inert there.
 */
export function normalizeTenure(raw: string[] | undefined): TenureType[] | undefined {
  if (!raw || raw.length === 0) return undefined;
  const out: string[] = [];
  const add = (t: string) => {
    if (!out.includes(t)) out.push(t);
  };
  for (const v of raw) {
    const s = v.toLowerCase();
    let matched = false;
    if (s.includes("freehold")) { add("Freehold"); matched = true; }
    if (s.includes("leasehold")) { add("Leasehold"); matched = true; }
    if (s.includes("mixed")) { add("Mixed"); matched = true; }
    if (!matched) add(v);
  }
  // Pass-through labels outside the union are tolerated by every consumer
  // (display-only joins); the cast keeps the field's canonical type.
  return out as TenureType[];
}
