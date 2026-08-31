import { describe, expect, it } from "vitest";
import { normalizeTenure } from "@/lib/utils/tenure";
import { matchesTenure, offersLeasehold, makeFilterPredicate, parseListingsSearchParams } from "@/lib/filters/listings";
import { sanitizeProfile, profileToFilter, serializeCandidate } from "@/lib/match/engine";
import { buildFacts, fallbackCreatives } from "@/lib/ads/creatives";
import { buildObjectDescription } from "@/lib/generate/object-description";
import type { RealEstateObject } from "@/types/object";

/**
 * RED-TEAM, РАУНД 3 — атака на откат 78bdb51: токен снова `["Mixed"]`, а
 * попадание в выдачу держится на `matchesTenure`/`offersLeasehold`.
 *
 * Раунд 2 проверял, что объект «ниоткуда не исчезает». Раунд 3 проверяет второй
 * конец: что происходит на ВСЕХ остальных поверхностях, которые сравнивают
 * `o.tenure` напрямую и про новую политику не знают. Тесты характеризующие.
 */

const o = (p: Partial<RealEstateObject>): RealEstateObject => p as RealEstateObject;
const sp = (q: string) =>
  parseListingsSearchParams(Object.fromEntries(new URLSearchParams(q).entries()));

/** Объект ровно как он приходит после нормализации в objects.ts:200. */
const mixed = o({
  id: 1,
  rwNumber: "RW-L0910",
  type: "Land",
  status: "Active",
  titleEn: "Sea-view plot in Sri Thanu",
  district: "Sri Thanu",
  areaRai: 1.5,
  priceThb: 9_000_000,
  coverImage: "https://r2/a.jpg",
  documentType: "Chanote",
  tenure: normalizeTenure(["Mixed / N.A."]),
});

// АТАКА 49 [HIGH, введение в заблуждение]: объект с НЕустановленным правом
// засчитывается чипу Freehold | ОЖИДАЕТСЯ: покупатель, нажавший «Freehold»,
// видит объекты, про которые известно, что они freehold | ФАКТ: `matchesTenure`
// отвечает true на ЛЮБОЙ чип, если у объекта стоит «Mixed», — то есть именно
// там, где право не установлено. Отобранный по Freehold объект открывается
// страницей, где в юридической таблице стоит сырой CRM-токен «Mixed»
// (`o.tenure.join(", ")`), и он же уходит в JSON-LD, в OG-картинку, в таблицу
// сравнения и в строку кандидата для ранжирующего LLM — нигде не переведён и
// нигде не помечен как «не установлено». На /ru то же слово по-английски.
// код: src/lib/filters/listings.ts:80-84; печать токена —
//      spec-table.tsx:73, compare-table.tsx:117, object-json-ld.tsx:79-82,
//      lib/seo/object-og.tsx:50, projects/spec-strip.tsx:15, match/engine.ts:348
describe("АТАКА 49 — «право не установлено» проходит фильтр Freehold и печатается как «Mixed»", () => {
  it("чип Freehold пропускает объект с неустановленным правом", () => {
    expect(matchesTenure(mixed, ["Freehold"])).toBe(true);
    expect(makeFilterPredicate(sp("tenure=Freehold"))(mixed)).toBe(true);
  });

  it("тот же объект проходит и чип Leasehold, и оба чипа сразу", () => {
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(mixed)).toBe(true);
    expect(makeFilterPredicate(sp("tenure=Freehold,Leasehold"))(mixed)).toBe(true);
  });

  it("а на витрине это ровно строка «Mixed» — то, что печатают spec-table/JSON-LD/OG", () => {
    expect(mixed.tenure).toEqual(["Mixed"]);
    expect(mixed.tenure!.join(", ")).toBe("Mixed");
  });

  it("и она же уходит в строку кандидата для ранжирующего LLM", () => {
    expect(serializeCandidate(mixed)).toContain("Mixed");
  });

  it("контроль: реальный freehold-объект чипу Leasehold не отвечает", () => {
    const fh = o({ ...mixed, tenure: normalizeTenure(["Freehold (Thai)"]) });
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(fh)).toBe(false);
  });
});

