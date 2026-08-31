import { describe, expect, it } from "vitest";
import { normalizeTenure } from "@/lib/utils/tenure";
import {
  makeFilterPredicate,
  matchesTenure,
  offersLeasehold,
  parseListingsSearchParams,
} from "@/lib/filters/listings";
import { sanitizeProfile, scoreObject } from "@/lib/match/engine";
import type { RealEstateObject, TenureType } from "@/types/object";

/**
 * RED-TEAM, РАУНД 2 — атака на фикс 66435c5 (`Mixed / N.A.` → обе формы).
 *
 * ИСПРАВЛЕНО 2026-08-31: раскрытие откачено. «Mixed / N.A.» в CRM означает
 * «форма владения НЕ установлена», поэтому токен остаётся одним — "Mixed", —
 * а попадание в выдачу обеспечивает ФИЛЬТР (`matchesTenure`/`offersLeasehold`),
 * а не подмена данных. Тесты ниже стерегут оба конца инварианта: витрина не
 * утверждает права, которого в CRM нет, и объект при этом ниоткуда не исчезает.
 */

const o = (p: Partial<RealEstateObject>): RealEstateObject => p as RealEstateObject;
const sp = (q: string) =>
  parseListingsSearchParams(Object.fromEntries(new URLSearchParams(q).entries()));

/** Объект ровно как он приходит из БД после apiObjects() (objects.ts:200). */
const mixed = o({
  id: 9001,
  rwNumber: "RW-L0910",
  type: "Land",
  titleEn: "Sea-view plot, Sri Thanu",
  priceThb: 12_000_000,
  tenure: normalizeTenure(["Mixed / N.A."]),
});

// АТАКА 24 [HIGH]: спецификация объекта и таблица сравнения печатают форму
// владения как `o.tenure.join(", ")` | ОЖИДАЕТСЯ: объект, у которого в CRM
// стоит "Mixed / N.A." (= форма владения НЕ УСТАНОВЛЕНА), не утверждает
// публично ничего о правах | БЫЛО: после раскрытия токена страница объекта
// утверждала «Tenure: Freehold, Leasehold» — два взаимоисключающих права как
// свершившийся факт на объекте, про который известно ровно ничего (против
// memory feedback_document_vs_tenure и DD-дисциплины) | ИСПРАВЛЕНО 2026-08-31:
// на витрину едет один нейтральный токен, ни одна форма владения не заявлена.
// код: src/components/objects/spec-table.tsx:73, src/components/objects/compare-table.tsx:117
describe("АТАКА 24 — спецификация не утверждает форму владения там, где в CRM «N.A.»", () => {
  it("строка спецификации не называет ни фрихолд, ни лизхолд", () => {
    // ровно выражение spec-table.tsx:73
    const specValue = mixed.tenure && mixed.tenure.length > 0 ? mixed.tenure.join(", ") : undefined;
    expect(specValue).toBe("Mixed");
    expect(specValue).not.toContain("Freehold");
    expect(specValue).not.toContain("Leasehold");
    // сырой лейбл БД («Mixed / N.A.») на витрину тоже не доезжает
    expect(specValue).not.toContain("N.A.");
  });

  it("compare-table на /saved печатает тот же единственный токен", () => {
    // ровно выражение compare-table.tsx:117
    expect(mixed.tenure?.join(", ") ?? "—").toBe("Mixed");
  });

  it("контроль: подтверждённый фрихолд по-прежнему называется фрихолдом", () => {
    expect(normalizeTenure(["Freehold (Thai)"])?.join(", ")).toBe("Freehold");
    expect(normalizeTenure(["Leasehold 30 years"])?.join(", ")).toBe("Leasehold");
  });
});

// АТАКА 25 [HIGH]: «Ключевые факты» лендинга проекта берут ПЕРВЫЙ токен
// (`p.tenure[0]`) | ОЖИДАЕТСЯ: при неизвестной форме владения шапка не
// объявляет право | БЫЛО: normalizeTenure клал "Freehold" первым, и шапка
// лендинга публично объявляла проект ФРИХОЛДОМ — ровно то, от чего компания
// ушла (memory project_freehold_toxic_leasehold_pivot) | ИСПРАВЛЕНО 2026-08-31:
// первый (и единственный) токен — "Mixed", слова «Freehold» в шапке нет.
// код: src/components/projects/spec-strip.tsx:15
describe("АТАКА 25 — spec-strip лендинга не объявляет «Freehold» на неизвестном праве", () => {
  const project = o({
    id: 9002,
    rwNumber: "RW-P0099",
    type: "Project",
    titleEn: "Some Villas",
    tenure: normalizeTenure(["Mixed / N.A."]),
  });

  it("normalizeTenure не раскрывает «Mixed» в формы владения", () => {
    expect(normalizeTenure(["Mixed / N.A."])).toEqual(["Mixed"]);
    expect(normalizeTenure(["mixed"])).toEqual(["Mixed"]);
  });

  it("строка «Ключевые факты» не называет фрихолд", () => {
    // ровно выражение spec-strip.tsx:15
    const chip = project.tenure?.[0];
    expect(chip).toBe("Mixed");
    expect(chip).not.toBe("Freehold");
  });

  it("в шапке ровно один токен — и он не утверждает ни одного права", () => {
    expect(project.tenure).toEqual(["Mixed"]);
    expect(project.tenure).not.toContain("Freehold");
    expect(project.tenure).not.toContain("Leasehold");
  });
});

