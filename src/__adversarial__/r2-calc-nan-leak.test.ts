import { describe, expect, it } from "vitest";
import { computeRoi, DEFAULT_INPUTS, type RoiResult } from "@/lib/calculator/roi";
import { fmtPct } from "@/components/calculator/roi-shared";

/**
 * RED-TEAM, РАУНД 2 — атака на фикс 844fea1 («убрать выдуманные цифры»).
 * Фикс перевёл `cagrPct`/`realCagrPct` в NaN, чтобы `fmtPct` печатал «—».
 * Ниже — места, где NaN печатался НЕ через `fmtPct`, и место, где фикс не
 * доехал до соседнего поля с ровно тем же дефектом. Оба закрыты 2026-08-31;
 * тесты стерегут, что «выдуманный ноль» и «−NaN%» не вернутся.
 */

/** Сценарий из комментария фикса: лизхолд, дожитый до конца срока. */
const wipedLeasehold = computeRoi({
  ...DEFAULT_INPUTS,
  tenure: "leasehold",
  leaseTermYears: 30,
  years: 30,
  fxDriftPct: 2, // покупатель включил валютный дрейф — блок FX виден
});

// АТАКА 35 [HIGH, деньги]: фикс 844fea1 объявил целью убрать «+0.0%/год рядом с
// ROI −114%» | ОЖИДАЕТСЯ: ни одна строка результата не печатает «рост +0.0%» на
// сценарии, где вложенное потеряно | БЫЛО: фикс тронул только `cagrPct`, а
// соседний `cagrFxPct` считался в `fxAdjusted` по формуле
// `multiple > 0 && years > 0 ? … : 0` — при отрицательном multiple он возвращал
// ровно 0, и блок «доходность в вашей валюте» печатал «−114.3% · +0%/год»: тот
// самый текст, ради которого фикс делался | ИСПРАВЛЕНО 2026-08-31: в этой ветке
// `cagrFxPct` тоже NaN, обе строки печатают прочерк.
// код: src/lib/calculator/roi.ts:448, рендер
//      src/components/calculator/roi-calculator.tsx:962
describe("АТАКА 35 — cagrFxPct больше не выдаёт ноль там, где cagrPct уже NaN", () => {
  it("cagrPct честно NaN и печатается прочерком", () => {
    expect(Number.isNaN(wipedLeasehold.cagrPct)).toBe(true);
    expect(fmtPct(wipedLeasehold.cagrPct)).toBe("—");
  });

  it("cagrFxPct — тоже NaN, а не выдуманный ноль", () => {
    expect(Number.isNaN(wipedLeasehold.cagrFxPct)).toBe(true);
    expect(fmtPct(wipedLeasehold.cagrFxPct)).toBe("—");
  });

  it("строка «в вашей валюте» рядом с убытком >100% не обещает роста", () => {
    expect(wipedLeasehold.roiFxPct).toBeLessThan(-100);
    // ровно то, что видит посетитель: t.fxReturnLine(roiFx, cagrFx)
    const line = `${fmtPct(wipedLeasehold.roiFxPct)} · ${fmtPct(wipedLeasehold.cagrFxPct)}/yr`;
    expect(line).not.toContain("+0%");
    expect(line).toContain("—/yr");
    expect(line).toMatch(/^-1\d\d/);
  });

  it("контроль: на здоровом сценарии cagrFxPct остаётся числом", () => {
    const healthy = computeRoi({ ...DEFAULT_INPUTS, fxDriftPct: 2 });
    expect(Number.isFinite(healthy.cagrFxPct)).toBe(true);
    expect(fmtPct(healthy.cagrFxPct)).not.toBe("—");
  });
});

// АТАКА 36 [MEDIUM]: KPI «окупаемость» на том же сценарии | ОЖИДАЛОСЬ: сделка,
// вернувшая −114% вложенного, не сообщает года окупаемости | БЫЛО:
// `paybackFrom` искал первый год, где НАКОПЛЕННАЯ прибыль стала неотрицательной,
// а у лизхолда стоимость гасится к концу срока — прибыль пересекает ноль в
// середине и уходит обратно вниз, поэтому KPI печатал «≈7.1 года» рядом с
// «CAGR —» и «ROI −114%»
// | ИСПРАВЛЕНО 2026-09-05: год выдаётся только если к концу срока вложенное
// вернулось (последняя точка серии неотрицательна)
// код: src/lib/calculator/roi.ts:397-410
describe("АТАКА 36 — «окупаемость 7.1 года» на сделке с ROI −114%", () => {
  it("payback не выдаётся вовсе", () => {
    expect(wipedLeasehold.paybackYears).toBeNull();
  });

  it("хотя итоговая прибыль глубоко отрицательна", () => {
    expect(wipedLeasehold.roiPct).toBeLessThan(-100);
    expect(wipedLeasehold.netProfit).toBeLessThan(0);
  });

  it("и строка вердикта больше не обещает выхода в плюс", () => {
    // Все три величины на этом сценарии — прочерк: рост, IRR и окупаемость.
    expect(wipedLeasehold.paybackYears).toBeNull();
    expect(fmtPct(wipedLeasehold.cagrPct)).toBe("—");
    expect(fmtPct(wipedLeasehold.irrPct)).toBe("—");
  });
});