// АТАКА 50 [HIGH, деньги]: секция «Доступно в лизинг» и сама карточка объекта
// расходятся | ОЖИДАЕТСЯ: если объект опубликован в лизинг-разделе, его
// страница объясняет лизхолд и считает лизхолд-расходы | ФАКТ: секция берёт
// `offersLeasehold` (true на «Mixed»), а КАЖДЫЙ per-object блок остался на
// прямом `tenure.includes("Leasehold")` (false на «Mixed»). Итог: объект
// напечатан под заголовком «Доступно в лизинг» / «Available now on leasehold»,
// а на его странице нет ни блока «строение на вас, земля в аренде», ни
// лизхолд-FAQ, ни бейджа срока — и «Что стоит купить» показывает ФРИХОЛДНУЮ
// пошлину за перенос права вместо регистрации аренды. Расхождение внесено
// откатом: до него normalizeTenure выдавал такому объекту токен Leasehold и
// все блоки включались.
// код: src/lib/filters/listings.ts:87-90 против
//      leasehold-explainer.tsx:67, buying-costs.tsx:24, object-faq.tsx:106,
//      object-card.tsx:207,132
describe("АТАКА 50 — объект из лизинг-раздела на своей странице лизхолдом не считается", () => {
  it("секция /leasehold его публикует", () => {
    expect(offersLeasehold(mixed)).toBe(true);
  });

  it("но гейт всех per-object лизхолд-блоков — прямой includes — его отсекает", () => {
    // Ровно то выражение, что стоит в leasehold-explainer.tsx:67,
    // object-faq.tsx:106 и object-card.tsx:207.
    expect(mixed.tenure?.includes("Leasehold")).toBe(false);
    // И то, что стоит в buying-costs.tsx:24 (лизхолдные расходы вместо фрихолдных).
    const isLeaseholdCosts =
      mixed.tenure?.includes("Leasehold") && !mixed.tenure?.includes("Freehold");
    expect(Boolean(isLeaseholdCosts)).toBe(false);
  });

  it("контроль: у явного лизхолда все те же гейты открыты", () => {
    const lh = o({ ...mixed, tenure: normalizeTenure(["Leasehold 30 years"]), leaseTermYears: 30 });
    expect(offersLeasehold(lh)).toBe(true);
    expect(lh.tenure?.includes("Leasehold")).toBe(true);
  });
});

// АТАКА 51 [MEDIUM, контент]: авто-описание молча теряет строку владения |
// ОЖИДАЕТСЯ: генератор либо печатает форму владения, либо честно говорит, что
// она не установлена | ФАКТ: `extract()` знает ровно два флага — freehold и
// leasehold, оба false на «Mixed», и строка `b.tenure(fh, lh)` схлопывается в
// пустую. В буллетах остаётся один тип документа: «Chanote», без единого слова
// о праве — и это текст, который уезжает и в EN, и в RU публикации.
// код: src/lib/generate/object-description.ts:117-118, 168, 313-316
describe("АТАКА 51 — генератор описания теряет владение у объекта с «Mixed»", () => {
  it("EN: в буллетах остаётся документ без формы владения", () => {
    const d = buildObjectDescription(mixed, "en");
    expect(d.bullets.some((b) => b.includes("Chanote"))).toBe(true);
    expect(d.bullets.some((b) => /freehold|leasehold|mixed/i.test(b))).toBe(false);
  });

  it("RU: то же самое", () => {
    const d = buildObjectDescription(mixed, "ru");
    expect(d.bullets.some((b) => /фрихолд|лизхолд|mixed/i.test(b))).toBe(false);
  });

  it("контроль: у явного лизхолда строка владения есть", () => {
    const lh = o({ ...mixed, tenure: normalizeTenure(["Leasehold 30 years"]) });
    expect(buildObjectDescription(lh, "en").bullets.some((b) => /Leasehold/.test(b))).toBe(true);
  });
});

