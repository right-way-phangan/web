import { describe, expect, it } from "vitest";
import { sanitizePublicObject, slimObjectForList, slimObjectForCard } from "@/lib/data/objects";
import { estimate, type ValuationSubject, type CompPoint, type EngineData } from "@/lib/valuation/engine";
import { buildFactorMap } from "@/lib/valuation/factors";
import type { RealEstateObject } from "@/types/object";

/**
 * Характеризующие тесты red-team: утечка внутреннего поля в публичный payload
 * и границы движка оценки. Зелёные намеренно — фиксируют факт, а не идеал.
 */

// АТАКА 9 [MEDIUM, утечка]: legacy-заметки CRM в публичной выдаче |
// ОЖИДАЕТСЯ: descriptionRaw («legacy amoCRM notes — archived, NOT shown
// publicly», types/object.ts:174) режется вместе с ownerName/docs/outreachNote |
// ФАКТ: поле не входит в деструктуризацию sanitizePublicObject и не режется
// slimObjectForList → уезжает в RSC-payload /listings целиком. Проверено на
// проде 2026-08-31: GET https://rightwaygroup.co/listings → 77 вхождений
// \"descriptionRaw\" в исходнике страницы. Ни одна карточка его не рисует:
// это чистая утечка канала (любая заметка про комиссию/собственника,
// оставленная в поле, публикуется мгновенно).
// код: src/lib/data/objects.ts:36-70 (sanitizePublicObject), :81-85 (slimObjectForList)
describe("АТАКА 9 — descriptionRaw уходит в публичный payload /listings", () => {
  const raw = "Owner Somchai 084-000-0000, комиссия 5% сверху, чистыми 9.5M";
  const obj = {
    rwNumber: "RW-L0904",
    ownerName: "Somchai",
    outreachNote: "торгуется",
    docs: [{ name: "chanote.pdf", url: "https://blob/x.pdf" }],
    descriptionRaw: raw,
    gallery: ["a.jpg"],
  } as unknown as RealEstateObject;

  const pub = sanitizePublicObject(obj);

  it("санитайзер режет контакты и документы", () => {
    expect(pub.ownerName).toBeUndefined();
    expect(pub.outreachNote).toBeUndefined();
    expect(pub.docs).toBeUndefined();
  });

  it("но оставляет descriptionRaw — и slimObjectForList его тоже не срезает", () => {
    expect(pub.descriptionRaw).toBe(raw);
    expect(slimObjectForList(pub).descriptionRaw).toBe(raw);
  });

  it("более узкий slimObjectForCard поле не пропускает — значит защита существует, но /listings её не использует", () => {
    expect(slimObjectForCard(pub).descriptionRaw).toBeUndefined();
  });
});

const factors = buildFactorMap();
const landComp = (over: Partial<CompPoint> = {}): CompPoint => ({
  ref: over.ref ?? "RW-L0001",
  source: "catalog",
  type: "Land",
  status: "Active",
  district: "Sri Thanu",
  areaRai: 1,
  priceThb: 10_000_000,
  pricePerRai: 10_000_000,
  documentType: "Chanote",
  roadType: "Concrete",
  terrain: "Flat",
  seaView: false,
  beachfront: false,
  electricity: true,
  ...over,
});
const data = (comps: CompPoint[]): EngineData => ({ comps, market: null, factors });
const uniform = Array.from({ length: 10 }, (_, i) =>
  landComp({ ref: `RW-L${String(i + 1).padStart(4, "0")}` }),
);
const plot: ValuationSubject = {
  type: "Land",
  district: "Sri Thanu",
  areaRai: 1,
  documentType: "Chanote",
  roadType: "Concrete",
  terrain: "Flat",
  electricity: true,
};

// АТАКА 10 [MEDIUM, деньги]: срок лизинга введён как 0 | ОЖИДАЕТСЯ: либо отказ,
// либо честный расчёт на дефолтные 30 лет, как обещает оговорка | ФАКТ:
// `term = leaseTermYears ?? 30` пропускает 0 (?? ловит только null/undefined),
// цикл NPV не выполняется ни разу → fairNpv = 0, при этом в caveats падает
// «Срок lease не указан — NPV посчитан на 30 лет». Отчёт утверждает одно,
// цифра показывает другое: стоимость лизхолда = ฿0.
// код: src/lib/valuation/engine.ts:1239 vs :1257
describe("АТАКА 10 — NPV лизхолда = 0 при сроке 0, а оговорка обещает 30 лет", () => {
  const r = estimate({ ...plot, tenure: "Leasehold", leaseTermYears: 0 }, data(uniform));

  it("оценка возвращается успешной", () => {
    expect(r.ok).toBe(true);
  });

  it("NPV обнулён", () => {
    expect(r.leasehold?.fairNpv).toBe(0);
  });

  it("но оговорка утверждает, что посчитано на 30 лет", () => {
    expect(r.caveats ?? []).toContain("Срок lease не указан — NPV посчитан на 30 лет.");
  });

  it("при незаполненном сроке (undefined) NPV честные ~5.4 млн — контраст виден", () => {
    const ok = estimate({ ...plot, tenure: "Leasehold" }, data(uniform));
    expect(ok.leasehold?.fairNpv).toBeGreaterThan(5_000_000);
  });
});

// АТАКА 11 [MEDIUM, публичный лид-магнит]: площадь участка вне здравого смысла
// на /tools/estimate | ОЖИДАЕТСЯ: верхняя граница правдоподобия (весь остров
// Панган ≈ 78 км² ≈ 48 000 рай) либо отказ | ФАКТ: единственная проверка входа
// — «конечное и > 0» (public-estimate.ts:47), движок линейно масштабирует
// цену за рай и уверенно отдаёт ok:true c восьмитриллионной вилкой; результат
// показывается посетителю и пишется строкой в журнал valuations (createdBy=
// 'public') — то есть неаутентифицированный вход ещё и наполняет таблицу.
// код: src/lib/actions/public-estimate.ts:45-47, src/lib/valuation/engine.ts:264-285
describe("АТАКА 11 — публичная оценка без границы правдоподобия", () => {
  const huge = estimate({ ...plot, areaRai: 1_000_000 }, data(uniform));

  it("миллион рай (в 20 раз больше всего острова) оценивается без оговорок", () => {
    expect(huge.ok).toBe(true);
    expect(huge.listValue!).toBeGreaterThan(1e12);
  });

  it("а 0.0001 рай (0.16 м²) — тоже валидная оценка на ฿1 000", () => {
    const tiny = estimate({ ...plot, areaRai: 0.0001 }, data(uniform));
    expect(tiny.ok).toBe(true);
    expect(tiny.listValue).toBe(1000);
  });
});
