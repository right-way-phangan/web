import { describe, expect, it } from "vitest";
import { computeRoi, DEFAULT_INPUTS } from "@/lib/calculator/roi";
import { fmtPct } from "@/components/calculator/roi-shared";
import {
  acquisitionValueThb,
  deriveFilterOptions,
  isRental,
  makeFilterPredicate,
  monthlyRentOf,
  parseListingsSearchParams,
} from "@/lib/filters/listings";
import type { RealEstateObject } from "@/types/object";

/**
 * RED-TEAM, РАУНД 3 — атака на фиксы 844fea1/78bdb51 в калькуляторе и на
 * Buy/Rent-разделение. Тесты характеризующие: фиксируют то, что калькулятор
 * печатает СЕЙЧАС.
 */

const o = (p: Partial<RealEstateObject>): RealEstateObject => p as RealEstateObject;
const sp = (q: string) =>
  parseListingsSearchParams(Object.fromEntries(new URLSearchParams(q).entries()));

// АТАКА 54 [MEDIUM, каталог]: лизхолд-объект, который реально сдаётся
// помесячно, выпал из вкладки Rent | ОЖИДАЕТСЯ: вилла, у которой указана
// месячная ставка и не указана цена продажи, ищется во вкладке Rent |
// ФАКТ: фикс 78bdb51 объявил приобретением ЛЮБОЙ явный лизхолд, без оглядки на
// срок, — поэтому такой объект навсегда уезжает в Buy. В Buy у него нет
// стоимости приобретения (нет ни цены, ни `leaseTermYears`), так что он
// проваливается в конец сортировки и вылетает из любого ценового диапазона:
// найти его нельзя ни в одной вкладке. Хуже: если помесячные объекты в каталоге
// ТОЛЬКО такие, `hasRentals` = false и тумблер Rent на /listings не рисуется
// вовсе — целый режим витрины исчезает от одного поля `tenure`.
// код: src/lib/filters/listings.ts:131-142, 104-115, 391-406
describe("АТАКА 54 — помесячная аренда с лизхолдом недостижима ни в Buy, ни в Rent", () => {
  const leaseRental = o({
    id: 1,
    rwNumber: "RW-V0501",
    type: "Villa",
    status: "Active",
    titleEn: "Villa for monthly rent",
    coverImage: "https://r2/a.jpg",
    tenure: ["Leasehold"],
    rentPerMonth: 60_000,
  });

  it("во вкладке Rent его нет", () => {
    expect(isRental(leaseRental)).toBe(false);
    expect(makeFilterPredicate(sp("mode=rent"))(leaseRental)).toBe(false);
  });

  it("в Buy он есть, но без стоимости приобретения", () => {
    expect(makeFilterPredicate(sp(""))(leaseRental)).toBe(true);
    expect(acquisitionValueThb(leaseRental)).toBeUndefined();
    expect(monthlyRentOf(leaseRental)).toBe(60_000);
  });

  it("поэтому любой ценовой фильтр в Buy его выбрасывает", () => {
    expect(makeFilterPredicate(sp("pmax=100"))(leaseRental)).toBe(false);
    expect(makeFilterPredicate(sp("pmin=1"))(leaseRental)).toBe(false);
  });

  it("и если помесячные объекты только такие — тумблер Rent не показывается", () => {
    expect(deriveFilterOptions([leaseRental]).hasRentals).toBe(false);
  });

  it("контроль: та же вилла без лизхолда — нормальный объект вкладки Rent", () => {
    const plain = o({ ...leaseRental, tenure: undefined });
    expect(isRental(plain)).toBe(true);
    expect(deriveFilterOptions([plain]).hasRentals).toBe(true);
  });
});

/** Сценарий из комментария к фиксу: лизхолд, дожитый до конца срока. */
const wiped = computeRoi({
  ...DEFAULT_INPUTS,
  tenure: "leasehold",
  leaseTermYears: 30,
  years: 30,
});

