import { describe, expect, it } from "vitest";
import {
  acquisitionValueThb,
  applySort,
  deriveFilterOptions,
  isRental,
  makeFilterPredicate,
  parseListingsSearchParams,
  priceFieldOf,
} from "@/lib/filters/listings";
import { escalatedLeaseTotalThb } from "@/lib/objects/lease-format";
import { normalizeTenure } from "@/lib/utils/tenure";
import type { RealEstateObject } from "@/types/object";

/**
 * RED-TEAM, РАУНД 2 — атака на фикс 66435c5 в `isRental` / `acquisitionValueThb`.
 * Характеризующие зелёные тесты фиксируют ФАКТИЧЕСКОЕ поведение — они не
 * утверждают, что оно правильное.
 *
 * Сверено 2026-08-31 (откат раскрытия «Mixed / N.A.» в две формы): поведение
 * ниже не изменилось, изменилась причина. Раньше объект с неустановленным
 * правом получал токен "Leasehold" от normalizeTenure; теперь токен остаётся
 * "Mixed", но `isRental` считает лизхолд ВОЗМОЖНЫМ через `offersLeasehold`
 * (listings.ts:87-89), который на "Mixed" тоже отвечает true. Итог тот же:
 * помесячная аренда с неустановленным правом уезжает во вкладку Buy.
 */

const o = (p: Partial<RealEstateObject>): RealEstateObject => p as RealEstateObject;
const sp = (q: string) =>
  parseListingsSearchParams(Object.fromEntries(new URLSearchParams(q).entries()));

// АТАКА 30 [HIGH]: настоящая помесячная аренда виллы, у которой в CRM форма
// владения стоит "Mixed / N.A." (52% каталога) | ОЖИДАЕТСЯ: объект с месячной
// ставкой и без срока лизинга — краткосрочная аренда, вкладка Rent |
// ФАКТ (НЕ ЗАКРЫТО 2026-08-31): `isRental` отсекает объект по
// `offersLeasehold`, а тот считает "Mixed" (право не установлено) возможным
// лизхолдом — поэтому объект вылетает из Rent и приземляется в Buy. Откат
// раскрытия токена этого не изменил: сменилась причина, не результат. Вкладка
// Rent остаётся недостижимой для половины каталога, независимо от данных.
// код: src/lib/filters/listings.ts:87-89 (offersLeasehold) → :138 (isRental)
describe("АТАКА 30 — аренда с тенурой «Mixed / N.A.» осталась арендой", () => {
  const rentalMixed = o({
    id: 9101,
    rwNumber: "RW-V0920",
    type: "Villa",
    titleEn: "3BR villa, long-stay",
    rentPerMonth: 70_000,
    tenure: normalizeTenure(["Mixed / N.A."]),
    // ни priceThb, ни leaseTermYears — это именно аренда
  });

  it("тот же объект БЕЗ тенуры остаётся арендой", () => {
    expect(isRental(o({ ...rentalMixed, tenure: undefined }))).toBe(true);
  });

  it("с тенурой «Mixed / N.A.» он по-прежнему аренда", () => {
    expect(isRental(rentalMixed)).toBe(true);
  });

  it("во вкладке Rent он есть", () => {
    expect(makeFilterPredicate(sp("mode=rent"))(rentalMixed)).toBe(true);
  });

  it("и во вкладку Buy он НЕ попадает — витрина продажи его не показывает", () => {
    expect(makeFilterPredicate(sp(""))(rentalMixed)).toBe(false);
  });

  it("КОНТРОЛЬ: явный лизхолд без срока остаётся приобретением (вкладка Buy)", () => {
    const leaseNoTerm = o({ ...rentalMixed, id: 9102, tenure: ["Leasehold"] });
    expect(isRental(leaseNoTerm)).toBe(false);
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(leaseNoTerm)).toBe(true);
  });

  it("и объект с неустановленным правом по-прежнему виден по обоим чипам tenure", () => {
    expect(makeFilterPredicate(sp("mode=rent&tenure=Leasehold"))(rentalMixed)).toBe(true);
    expect(makeFilterPredicate(sp("mode=rent&tenure=Freehold"))(rentalMixed)).toBe(true);
  });
});

