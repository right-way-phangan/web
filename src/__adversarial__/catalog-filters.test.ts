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
// 52% каталога) | ОЖИДАЕТСЯ: смешанная форма владения попадает хотя бы в один
// фильтр tenure (по правилу feedback_leasehold_everywhere — в Leasehold) | ФАКТ:
// normalizeTenure даёт ["Mixed"], фильтр сверяет строгим включением по множеству
// {Freehold, Leasehold} → объект выпадает И из ?tenure=Freehold, И из
// ?tenure=Leasehold; "Mixed" не является допустимым значением URL-параметра, то
// есть недостижим вообще. Половина каталога исчезает от одного клика по чипу.
// код: src/lib/filters/listings.ts:207-211, src/lib/utils/tenure.ts:26,
//      src/components/objects/listings-filter-bar.tsx:30
describe("АТАКА 1 — tenure=Mixed выпадает из каталога", () => {
  const mixed = o({
    rwNumber: "RW-L0900",
    type: "Land",
    priceThb: 10_000_000,
    tenure: normalizeTenure(["Mixed / N.A."]),
  });

  it("сырой лейбл БД нормализуется в ['Mixed'] — без Leasehold и без Freehold", () => {
    expect(normalizeTenure(["Mixed / N.A."])).toEqual(["Mixed"]);
  });

  it("объект выпадает из ?tenure=Leasehold", () => {
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(mixed)).toBe(false);
  });

  it("и одновременно из ?tenure=Freehold — форма владения недостижима ни одним чипом", () => {
    expect(makeFilterPredicate(sp("tenure=Freehold"))(mixed)).toBe(false);
    expect(makeFilterPredicate(sp("tenure=Freehold,Leasehold"))(mixed)).toBe(false);
  });

  it("?tenure=Mixed молча игнорируется парсером — фильтр не применяется вовсе", () => {
    expect(sp("tenure=Mixed").tenure).toEqual([]);
  });

  it("инвентарь /leasehold использует то же includes('Leasehold') → секция его тоже не покажет", () => {
    // src/components/sections/leasehold-listings.tsx:36 — при этом её же
    // комментарий обещает ловить лейблы "Mixed / N.A.".
    expect(normalizeTenure(mixed.tenure)?.includes("Leasehold")).toBe(false);
  });
});

// АТАКА 2 [HIGH]: лизхолд-объект с помесячной ставкой, у которого срок лизинга
// не заполнен (или < 3 лет) | ОЖИДАЕТСЯ: объект с tenure ⊇ Leasehold обязан быть
// в /listings?tenure=Leasehold (memory feedback_leasehold_everywhere) | ФАКТ:
// Buy/Rent-разделение считает его краткосрочной арендой и вырезает из вкладки
// Buy (режим по умолчанию) ещё до проверки tenure; секция /leasehold его при
// этом показывает и ведёт кнопкой «See all leasehold listings» в список, где
// его нет. код: src/lib/filters/listings.ts:203 + :72-74
describe("АТАКА 2 — лизхолд без срока пропадает из ?tenure=Leasehold", () => {
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

  it("а фильтр каталога — нет: он классифицирован как аренда", () => {
    expect(isRental(leaseNoTerm)).toBe(true);
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(leaseNoTerm)).toBe(false);
  });

  it("двухлетний лизинг ведёт себя так же — граница 3 года режет по живому", () => {
    const twoYears = o({ ...leaseNoTerm, leaseTermYears: 2 });
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(twoYears)).toBe(false);
  });

  it("объект с ценой продажи И арендной ставкой тоже исчезает из вкладки Buy", () => {
    const both = o({ rwNumber: "RW-V0902", type: "Villa", priceThb: 18_000_000, rentPerMonth: 80_000 });
    expect(makeFilterPredicate(sp(""))(both)).toBe(false);
  });
});

// АТАКА 3 [HIGH, деньги]: диапазон цены в каталоге для лизхолда с индексацией |
// ОЖИДАЕТСЯ: фильтр «до ฿20M» не показывает объект, чья карточка и страница
// объявляют «≈ ฿22.9M всего» | ФАКТ: acquisitionValueThb считает ПЛОСКИЙ total
// (rent×12×years), а карточка и заголовок цены — ИНДЕКСИРОВАННЫЙ
// (escalatedLeaseTotalThb). Расхождение 1.6× — объект проходит бюджетный фильтр
// покупателя и открывается ценой на 8.5 млн выше запрошенного потолка.
// код: src/lib/filters/listings.ts:88 vs src/components/objects/object-price.tsx:73
//      (и src/components/objects/object-card.tsx:290)
describe("АТАКА 3 — фильтр цены считает лизхолд без индексации, а показывает с ней", () => {
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

  it("витрина показывает ≈฿22.9M, фильтр видит ฿14.4M", () => {
    expect(filtered).toBe(14_400_000);
    expect(shown).toBeGreaterThan(22_000_000);
    expect(shown / filtered).toBeGreaterThan(1.5);
  });

  it("?pmax=20 (до ฿20M) отдаёт объект с показанной суммой ฿22.9M", () => {
    expect(makeFilterPredicate(sp("pmax=20"))(lease)).toBe(true);
    expect(shown).toBeGreaterThan(20_000_000);
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
