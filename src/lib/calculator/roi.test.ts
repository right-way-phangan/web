import { describe, it, expect } from "vitest";
import {
  computeRoi,
  solveMaxPrice,
  DEFAULT_INPUTS,
  type RoiInputs,
} from "./roi";

/**
 * Калькулятор доходности отдаёт клиенту цифры, по которым тот решает,
 * покупать ли объект за десятки миллионов бат. Ошибка здесь дороже любой
 * другой в коде, а модуль (850 строк: freehold/leasehold, помесячная аренда
 * земли с индексацией, off-plan, аренда, IRR, FX) до сих пор не был покрыт.
 *
 * Тесты держатся на инвариантах, а не на «золотых» числах: закреплять текущий
 * вывод до знака — значит зацементировать и возможную ошибку. Проверяем то,
 * что обязано быть верным при любой правке формул: тождества сложного
 * процента, направление влияния каждого параметра, согласованность обратных
 * функций с прямыми и совпадение слагаемых с итогом.
 */

/** Чистый лист: одни расходы обнулены, чтобы проверять по одному фактору. */
function bare(over: Partial<RoiInputs> = {}): RoiInputs {
  return {
    ...DEFAULT_INPUTS,
    purchasePriceThb: 10_000_000,
    unitCount: 1,
    years: 10,
    annualGrowthPct: 6,
    closingCostsPct: 0,
    saleCostsPct: 0,
    capitalGainsTaxPct: 0,
    annualHoldingPct: 0,
    bankRatePct: 0,
    altReturnPct: 0,
    inflationPct: 0,
    fxDriftPct: 0,
    mode: "hold",
    tenure: "freehold",
    leaseMonthly: false,
    offplan: false,
    ...over,
  };
}

describe("computeRoi — freehold, режим удержания", () => {
  it("наращивает стоимость сложным процентом", () => {
    const r = computeRoi(bare({ annualGrowthPct: 6, years: 10 }));
    expect(r.projectedValue).toBeCloseTo(10_000_000 * Math.pow(1.06, 10), 2);
  });

  it("без роста и без издержек не приносит ни прибыли, ни убытка", () => {
    const r = computeRoi(bare({ annualGrowthPct: 0 }));
    expect(r.netProfit).toBeCloseTo(0, 6);
    expect(r.roiPct).toBeCloseTo(0, 6);
  });

  it("при нулевом росте уводит в минус ровно на сумму издержек", () => {
    const r = computeRoi(bare({ annualGrowthPct: 0, annualHoldingPct: 1, years: 5 }));
    expect(r.holdingCostsTotal).toBeCloseTo(10_000_000 * 0.01 * 5, 2);
    expect(r.netProfit).toBeCloseTo(-r.holdingCostsTotal, 2);
  });

  it("CAGR согласован с ROI за срок владения", () => {
    const r = computeRoi(bare({ annualGrowthPct: 7, years: 8 }));
    expect(Math.pow(1 + r.cagrPct / 100, 8) - 1).toBeCloseTo(r.roiPct / 100, 6);
  });

  it("итог сходится из слагаемых", () => {
    const r = computeRoi(
      bare({ annualHoldingPct: 1.2, saleCostsPct: 5, capitalGainsTaxPct: 10, years: 7 }),
    );
    expect(r.netProceeds).toBeCloseTo(r.projectedValue - r.saleCosts, 2);
    expect(r.totalReturn).toBeCloseTo(
      r.netProceeds + r.rentNetTotal - r.holdingCostsTotal - r.leasePaymentsTotal - r.capitalGainsTax,
      2,
    );
    expect(r.netProfit).toBeCloseTo(r.totalReturn - r.initialInvestment, 2);
  });

  it("налог на прирост берётся с прироста, а не со всей цены", () => {
    const r = computeRoi(bare({ annualGrowthPct: 5, capitalGainsTaxPct: 20, years: 10 }));
    expect(r.capitalGainsTax).toBeCloseTo((r.projectedValue - 10_000_000) * 0.2, 2);
  });

  it("не начисляет налог на прирост, когда объект подешевел", () => {
    const r = computeRoi(bare({ annualGrowthPct: -3, capitalGainsTaxPct: 20 }));
    expect(r.projectedValue).toBeLessThan(10_000_000);
    expect(r.capitalGainsTax).toBe(0);
  });

  it("растёт по ROI вслед за ростом цены — монотонно", () => {
    const roi = [3, 6, 9].map((g) => computeRoi(bare({ annualGrowthPct: g })).roiPct);
    expect(roi[1]).toBeGreaterThan(roi[0]);
    expect(roi[2]).toBeGreaterThan(roi[1]);
  });

  it("расходы на вход входят в вложенное и снижают ROI", () => {
    const clean = computeRoi(bare({ closingCostsPct: 0 }));
    const withFees = computeRoi(bare({ closingCostsPct: 6 }));
    expect(withFees.initialInvestment).toBeCloseTo(10_600_000, 2);
    expect(withFees.roiPct).toBeLessThan(clean.roiPct);
  });
});

