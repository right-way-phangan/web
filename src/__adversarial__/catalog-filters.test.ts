import { describe, expect, it } from "vitest";
import {
  makeFilterPredicate,
  parseListingsSearchParams,
  acquisitionValueThb,
  isRental,
  summarizeForBrief,
} from "@/lib/filters/listings";
import { normalizeTenure } from "@/lib/utils/tenure";
import { escalatedLeaseTotalThb } from "@/lib/objects/lease-format";
import type { RealEstateObject } from "@/types/object";

/**
 * Характеризующие тесты red-team: фиксируют ФАКТИЧЕСКОЕ (сломанное) поведение
 * публичного каталога, чтобы правка не прошла незамеченной. Зелёные намеренно.
 */

const o = (p: Partial<RealEstateObject>): RealEstateObject => p as RealEstateObject;
const sp = (q: string) =>
  parseListingsSearchParams(Object.fromEntries(new URLSearchParams(q).entries()));

// АТАКА 1 [HIGH]: объект с тенурой "Mixed / N.A." (в проде — 46 из 89 публичных,
// 52% каталога) | ОЖИДАЛОСЬ: смешанная форма владения попадает в фильтры tenure |
// БЫЛО: normalizeTenure давал ["Mixed"], фильтр сверял строгим включением по
// множеству {Freehold, Leasehold} → объект выпадал И из ?tenure=Freehold, И из
// ?tenure=Leasehold, а "Mixed" не является допустимым значением URL-параметра —
// то есть был недостижим вообще; половина каталога исчезала от клика по чипу |
// ИСПРАВЛЕНО 2026-08-31: "Mixed / N.A." = «freehold ИЛИ leasehold на выбор»,
// поэтому раскрывается в ОБЕ формы (правило feedback_leasehold_everywhere).
// код: src/lib/utils/tenure.ts:30
describe("АТАКА 1 — tenure=Mixed раскрывается в обе формы владения", () => {
  const mixed = o({
    rwNumber: "RW-L0900",
    type: "Land",
    priceThb: 10_000_000,
    tenure: normalizeTenure(["Mixed / N.A."]),
  });

  it("сырой лейбл БД нормализуется в ['Freehold', 'Leasehold']", () => {
    expect(normalizeTenure(["Mixed / N.A."])).toEqual(["Freehold", "Leasehold"]);
  });

  it("объект попадает в ?tenure=Leasehold", () => {
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(mixed)).toBe(true);
  });

  it("и в ?tenure=Freehold — обе опции достижимы своим чипом", () => {
    expect(makeFilterPredicate(sp("tenure=Freehold"))(mixed)).toBe(true);
    expect(makeFilterPredicate(sp("tenure=Freehold,Leasehold"))(mixed)).toBe(true);
  });

  it("?tenure=Mixed молча игнорируется парсером — фильтр не применяется вовсе", () => {
    expect(sp("tenure=Mixed").tenure).toEqual([]);
  });

  it("инвентарь /leasehold ловит его тем же includes('Leasehold')", () => {
    // src/components/sections/leasehold-listings.tsx:36 — теперь секция
    // действительно показывает лейблы "Mixed / N.A.", как обещает её комментарий.
    expect(normalizeTenure(mixed.tenure)?.includes("Leasehold")).toBe(true);
  });
});

