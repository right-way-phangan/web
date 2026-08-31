import { describe, expect, it } from "vitest";
import { computeRoi, DEFAULT_INPUTS, type RoiInputs } from "@/lib/calculator/roi";
import { escalatedLeaseTotalThb } from "@/lib/objects/lease-format";

/**
 * Характеризующие тесты red-team по расчётам, которые видит покупатель.
 * Зелёные намеренно: фиксируют текущее (неверное) поведение.
 */

const I = (over: Partial<RoiInputs> = {}): RoiInputs => ({ ...DEFAULT_INPUTS, ...over });

// АТАКА 5 [HIGH, деньги]: лизхолд, где срок владения = сроку лизинга — оба
// значения доступны ползунками на /calculator (holding period 1–40 лет, lease
// term 1–90) | ОЖИДАЛОСЬ: полная потеря капитала НЕ показывается как рост |
// БЫЛО: netProfit + initialInvestment = 0, ветка CAGR молча отдавала 0 → KPI
// «CAGR/год» рисовал «+0.0%» рядом с «Total ROI −114.3%», и убыточнейший
// сценарий выглядел как нулевая доходность
// | ИСПРАВЛЕНО 2026-08-31: величина не определена → NaN, fmtPct печатает «—»
// код: src/lib/calculator/roi.ts:559-565 (и та же ветка в off-plan)
describe("АТАКА 5 — полная потеря капитала больше не выглядит как ноль", () => {
  const r = computeRoi(I({ tenure: "leasehold", leaseTermYears: 30, years: 30 }));

  it("стоимость на выходе обнуляется линейным decay лизхолда", () => {
    expect(r.leaseFactorAtExit).toBe(0);
    expect(r.projectedValue).toBe(0);
  });

  it("ROI показывает −114%, а CAGR не выдаёт ложный ноль", () => {
    expect(r.roiPct).toBeLessThan(-100);
    expect(Number.isNaN(r.cagrPct)).toBe(true);
  });

  it("обвал цены на 100% — тоже не ноль", () => {
    expect(Number.isNaN(computeRoi(I({ annualGrowthPct: -100 })).cagrPct)).toBe(true);
  });

  it("а на живом прибыльном сценарии CAGR по-прежнему считается", () => {
    const ok = computeRoi(I({ annualGrowthPct: 7, years: 10 }));
    expect(Number.isFinite(ok.cagrPct)).toBe(true);
    expect(ok.cagrPct).toBeGreaterThan(0);
  });
});

// АТАКА 6 [MEDIUM]: IRR в сценариях с полной потерей капитала | ОЖИДАЕТСЯ:
// конечное число (для такого потока IRR ≈ −100%) | ФАКТ: Ньютон не сходится,
// биссекция ищет корень только на [−99%; +500%] и после 200 итераций отдаёт
// NaN. В UI фильтр fmtPct превращает его в «—», но то же значение уходит в
// печатный отчёт клиенту и в текст «Поделиться» — метрика просто исчезает.
// код: src/lib/calculator/roi.ts:343-371 (computeIRR), вывод — roi-shared.ts:5
describe("АТАКА 6 — IRR = NaN на убыточных сценариях", () => {
  it("лизхолд до конца срока: IRR не считается", () => {
    expect(Number.isNaN(computeRoi(I({ tenure: "leasehold", leaseTermYears: 30, years: 30 })).irrPct)).toBe(true);
  });
  it("лизхолд с помесячной арендой земли до конца срока — тоже NaN", () => {
    expect(
      Number.isNaN(
        computeRoi(I({ tenure: "leasehold", leaseMonthly: true, leaseTermYears: 30, years: 30 })).irrPct,
      ),
    ).toBe(true);
  });
  // ИСПРАВЛЕНО 2026-08-31: без знакопеременных потоков корня нет — раньше
  // возвращалась стартовая догадка Ньютона 0.1 → «IRR 10%» на пустом сценарии.
  it("нулевая цена больше не рождает IRR из воздуха", () => {
    const r = computeRoi(I({ purchasePriceThb: 0 }));
    expect(r.initialInvestment).toBe(0);
    expect(Number.isNaN(r.irrPct)).toBe(true);
  });
});

// АТАКА 7 [MEDIUM, деньги]: сценарий из ссылки «Copy link» — гидрация из URL
// принимает любое конечное число, ползунковых границ там нет | ОЖИДАЕТСЯ:
// значения вне допустимого диапазона отбрасываются или клампятся | ФАКТ:
// inflationPct = −100 делил на (1 + −1) → realCagrPct = Infinity; расшаренная
// ссылка воспроизводила у клиента «реальную доходность» = ∞
// | ИСПРАВЛЕНО 2026-08-31: при 1 + infl ≤ 0 величина не определена → NaN
// код: src/lib/calculator/roi.ts:578-579
describe("АТАКА 7 — realCagr не уходит в бесконечность", () => {
  it("inflationPct = −100 больше не даёт Infinity", () => {
    const r = computeRoi(I({ inflationPct: -100 }));
    expect(Number.isFinite(r.realCagrPct)).toBe(false);
    expect(r.realCagrPct).not.toBe(Infinity);
  });

  it("обычная инфляция считается как прежде", () => {
    expect(Number.isFinite(computeRoi(I({ inflationPct: 3 })).realCagrPct)).toBe(true);
  });
});

// АТАКА 8 [LOW, доступность]: индексация лизинга с микроскопическим периодом
// (опечатка в админке: 0.001 вместо 1 года) | ОЖИДАЕТСЯ: защита от разгона
// цикла | ФАКТ: while-цикл шагает блоками escEveryYears — период 0.001 при
// сроке 30 лет = 30 000 итераций на КАЖДЫЙ рендер карточки; период 1e-9 — 3e10
// итераций, то есть зависший SSR каталога. Верхней границы нет.
// код: src/lib/objects/lease-format.ts:28-33
describe("АТАКА 8 — цикл индексации не ограничен сверху", () => {
  it("число итераций растёт как years / escEveryYears без всякого потолка", () => {
    const t0 = performance.now();
    const v = escalatedLeaseTotalThb(40_000, 30, 0.0001, 0.001);
    const ms = performance.now() - t0;
    expect(Number.isFinite(v)).toBe(true);
    // 30 000 итераций уже здесь; 1e-9 в поле дал бы 3·10^10 и повесил бы рендер
    expect(ms).toBeGreaterThan(0);
  });
});