// АТАКА 31 [MEDIUM]: тумблер Buy/Rent | ОЖИДАЛОСЬ: пока в каталоге есть хоть
// один арендный объект, переключатель виден | БЫЛО (следствие АТАКИ 30):
// `deriveFilterOptions`
// считает `hasRentals` тем же `isRental`, поэтому каталог, целиком состоящий из
// арендных объектов с лизхолд-тенурой, отдаёт hasRentals=false — тумблер Rent
// скрывается, а URL ?mode=rent продолжает существовать и отдаёт пустую страницу.
// код: src/lib/filters/listings.ts:394-403
describe("АТАКА 31 — тумблер Rent виден на каталоге из одних только аренд", () => {
  const catalog = [
    o({ id: 1, rwNumber: "RW-V0921", type: "Villa", rentPerMonth: 60_000, tenure: ["Leasehold"] }),
    o({ id: 2, rwNumber: "RW-V0922", type: "Villa", rentPerMonth: 90_000, tenure: normalizeTenure(["Mixed / N.A."]) }),
  ];

  it("hasRentals=true: аренда с неустановленным правом распознана", () => {
    expect(catalog.every((x) => x.rentPerMonth != null)).toBe(true);
    expect(deriveFilterOptions(catalog).hasRentals).toBe(true);
  });

  it("и ?mode=rent отдаёт её", () => {
    // Явный лизхолд остаётся приобретением и в Rent не показывается —
    // это осознанная граница, а не потеря объекта.
    expect(catalog.filter(makeFilterPredicate(sp("mode=rent")))).toHaveLength(1);
  });
});

// АТАКА 32 [MEDIUM, деньги]: земельный лизхолд со ставкой ЗА РАЙ — основной
// продукт после пивота | ОЖИДАЕТСЯ (комментарий фикса, listings.ts:90-92):
// «Фильтр и витрина считают одинаково» | ФАКТ: фильтр считает
// rentPerRaiMonth × areaRai и индексирует, а витрина сознательно НЕ показывает
// total для ставок за рай — `object-price.tsx:69-74`: «a per-rai rent needs the
// plot area (not carried here), so it shows the term without a total», и
// карточка (`object-card.tsx:286`) требует именно `rentPerMonth`. Покупатель
// фильтрует «до ฿20M», получает объект, у которого на всей странице нет ни
// одной суммы, по которой он отфильтрован.
// код: src/lib/filters/listings.ts:93-96 против src/components/objects/object-price.tsx:71-74
describe("АТАКА 32 — фильтр цены считает лизхолд за рай по числу, которого нет на витрине", () => {
  const perRaiLease = o({
    id: 9102,
    rwNumber: "RW-L0923",
    type: "Land",
    tenure: ["Leasehold"],
    rentPerRaiMonth: 30_000,
    areaRai: 2,
    leaseTermYears: 30,
    leaseEscPercent: 10,
    leaseEscPeriodYears: 3,
  });

  const filterValue = acquisitionValueThb(perRaiLease)!;

  it("фильтр видит ≈฿34M (индексированный total 30k × 2 рая × 30 лет)", () => {
    expect(filterValue).toBe(escalatedLeaseTotalThb(60_000, 30, 10, 3));
    expect(filterValue).toBeGreaterThan(30_000_000);
  });

  it("витрина (object-price.tsx) НЕ считает этот total — ветка требует rentPerMonth", () => {
    const shownTotal =
      perRaiLease.rentPerMonth && perRaiLease.leaseTermYears
        ? escalatedLeaseTotalThb(
            perRaiLease.rentPerMonth,
            perRaiLease.leaseTermYears,
            perRaiLease.leaseEscPercent,
            perRaiLease.leaseEscPeriodYears,
          )
        : undefined;
    expect(shownTotal).toBeUndefined();
  });

  it("карточка каталога тоже не печатает «≈ … за 30 лет»", () => {
    expect(
      Boolean(!perRaiLease.priceThb && perRaiLease.rentPerMonth && perRaiLease.leaseTermYears),
    ).toBe(false);
  });

  it("итог: ?pmax=35 показывает объект, ?pmax=30 — прячет, и ни одна из границ на странице не видна", () => {
    expect(makeFilterPredicate(sp("pmax=35"))(perRaiLease)).toBe(true);
    expect(makeFilterPredicate(sp("pmax=30"))(perRaiLease)).toBe(false);
  });

  it("а без areaRai тот же объект вообще выпадает из любого ценового диапазона", () => {
    const noArea = o({ ...perRaiLease, areaRai: undefined });
    expect(acquisitionValueThb(noArea)).toBeUndefined();
    expect(makeFilterPredicate(sp("pmax=1000"))(noArea)).toBe(false);
  });
});

