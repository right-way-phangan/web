import { describe, expect, it, vi } from "vitest";
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
// ИСПРАВЛЕНО 2026-08-31: slimObjectForList срезает поле (objects.ts:88-93)
describe("АТАКА 9 — descriptionRaw больше не уходит в публичный payload /listings", () => {
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

  it("slimObjectForList режет descriptionRaw — в payload каталога его больше нет", () => {
    // Лендинги проектов читают своё поле напрямую и этим срезом не ходят,
    // поэтому сам sanitizePublicObject поле сохраняет.
    expect(pub.descriptionRaw).toBe(raw);
    expect(slimObjectForList(pub).descriptionRaw).toBeUndefined();
    expect(JSON.stringify(slimObjectForList(pub))).not.toContain("084-000-0000");
  });

  it("более узкий slimObjectForCard поле тоже не пропускает", () => {
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

// АТАКА 10 [MEDIUM, деньги]: срок лизинга введён как 0 | ОЖИДАЛОСЬ: либо отказ,
// либо честный расчёт на дефолтные 30 лет, как обещает оговорка | БЫЛО:
// `term = leaseTermYears ?? 30` пропускал 0 (?? ловит только null/undefined),
// цикл NPV не выполнялся ни разу → fairNpv = 0, при этом в caveats падало
// «Срок lease не указан — NPV посчитан на 30 лет»: отчёт утверждал одно, а
// цифра показывала стоимость лизхолда ฿0
// | ИСПРАВЛЕНО 2026-08-31: срок ≤ 0 трактуется как «не указан» → те самые 30 лет
// код: src/lib/valuation/engine.ts:1241-1243
describe("АТАКА 10 — срок 0 считается как 30 лет, и оговорка это подтверждает", () => {
  const r = estimate({ ...plot, tenure: "Leasehold", leaseTermYears: 0 }, data(uniform));

  it("оценка возвращается успешной", () => {
    expect(r.ok).toBe(true);
  });

  it("NPV больше не обнулён — считается на дефолтные 30 лет", () => {
    expect(r.leasehold?.fairNpv).toBeGreaterThan(5_000_000);
  });

  it("и оговорка говорит ровно то же самое", () => {
    expect(r.caveats ?? []).toContain("Срок lease не указан — NPV посчитан на 30 лет.");
  });

  it("незаполненный срок (undefined) даёт ту же цифру — расхождения между 0 и undefined нет", () => {
    const ok = estimate({ ...plot, tenure: "Leasehold" }, data(uniform));
    expect(ok.leasehold?.fairNpv).toBe(r.leasehold?.fairNpv);
  });
});

// АТАКА 11 [MEDIUM, публичный лид-магнит]: площадь участка вне здравого смысла
// на /tools/estimate | ОЖИДАЛОСЬ: верхняя граница правдоподобия либо отказ |
// БЫЛО: единственной проверкой входа было «конечное и > 0», движок линейно
// масштабировал цену за рай и уверенно отдавал ok:true с восьмитриллионной
// вилкой; результат показывался посетителю и писался строкой в журнал valuations
// | ИСПРАВЛЕНО 2026-08-31: потолок на публичном фасаде (500 рай ≫ любого лота
// на острове), движок как инструмент оценщика границ по-прежнему не ставит
// код: src/lib/actions/public-estimate.ts:50-56,60-66
describe("АТАКА 11 — публичный фасад отбивает невозможные площади", () => {
  it("миллион рай отклоняется, не доходя до движка", async () => {
    vi.resetModules();
    const runValuation = vi.fn();
    vi.doMock("@/lib/actions/valuation", () => ({ runValuation }));

    const { estimatePublic } = await import("@/lib/actions/public-estimate");
    const res = await estimatePublic({ type: "Land", areaRai: 1_000_000 });

    expect(res).toEqual({ ok: false, reason: "unsupported" });
    expect(runValuation).not.toHaveBeenCalled();

    vi.doUnmock("@/lib/actions/valuation");
    vi.resetModules();
  });

  it("а движок сам границ не ставит — вход валидирует фасад, не он", () => {
    const huge = estimate({ ...plot, areaRai: 1_000_000 }, data(uniform));
    expect(huge.ok).toBe(true);
  });
});