describe("computeRoi — leasehold", () => {
  it("возобновляемый лизинг не теряет стоимость", () => {
    const r = computeRoi(
      bare({ tenure: "leasehold", leaseTermYears: 30, leaseRenewable: true, years: 10 }),
    );
    expect(r.leaseFactorAtExit).toBe(1);
    expect(r.projectedValue).toBeCloseTo(10_000_000 * Math.pow(1.06, 10), 2);
  });

  it("невозобновляемый — обесценивается пропорционально остатку срока", () => {
    const r = computeRoi(
      bare({ tenure: "leasehold", leaseTermYears: 30, leaseRenewable: false, years: 10 }),
    );
    expect(r.leaseFactorAtExit).toBeCloseTo(20 / 30, 6);
    expect(r.projectedValue).toBeCloseTo(10_000_000 * Math.pow(1.06, 10) * (20 / 30), 2);
  });

  it("к концу срока стоимость обнуляется, а не уходит в минус", () => {
    const r = computeRoi(
      bare({ tenure: "leasehold", leaseTermYears: 10, leaseRenewable: false, years: 12 }),
    );
    expect(r.leaseFactorAtExit).toBe(0);
    expect(r.projectedValue).toBe(0);
  });

  it("помесячная аренда земли считается индексируемым аннуитетом", () => {
    const r = computeRoi(
      bare({
        tenure: "leasehold",
        leaseRenewable: true,
        leaseMonthly: true,
        leaseMonthlyThb: 50_000,
        leaseIndexationPct: 3,
        years: 5,
      }),
    );
    let expected = 0;
    for (let y = 1; y <= 5; y++) expected += 50_000 * 12 * Math.pow(1.03, y - 1);
    expect(r.leasePaymentsTotal).toBeCloseTo(expected, 2);
  });

  it("при freehold платежей за землю нет", () => {
    const r = computeRoi(bare({ leaseMonthly: true, leaseMonthlyThb: 50_000 }));
    expect(r.leasePaymentsTotal).toBe(0);
  });
});

describe("computeRoi — режим аренды", () => {
  const rent = (over: Partial<RoiInputs> = {}) =>
    bare({
      mode: "rent",
      longTermRent: true,
      monthlyRentThb: 50_000,
      occupancyPct: 100,
      mgmtFeePct: 0,
      opexPct: 0,
      rentTaxPct: 0,
      rentGrowthPct: 0,
      furnishingThb: 0,
      seasonality: false,
      years: 3,
      ...over,
    });

  it("валовая доходность — это годовая аренда к вложенному", () => {
    const r = computeRoi(rent());
    expect(r.grossYieldPct).toBeCloseTo((50_000 * 12) / 10_000_000 * 100, 6);
  });

  it("комиссия управляющего и налог срезают чистый доход", () => {
    const gross = computeRoi(rent()).rentNetTotal;
    const managed = computeRoi(rent({ mgmtFeePct: 25 })).rentNetTotal;
    const taxed = computeRoi(rent({ rentTaxPct: 15 })).rentNetTotal;
    expect(managed).toBeCloseTo(gross * 0.75, 2);
    expect(taxed).toBeCloseTo(gross * 0.85, 2);
  });

  it("занятость масштабирует доход линейно", () => {
    const full = computeRoi(rent({ occupancyPct: 100 })).rentNetTotal;
    const half = computeRoi(rent({ occupancyPct: 50 })).rentNetTotal;
    expect(half).toBeCloseTo(full / 2, 2);
  });

  it("число юнитов умножает аренду, но не цену", () => {
    const one = computeRoi(rent({ unitCount: 1 }));
    const two = computeRoi(rent({ unitCount: 2 }));
    expect(two.rentNetTotal).toBeCloseTo(one.rentNetTotal * 2, 2);
    expect(two.initialInvestment).toBeCloseTo(one.initialInvestment, 2);
  });

  it("cap rate считается от цены и учитывает расходы владения", () => {
    const r = computeRoi(rent({ annualHoldingPct: 1 }));
    const noi = 50_000 * 12 - 10_000_000 * 0.01;
    expect(r.capRatePct).toBeCloseTo((noi / 10_000_000) * 100, 6);
  });

  it("посуточная сдача без сезонности — ставка × занятость × 365", () => {
    const r = computeRoi(
      rent({ longTermRent: false, nightlyRateThb: 8_000, occupancyPct: 50 }),
    );
    expect(r.grossYieldPct).toBeCloseTo(((8_000 * 0.5 * 365) / 10_000_000) * 100, 6);
  });

  it("в режиме удержания аренда не начисляется", () => {
    const r = computeRoi(bare({ mode: "hold", monthlyRentThb: 50_000, occupancyPct: 100 }));
    expect(r.rentNetTotal).toBe(0);
    expect(r.grossYieldPct).toBe(0);
  });
});