// АТАКА 37 [MEDIUM]: публичный лендинг проекта, блок «доходность для инвестора»
// | ОЖИДАЕТСЯ: неопределённый среднегодовой рост печатается прочерком, как в
// калькуляторе (`fmtPct`) и в PDF-отчёте (`report.ts:82`) | БЫЛО:
// `developer-returns.tsx` объявлял СВОЙ форматтер без проверки isFinite, и NaN
// печатался как «−NaN%» прямо в KPI публичной страницы /projects/[slug];
// достижимо ползунками самой страницы (срок 29–30 лет при сроке лизинга 30) на
// юните дороже ≈฿40M | ИСПРАВЛЕНО 2026-08-31: локальный `pct()` проверяет
// Number.isFinite и печатает «—» — как соседние два форматтера.
// код: src/components/projects/developer-returns.tsx:87-88
describe("АТАКА 37 — KPI публичного лендинга печатает прочерк вместо «−NaN%»", () => {
  /** Ровно форматтер из developer-returns.tsx:87-88 (после фикса — с isFinite). */
  const pct = (v: number) =>
    Number.isFinite(v) ? `${v >= 0 ? "" : "−"}${Math.abs(v).toFixed(1)}%` : "—";

  /** Ровно набор входов из developer-returns.tsx:59-80. */
  const unitRoi = (priceThb: number, years: number): RoiResult =>
    computeRoi({
      ...DEFAULT_INPUTS,
      purchasePriceThb: priceThb,
      years,
      annualGrowthPct: 5,
      mode: "rent",
      tenure: "leasehold",
      leaseTermYears: 30,
      offplan: true,
      constructionMonths: 12,
      downPaymentPct: 30,
      handoverPaymentPct: 0,
      handoverUpliftPct: 0,
      rentAfterHandover: true,
      rentGrowthPct: 0,
      rentTaxPct: 0,
    });

  it("на ползунке «30 лет» и юните ฿45M движок отдаёт NaN", () => {
    const r = unitRoi(45_000_000, 30);
    expect(Number.isNaN(r.cagrPct)).toBe(true);
  });

  it("форматтер страницы печатает его прочерком, а не «−NaN%»", () => {
    const r = unitRoi(45_000_000, 30);
    expect(pct(r.cagrPct)).toBe("—");
    expect(pct(r.cagrPct)).not.toContain("NaN");
  });

  it("три форматтера одного значения дают один и тот же прочерк", () => {
    const r = unitRoi(45_000_000, 30);
    expect(fmtPct(r.cagrPct)).toBe("—");
    // report.ts:82-85 — тот же вид форматтера, с isFinite
    const reportPct = (n: number) =>
      !isFinite(n) ? "—" : `${n >= 0 ? "+" : ""}${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
    expect(reportPct(r.cagrPct)).toBe("—");
    expect(pct(r.cagrPct)).toBe("—");
  });

  it("на 29 годах — то же самое: край ползунка не единственная точка", () => {
    expect(pct(unitRoi(45_000_000, 29).cagrPct)).toBe("—");
  });

  it("контроль: конечные величины по-прежнему печатаются числом со знаком", () => {
    expect(pct(5.5)).toBe("5.5%");
    expect(pct(-3.24)).toBe("−3.2%");
    expect(pct(unitRoi(45_000_000, 5).roiPct)).toMatch(/%$/);
  });
});

// АТАКА 38 [LOW]: «оценка сделки» (DealBadge) | ОЖИДАЕТСЯ: неопределённый рост
// отличается от нулевого — это разные вещи для покупателя | ФАКТ (НЕ ЗАКРЫТО):
// `dealGrade` сравнивает `r.cagrPct >= 8` / `>= 5`, а любое сравнение с NaN
// ложно, поэтому сценарий «рост не определён» набирает ровно столько же очков,
// сколько «рост 0%». Бейдж и вердикт не отличают одно от другого.
// код: src/components/calculator/roi-ui.tsx:96-97
describe("АТАКА 38 — NaN-CAGR и нулевой CAGR дают одинаковую оценку сделки", () => {
  // Копия roi-ui.tsx:92-105 дословно (vitest в этом проекте не собирает .tsx).
  const dealGrade = (r: RoiResult, isRent: boolean): "strong" | "fair" | "weak" => {
    let score = 0;
    if (r.vsBankThb > 0) score += 1;
    if (r.vsAltThb > 0) score += 1;
    if (r.cagrPct >= 8) score += 2;
    else if (r.cagrPct >= 5) score += 1;
    if (isRent) {
      if (r.cashOnCashPct >= 6) score += 2;
      else if (r.cashOnCashPct >= 3) score += 1;
    }
    const max = isRent ? 6 : 4;
    const ratio = score / max;
    return ratio >= 0.66 ? "strong" : ratio >= 0.4 ? "fair" : "weak";
  };

  const withCagr = (cagrPct: number): RoiResult =>
    ({ ...wipedLeasehold, cagrPct } as RoiResult);

  it("NaN и 0 неразличимы для скоринга", () => {
    expect(dealGrade(withCagr(NaN), false)).toBe(dealGrade(withCagr(0), false));
  });

  it("а 9% — уже отличаются: ветка живая, просто NaN проваливается в «ниже 5%»", () => {
    expect(dealGrade(withCagr(NaN), false)).not.toBe(dealGrade(withCagr(9), false));
  });
});