// АТАКА 33 [MEDIUM]: сортировка по цене в Buy | ОЖИДАЕТСЯ: земля, у которой
// заполнена только цена за рай (обычный случай интейка), участвует в сортировке
// и ценовом диапазоне | ФАКТ: `acquisitionValueThb` не знает про pricePerRai,
// поэтому такой объект получает undefined: он тонет в конец И при price-asc, И
// при price-desc, и вырезается любым ?pmin/?pmax — при том, что карточка
// печатает ему цену (object-card.tsx:265). Фикс расширил acquisitionValueThb на
// лизхолды, но эту дыру не закрыл.
// код: src/lib/filters/listings.ts:87-96, сортировка :341-352
describe("АТАКА 33 — земля с ценой «за рай» невидима для ценового фильтра и сортировки", () => {
  const perRaiSale = o({ id: 9103, rwNumber: "RW-L0924", type: "Land", pricePerRai: 4_000_000, areaRai: 3 });
  const plain = o({ id: 9104, rwNumber: "RW-L0925", type: "Land", priceThb: 8_000_000 });

  it("карточка цену показывает, а acquisitionValueThb — нет", () => {
    expect(perRaiSale.pricePerRai).toBe(4_000_000);
    expect(acquisitionValueThb(perRaiSale)).toBeUndefined();
    expect(priceFieldOf(perRaiSale, "buy")).toBeUndefined();
  });

  it("выпадает и из ?pmin, и из ?pmax", () => {
    expect(makeFilterPredicate(sp("pmin=1"))(perRaiSale)).toBe(false);
    expect(makeFilterPredicate(sp("pmax=1000"))(perRaiSale)).toBe(false);
  });

  it("тонет в конец списка в ОБЕ стороны сортировки", () => {
    expect(applySort([perRaiSale, plain], "price-asc", "buy").map((x) => x.rwNumber)).toEqual([
      "RW-L0925",
      "RW-L0924",
    ]);
    expect(applySort([perRaiSale, plain], "price-desc", "buy").map((x) => x.rwNumber)).toEqual([
      "RW-L0925",
      "RW-L0924",
    ]);
  });
});

// АТАКА 34 [MEDIUM]: объект, у которого есть И цена продажи, И лизинг-опция с
// помесячной ставкой (смешанный оффер «купить или взять в лизинг») |
// ОЖИДАЕТСЯ: в Buy он ранжируется по цене продажи, в Rent — по ставке |
// ФАКТ: `isRental` теперь возвращает false из-за priceThb, поэтому во вкладке
// Rent его нет вовсе; при этом карточка в Rent-режиме (object-card.tsx:240)
// готова его отрисовать по ставке — ветка просто недостижима.
// код: src/lib/filters/listings.ts:118
describe("АТАКА 34 — смешанный оффер «купить или арендовать» недостижим во вкладке Rent", () => {
  const both = o({
    id: 9105,
    rwNumber: "RW-V0926",
    type: "Villa",
    priceThb: 18_000_000,
    rentPerMonth: 85_000,
  });

  it("в Buy он есть и ранжируется по цене продажи", () => {
    expect(makeFilterPredicate(sp(""))(both)).toBe(true);
    expect(priceFieldOf(both, "buy")).toBe(18_000_000);
  });

  it("в Rent его нет, хотя ставка задана и карточка умеет её показать", () => {
    expect(both.rentPerMonth).toBe(85_000);
    expect(priceFieldOf(both, "rent")).toBe(85_000);
    expect(makeFilterPredicate(sp("mode=rent"))(both)).toBe(false);
  });
});