// АТАКА 55 [HIGH, деньги]: на том же сценарии, ради которого рост увели в NaN,
// окупаемость печатает конкретный год | ОЖИДАЕТСЯ: если вложенное потеряно
// целиком, ни одна строка не обещает выхода в плюс | ФАКТ: `paybackFrom`
// возвращает ПЕРВЫЙ год, где накопленная прибыль стала неотрицательной, и не
// смотрит, что было дальше. У лизхолда кривая ненадолго выходит в плюс
// (пик ≈ +฿226K на 11-м году) и потом падает до −฿10.8M. Итог одной карточки
// результата: «ROI −114.3%», «CAGR —», «IRR —» — и рядом KPI «Окупаемость 7.1
// лет» плюс строка вердикта «прибыль с 7.1 года». Фикс 844fea1 закрыл два поля
// из трёх и оставил самое утвердительное.
// код: src/lib/calculator/roi.ts:397-408, 571 → roi-ui.tsx:145,152 и
//      roi-calculator.tsx:980-991
describe("АТАКА 55 — «прибыль с 7.1 года» на сценарии, где потеряно всё вложенное", () => {
  it("итог сценария — минус вложенного целиком", () => {
    expect(wiped.roiPct).toBeCloseTo(-114.29, 1);
    expect(wiped.projectedValue).toBe(0);
    expect(wiped.netProfit).toBeLessThan(0);
  });

  it("рост и IRR честно печатают прочерк", () => {
    expect(fmtPct(wiped.cagrPct)).toBe("—");
    expect(fmtPct(wiped.irrPct)).toBe("—");
    expect(fmtPct(wiped.realCagrPct)).toBe("—");
  });

  it("а окупаемость печатает конкретный год — и он попадает в KPI и в вердикт", () => {
    expect(wiped.paybackYears).not.toBeNull();
    expect(wiped.paybackYears!.toFixed(1)).toBe("7.1");
  });

  it("кривая после этого года разворачивается вниз и уходит в минус до конца", () => {
    const peak = Math.max(...wiped.series.map((s) => s.profit));
    expect(peak).toBeGreaterThan(0);
    expect(peak).toBeLessThan(300_000); // на фоне вложенных ฿9.45M — шум
    expect(wiped.series[wiped.series.length - 1].profit).toBeLessThan(-10_000_000);
  });
});

// АТАКА 56 [MEDIUM, деньги]: вырожденный сценарий (нулевая цена) печатает
// «выдуманные нули» и взаимно противоречивые проценты | ОЖИДАЕТСЯ: та же
// логика, что и у `cagrPct`, — величина не определена, печатаем прочерк |
// ФАКТ: фикс 844fea1 перевёл в NaN только рост; `roiPct`, `vsBankThb`,
// `grossYieldPct`, `capRatePct`, `cashOnCashPct` остались на жёстком `: 0`, а
// `roiFxPct` считается из multiple = 0 и даёт −100%. Один экран показывает
// «ROI +0.0%» и тут же «в вашей валюте −100.0%», плюс KPI «Окупаемость 1.0
// год». В режиме аренды к этому добавляется «Чистая прибыль ≈ ฿12.5M» рядом с
// «ROI +0.0%». Сценарий бытовой: `/calculator?price=0` и пустое поле цены.
// код: src/lib/calculator/roi.ts:562, 449, 587-596, 571
describe("АТАКА 56 — нулевая цена: «+0.0%» рядом с «−100.0%» и «прибыль с 1.0 года»", () => {
  const zero = computeRoi({ ...DEFAULT_INPUTS, purchasePriceThb: 0 });

  it("рост уведён в прочерк, а ROI печатается настоящим числом", () => {
    expect(fmtPct(zero.cagrPct)).toBe("—");
    expect(fmtPct(zero.roiPct)).toBe("+0%");
  });

  it("тот же сценарий в валютном блоке — минус сто процентов", () => {
    expect(fmtPct(zero.roiFxPct)).toBe("-100%");
  });

  it("и KPI окупаемости обещает выход в плюс на первом году", () => {
    expect(zero.paybackYears).toBe(1);
  });

  it("в режиме аренды «ROI +0.0%» соседствует с многомиллионной чистой прибылью", () => {
    const zr = computeRoi({ ...DEFAULT_INPUTS, purchasePriceThb: 0, mode: "rent" });
    expect(fmtPct(zr.roiPct)).toBe("+0%");
    expect(zr.netProfit).toBeGreaterThan(10_000_000);
    expect(fmtPct(zr.cashOnCashPct)).toBe("+0%");
  });
});