// АТАКА 52 [MEDIUM, маркетинг]: генератор офферов и /admin/ads считают «Mixed»
// НЕ лизхолдом | ОЖИДАЕТСЯ: раз сайт публикует объект в лизинг-разделе и по
// ?tenure=Leasehold, реклама этого же объекта тоже может назвать лизинг |
// ФАКТ: `buildFacts` (и подпись `leasehold:` в списке /admin/ads) держатся на
// прямом includes → факт лизинга пустой, строка «Long-term registered lease
// available» / «Возможна долгосрочная регистрируемая аренда земли» из креатива
// пропадает, а в админском списке объект помечен как не-лизхолд. Трафик с
// объявления приземляется на страницу, которую сайт при этом считает
// лизинговой.
// код: src/lib/ads/creatives.ts:112-114, 165, 185; src/app/admin/ads/page.tsx:33
describe("АТАКА 52 — реклама не знает про лизинг там, где сайт его показывает", () => {
  it("buildFacts не выдаёт лизхолд-факт", () => {
    expect(buildFacts(mixed).tenure).toBe("");
  });

  it("значит, в тексте креатива строки про регистрируемую аренду нет", () => {
    const en = fallbackCreatives(mixed, "meta")
      .map((c) => `${c.headline} ${c.primary} ${c.description}`)
      .join(" ");
    expect(/registered lease/i.test(en)).toBe(false);
  });

  it("и подпись leasehold в списке /admin/ads:33 — false", () => {
    expect((mixed.tenure ?? []).includes("Leasehold")).toBe(false);
  });

  it("контроль: у явного лизхолда факт и строка появляются", () => {
    const lh = o({ ...mixed, tenure: normalizeTenure(["Leasehold 30 years"]) });
    expect(buildFacts(lh).tenure).not.toBe("");
    const en = fallbackCreatives(lh, "meta").map((c) => c.primary).join(" ");
    expect(/registered lease/i.test(en)).toBe(true);
  });
});

// АТАКА 53 [MEDIUM, подбор]: «Mixed» стал ДОПУСТИМЫМ КРИТЕРИЕМ покупателя |
// ОЖИДАЕТСЯ: словарь профиля описывает намерение покупателя (freehold /
// leasehold), а не качество данных в CRM | ФАКТ: `VALID_TENURES` движка
// подбора расширен до трёх значений, поэтому LLM-парсер (llm.ts:149 — сплит
// произвольной строки) может вернуть tenure:["Mixed"], а `sanitizeProfile` это
// пропустит. Дальше `profileToFilter` кладёт "Mixed" в `ListingsFilter`, и
// `makeFilterPredicate` жёстко сужает каталог до объектов с НЕустановленным
// правом: реальный фрихолд и реальный лизхолд отсеиваются. Тот же профиль
// невыразим ссылкой — парсер /listings знает только Freehold/Leasehold и
// молча выбрасывает "Mixed", так что выдача подбора и выдача по URL расходятся.
// код: src/lib/match/engine.ts:53, 84-85, 135 против
//      src/lib/filters/listings.ts:33,217 (VALID_TENURES фильтра)
describe("АТАКА 53 — «Mixed» как критерий покупателя сужает каталог до объектов без права", () => {
  const freehold = o({ ...mixed, id: 2, rwNumber: "RW-L0911", tenure: ["Freehold"] });
  const leasehold = o({ ...mixed, id: 3, rwNumber: "RW-L0912", tenure: ["Leasehold"] });

  it("sanitizeProfile принимает Mixed как намерение покупателя", () => {
    expect(sanitizeProfile({ tenure: ["Mixed"] }).tenure).toEqual(["Mixed"]);
  });

  it("и такой профиль отсекает и фрихолд, и лизхолд", () => {
    const pred = makeFilterPredicate(profileToFilter(sanitizeProfile({ tenure: ["Mixed"] })));
    expect(pred(mixed)).toBe(true);
    expect(pred(freehold)).toBe(false);
    expect(pred(leasehold)).toBe(false);
  });

  it("а ссылкой /listings?tenure=Mixed тот же профиль не выражается — параметр отброшен", () => {
    expect(sp("tenure=Mixed").tenure).toEqual([]);
    // без tenure-критерия по той же ссылке видны ВСЕ три объекта
    const pred = makeFilterPredicate(sp("tenure=Mixed"));
    expect([mixed, freehold, leasehold].filter(pred).map((x) => x.rwNumber)).toEqual([
      "RW-L0910",
      "RW-L0911",
      "RW-L0912",
    ]);
  });
});