// АТАКА 26 [MEDIUM]: одна и та же карточка каталога противоречила себе |
// ОЖИДАЕТСЯ: бейдж формы владения и модель ROI-ссылки берутся из одного
// признака | БЫЛО: бейдж рисовался по `includes("Leasehold")` (истина для
// раскрытого Mixed), а ROI-ссылка переключалась по
// `includes("Leasehold") && !includes("Freehold")` (ложь) — карточка подписана
// «Leasehold», а калькулятор за ней считал фрихолд | ИСПРАВЛЕНО 2026-08-31:
// оба выражения читают один токен "Mixed" и дают одинаковый ответ — карточка
// молчит о праве, и калькулятор за ней не переключается на лизхолд-модель.
// код: src/components/objects/object-card.tsx:207 против :132
//      src/components/projects/project-landing.tsx:395,412
describe("АТАКА 26 — бейдж и ROI-ссылка карточки больше не противоречат друг другу", () => {
  it("бейдж «Leasehold» на неустановленном праве не рисуется", () => {
    expect(mixed.tenure?.includes("Leasehold")).toBe(false);
  });

  it("и ROI-ссылка тоже не несёт tenure=leasehold — оба признака согласованы", () => {
    const leaseholdModel =
      mixed.tenure?.includes("Leasehold") && !mixed.tenure?.includes("Freehold");
    expect(leaseholdModel).toBe(false);

    const href =
      `/calculator?price=${mixed.priceThb}` +
      (leaseholdModel ? "&tenure=leasehold" : "") +
      (mixed.type === "Project" ? "&phase=offplan" : "");
    expect(href).toBe("/calculator?price=12000000");
    expect(href).not.toContain("tenure=leasehold");
  });

  it("контроль: настоящий лизхолд получает и бейдж, и лизхолд-модель калькулятора", () => {
    const lease = normalizeTenure(["Leasehold 30 years"])!;
    expect(lease.includes("Leasehold")).toBe(true);
    expect(lease.includes("Leasehold") && !lease.includes("Freehold")).toBe(true);
  });
});

// АТАКА 27 [MEDIUM, SEO/AEO]: блок FAQ страницы объекта | ОЖИДАЕТСЯ: лизхолд-
// вопросы добавляются лизхолд-объектам, у остальных остаётся полный типовой
// набор | БЫЛО: после раскрытия токена 52% каталога получали лизхолд-Q&A, и та
// же строка РЕЗАЛА типовой набор до двух вопросов — половина каталога молча
// теряла типовые вопросы из FAQPage JSON-LD (memory project_geo_aeo_strategy) |
// ИСПРАВЛЕНО 2026-08-31: объект с неустановленным правом лизхолд-ветку не
// включает и сохраняет все 4 типовых вопроса.
// код: src/components/objects/object-faq.tsx:106-107
describe("АТАКА 27 — FAQPage объекта с «N.A.» больше не усечён до 2 вопросов", () => {
  const picked = ["q-land-1", "q-land-2", "q-land-3", "q-land-4"];

  const buildItems = (tenure: TenureType[] | undefined) => {
    // ровно логика object-faq.tsx:106-107
    const lease = tenure?.includes("Leasehold") ? ["lease-q1", "lease-q2"] : [];
    const picks = lease.length ? picked.slice(0, 2) : picked;
    return [...lease, ...picks];
  };

  it("объект «Mixed / N.A.» сохраняет полный типовой набор", () => {
    const items = buildItems(mixed.tenure);
    expect(items).toEqual(picked);
    expect(items).toContain("q-land-3");
    expect(items).toContain("q-land-4");
  });

  // ХАРАКТЕРИЗУЮЩИЙ (не закрыто): у объекта с ПОДТВЕРЖДЁННЫМ лизхолдом типовой
  // набор по-прежнему режется до двух вопросов. Масштаб упал с половины
  // каталога до реальных лизхолдов, но сама срезка в object-faq.tsx осталась.
  it("ОСТАЁТСЯ: настоящему лизхолду типовой набор всё ещё режут до 2", () => {
    const items = buildItems(normalizeTenure(["Leasehold 30 years"]));
    expect(items).toEqual(["lease-q1", "lease-q2", "q-land-1", "q-land-2"]);
  });
});