describe("computeRoi — сравнение с альтернативами и валютой", () => {
  it("депозит под тот же процент даёт тот же результат, что нулевая разница", () => {
    const r = computeRoi(bare({ bankRatePct: 5, years: 10 }));
    expect(r.bankFinal).toBeCloseTo(r.initialInvestment * Math.pow(1.05, 10), 2);
    expect(r.vsBankThb).toBeCloseTo(r.totalReturn - r.bankFinal, 2);
  });

  it("укрепление бата поднимает доходность в валюте покупателя", () => {
    const neutral = computeRoi(bare({ fxDriftPct: 0 }));
    const stronger = computeRoi(bare({ fxDriftPct: 2 }));
    const weaker = computeRoi(bare({ fxDriftPct: -2 }));
    expect(stronger.roiFxPct).toBeGreaterThan(neutral.roiFxPct);
    expect(weaker.roiFxPct).toBeLessThan(neutral.roiFxPct);
  });

  it("инфляция уменьшает реальную стоимость, но не номинальную", () => {
    const r = computeRoi(bare({ inflationPct: 4, years: 10 }));
    expect(r.realProjectedValue).toBeCloseTo(r.projectedValue / Math.pow(1.04, 10), 2);
    expect(r.realCagrPct).toBeLessThan(r.cagrPct);
  });
});

describe("computeRoi — off-plan", () => {
  it("даёт наценку за срок стройки", () => {
    const r = computeRoi(
      bare({ offplan: true, handoverUpliftPct: 15, constructionMonths: 24, years: 5 }),
    );
    expect(r.handoverValue).toBeCloseTo(10_000_000 * 1.15, 2);
  });

  it("в обычном режиме стоимости на передаче нет", () => {
    expect(computeRoi(bare({ offplan: false })).handoverValue).toBe(0);
  });
});

describe("solveMaxPrice — обратная задача", () => {
  /** Обратный счёт осмыслен только там, где аренда задана в батах, а цена меняется. */
  const rentInput = bare({
    mode: "rent",
    longTermRent: true,
    monthlyRentThb: 50_000,
    occupancyPct: 100,
    mgmtFeePct: 20,
    opexPct: 0,
    rentTaxPct: 0,
    rentGrowthPct: 0,
    furnishingThb: 0,
    seasonality: false,
    years: 10,
  });

  it("возвращает цену, при которой cap rate ровно целевой", () => {
    const price = solveMaxPrice(rentInput, "cap", 5);
    expect(price).not.toBeNull();
    expect(computeRoi({ ...rentInput, purchasePriceThb: price! }).capRatePct).toBeCloseTo(5, 2);
  });

  it("на ту же обратную задачу по ROI отвечает согласованно с прямой", () => {
    const price = solveMaxPrice(rentInput, "roi", 120);
    expect(price).not.toBeNull();
    expect(computeRoi({ ...rentInput, purchasePriceThb: price! }).roiPct).toBeCloseTo(120, 1);
  });

  it("чем выше требуемая доходность, тем ниже допустимая цена", () => {
    const cheap = solveMaxPrice(rentInput, "cap", 8);
    const dear = solveMaxPrice(rentInput, "cap", 4);
    expect(cheap).not.toBeNull();
    expect(dear).not.toBeNull();
    expect(cheap!).toBeLessThan(dear!);
  });

  it("в режиме удержания честно отвечает null: там ROI не зависит от цены", () => {
    const input = bare({ annualGrowthPct: 6, years: 10, saleCostsPct: 5, annualHoldingPct: 1 });
    // Контракт модуля: все издержки заданы процентами от цены, поэтому ROI
    // масштабно-инвариантен — «максимальной цены под целевой ROI» не существует,
    // и выдумывать её нельзя (интерфейс на этот null показывает пояснение).
    const doubled = computeRoi({ ...input, purchasePriceThb: 20_000_000 }).roiPct;
    expect(computeRoi(input).roiPct).toBeCloseTo(doubled, 6);
    expect(solveMaxPrice(input, "roi", 60)).toBeNull();
  });

  it("для недостижимой цели отвечает null, а не выдумывает цену", () => {
    expect(solveMaxPrice(rentInput, "cap", 500)).toBeNull();
  });
});

describe("computeRoi — устойчивость к пустому вводу", () => {
  it("нулевая цена не роняет расчёт и не даёт NaN", () => {
    const r = computeRoi(bare({ purchasePriceThb: 0 }));
    for (const v of [r.roiPct, r.cagrPct, r.netProfit, r.projectedValue, r.irrPct]) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });

  it("срок меньше года считается как один год", () => {
    const r = computeRoi(bare({ years: 0 }));
    expect(r.series).toHaveLength(2); // нулевой год + первый
    expect(r.projectedValue).toBeCloseTo(10_600_000, 2);
  });
});