// АТАКА 2 [HIGH, ИСПРАВЛЕНО 2026-08-31]: лизхолд-объект с помесячной ставкой, у которого срок лизинга
// не заполнен (или < 3 лет) | ОЖИДАЕТСЯ: объект с tenure ⊇ Leasehold обязан быть
// в /listings?tenure=Leasehold (memory feedback_leasehold_everywhere) | ФАКТ:
// Buy/Rent-разделение считает его краткосрочной арендой и вырезает из вкладки
// Buy (режим по умолчанию) ещё до проверки tenure; секция /leasehold его при
// этом показывает и ведёт кнопкой «See all leasehold listings» в список, где
// его нет. код: src/lib/filters/listings.ts:203 + :72-74
describe("АТАКА 2 — лизхолд без срока остаётся в ?tenure=Leasehold", () => {
  const leaseNoTerm = o({
    rwNumber: "RW-L0901",
    type: "Land",
    tenure: ["Leasehold"],
    rentPerRaiMonth: 25_000,
    areaRai: 2,
    // leaseTermYears не заполнен — обычная ситуация «срок обсуждается»
  });

  it("секция /leasehold его показывает", () => {
    expect(normalizeTenure(leaseNoTerm.tenure)?.includes("Leasehold")).toBe(true);
  });

  it("и фильтр каталога тоже: leasehold-оффер больше не считается арендой", () => {
    expect(isRental(leaseNoTerm)).toBe(false);
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(leaseNoTerm)).toBe(true);
  });

  it("двухлетний лизинг ведёт себя так же — граница 3 года больше не режет по живому", () => {
    const twoYears = o({ ...leaseNoTerm, leaseTermYears: 2 });
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(twoYears)).toBe(true);
  });

  it("объект с ценой продажи И арендной ставкой остаётся во вкладке Buy", () => {
    const both = o({ rwNumber: "RW-V0902", type: "Villa", priceThb: 18_000_000, rentPerMonth: 80_000 });
    expect(makeFilterPredicate(sp(""))(both)).toBe(true);
  });

  it("а настоящая краткосрочная аренда остаётся арендой", () => {
    const rental = o({ rwNumber: "RW-V0903", type: "Villa", rentPerMonth: 60_000 });
    expect(isRental(rental)).toBe(true);
    expect(makeFilterPredicate(sp(""))(rental)).toBe(false);
    expect(makeFilterPredicate(sp("mode=rent"))(rental)).toBe(true);
  });
});

// АТАКА 3 [HIGH, деньги]: диапазон цены в каталоге для лизхолда с индексацией |
// ОЖИДАЛОСЬ: фильтр «до ฿20M» не показывает объект, чья карточка и страница
// объявляют «≈ ฿22.9M всего» | БЫЛО: acquisitionValueThb считал ПЛОСКИЙ total
// (rent×12×years), а карточка и заголовок цены — ИНДЕКСИРОВАННЫЙ
// (escalatedLeaseTotalThb); расхождение 1.6× пускало объект в бюджетный фильтр
// покупателя, и он открывался ценой на 8.5 млн выше запрошенного потолка |
// ИСПРАВЛЕНО 2026-08-31: фильтр считает тем же escalatedLeaseTotalThb, что и витрина.
// код: src/lib/filters/listings.ts:89-93
describe("АТАКА 3 — фильтр цены и витрина считают лизхолд одинаково", () => {
  const lease = o({
    rwNumber: "RW-L0903",
    type: "Land",
    tenure: ["Leasehold"],
    rentPerMonth: 40_000,
    leaseTermYears: 30,
    leaseEscPercent: 10,
    leaseEscPeriodYears: 3,
  });

  const shown = escalatedLeaseTotalThb(40_000, 30, 10, 3);
  const filtered = acquisitionValueThb(lease)!;

  it("фильтр видит ровно ту сумму, что показывает витрина (≈฿22.9M)", () => {
    expect(filtered).toBe(shown);
    expect(shown).toBeGreaterThan(22_000_000);
  });

  it("?pmax=20 (до ฿20M) больше не отдаёт объект за ฿22.9M", () => {
    expect(makeFilterPredicate(sp("pmax=20"))(lease)).toBe(false);
    // и остаётся в выдаче, когда потолок реально его покрывает
    expect(makeFilterPredicate(sp("pmax=25"))(lease)).toBe(true);
  });
});

// АТАКА 4 [MEDIUM, двуязычие]: пустая выдача на /ru/listings | ОЖИДАЕТСЯ:
// предзаполненный текст брифа по-русски (правило CLAUDE.md §1) | ФАКТ:
// summarizeForBrief не принимает локаль и всегда возвращает английский текст —
// русский посетитель получает в форму "Hi — I couldn't find a match…".
// код: src/lib/filters/listings.ts:313-337, вызов src/app/ru/listings/page.tsx:82
describe("АТАКА 4 — бриф на /ru/listings по-английски", () => {
  it("русская страница получает англоязычный текст без возможности локализовать", () => {
    const msg = summarizeForBrief(sp("mode=rent&type=Land&rmax=30&seaview=1"))!;
    expect(msg).toContain("Hi — I couldn't find a match on the site for what I'm after.");
    expect(msg).toContain("Could you send any private or upcoming listings that fit?");
    expect(msg).toContain("for rent");
    expect(msg).toContain("sea view");
    expect(/[А-Яа-я]/.test(msg)).toBe(false);
  });
});