// АТАКА 28 [MEDIUM]: RW Match | ОЖИДАЕТСЯ: критерий «форма владения» из профиля
// покупателя достижим для всех значений, которые движок принимает | БЫЛО:
// VALID_TENURES движка содержит "Mixed", а normalizeTenure этот токен
// раскрывал — критерий весом 1.5 стал мёртвым (ни один объект его не нёс) |
// ИСПРАВЛЕНО 2026-08-31: токен снова живёт в данных, профиль tenure=["Mixed"]
// достижим.
// код: src/lib/match/engine.ts:52 против src/lib/utils/tenure.ts:32
describe("АТАКА 28 — профиль подбора tenure=['Mixed'] снова достижим", () => {
  it("sanitizeProfile принимает «Mixed» как валидное пожелание", () => {
    expect(sanitizeProfile({ tenure: ["Mixed"] }).tenure).toEqual(["Mixed"]);
  });

  it("и объект с той же формой владения этот критерий ВЫПОЛНЯЕТ", () => {
    const p = sanitizeProfile({ tenure: ["Mixed"] });
    expect(scoreObject(p, mixed).met).toContain("tenure");
  });

  // ИСПРАВЛЕНО 2026-08-31: движок подбора зовёт тот же matchesTenure, что и
  // каталожный фильтр (engine.ts:244-249). Раньше он сравнивал множества
  // напрямую: выдача объект по чипу показывала, а подбор штрафовал его как
  // «форма владения не подходит» — две политики на одном токене.
  it("подбор и каталог согласованы на чипе Freehold/Leasehold", () => {
    expect(scoreObject(sanitizeProfile({ tenure: ["Freehold"] }), mixed).met).toContain("tenure");
    expect(scoreObject(sanitizeProfile({ tenure: ["Leasehold"] }), mixed).met).toContain("tenure");
    expect(matchesTenure(mixed, ["Freehold"])).toBe(true);
    expect(matchesTenure(mixed, ["Leasehold"])).toBe(true);
  });
});

// АТАКА 29 [MEDIUM, данные]: чип ?tenure=Freehold | ОЖИДАЕТСЯ: объект с
// неустановленным правом виден по обоим чипам (правило
// feedback_leasehold_everywhere), но в выдаче отличим от объекта с чанотом на
// руках | БЫЛО: совпадение обеспечивалось подменой данных — объекту дописывали
// токен "Freehold", и отличить его от подтверждённого фрихолда было нечем |
// ИСПРАВЛЕНО 2026-08-31: совпадение даёт matchesTenure, данные не тронуты.
// код: src/lib/filters/listings.ts:80-90, src/components/sections/leasehold-listings.tsx:38
describe("АТАКА 29 — ?tenure=Freehold показывает «N.A.», не выдавая его за фрихолд", () => {
  const realFreehold = o({
    id: 9003,
    rwNumber: "RW-L0911",
    type: "Land",
    priceThb: 9_000_000,
    tenure: normalizeTenure(["Freehold (Thai)"]),
  });

  it("объект «Mixed / N.A.» проходит и чип Freehold, и чип Leasehold", () => {
    expect(makeFilterPredicate(sp("tenure=Freehold"))(mixed)).toBe(true);
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(mixed)).toBe(true);
    expect(makeFilterPredicate(sp("tenure=Freehold"))(realFreehold)).toBe(true);
  });

  it("но в выдаче они различимы: данные объекта не подменены", () => {
    expect(mixed.tenure).toEqual(["Mixed"]);
    expect(mixed.tenure).not.toContain("Freehold");
    expect(realFreehold.tenure).toEqual(["Freehold"]);
  });

  it("и в инвентарь /leasehold он попадает — правило feedback_leasehold_everywhere", () => {
    // ровно предикат leasehold-listings.tsx:38
    expect(offersLeasehold(mixed)).toBe(true);
    expect(offersLeasehold(realFreehold)).toBe(false);
    expect(offersLeasehold(o({ tenure: normalizeTenure(["Leasehold 30 years"]) }))).toBe(true);
  });

  it("чип Leasehold при этом не тащит подтверждённый фрихолд", () => {
    expect(makeFilterPredicate(sp("tenure=Leasehold"))(realFreehold)).toBe(false);
  });
});
