import { describe, it, expect } from "vitest";
import { estimate, type ValuationSubject, type CompPoint, type EngineData } from "./engine";
import { buildFactorMap } from "./factors";

/**
 * «RW Оценка» называет цену размещения объекта — с неё начинается разговор с
 * собственником и от неё считается комиссия. 1497 строк (три метода, 46
 * факторов, NPV лизхолда, прогноз аренды) не были покрыты ни одним тестом.
 *
 * Как и в тестах калькулятора, закрепляем не «золотые» суммы — они законно
 * меняются при подкрутке факторов, — а то, что обязано выполняться всегда:
 * согласованность выдачи (вилка содержит оценку, сделка ниже запроса, цена за
 * рай бьётся с итогом), направление влияния факторов и честный отказ там, где
 * данных не хватает.
 */

const factors = buildFactorMap();

/** Компс-участок в Sri Thanu: 1 рай за 10 млн, полный титул. */
function landComp(over: Partial<CompPoint> = {}): CompPoint {
  return {
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
  };
}

function data(comps: CompPoint[]): EngineData {
  return { comps, market: null, factors };
}

/** Однородный рынок: десять почти одинаковых участков по 10 млн за рай. */
const uniformLand = Array.from({ length: 10 }, (_, i) =>
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

describe("estimate — отказы вместо выдуманных цифр", () => {
  it("не берётся за тип, который не умеет оценивать", () => {
    const r = estimate({ ...plot, type: "Project" as ValuationSubject["type"] }, data(uniformLand));
    expect(r.ok).toBe(false);
    expect(r.reason).toBeTruthy();
    expect(r.listValue).toBeUndefined();
  });

  it("без компсов честно отказывается, а не считает по воздуху", () => {
    const r = estimate(plot, data([]));
    expect(r.ok).toBe(false);
    expect(r.listValue).toBeUndefined();
  });

  it("для участка без площади оценки не даёт", () => {
    const r = estimate({ ...plot, areaRai: undefined }, data(uniformLand));
    expect(r.ok).toBe(false);
  });
});

describe("estimate — согласованность выдачи", () => {
  it("на однородном рынке выходит к его уровню", () => {
    const r = estimate(plot, data(uniformLand));
    expect(r.ok).toBe(true);
    expect(r.listValue).toBeGreaterThan(0);
    // Рынок ровный, объект типовой — оценка обязана лечь рядом с 10 млн/рай.
    expect(r.listValue!).toBeGreaterThan(7_000_000);
    expect(r.listValue!).toBeLessThan(13_000_000);
  });

  it("вилка содержит саму оценку", () => {
    const r = estimate(plot, data(uniformLand));
    expect(r.low!).toBeLessThanOrEqual(r.listValue!);
    expect(r.high!).toBeGreaterThanOrEqual(r.listValue!);
    expect(r.low!).toBeGreaterThan(0);
  });

  it("ожидаемая сделка ниже цены размещения ровно на рыночный дисконт", () => {
    const r = estimate(plot, data(uniformLand));
    expect(r.fairValue!).toBeLessThan(r.listValue!);
    expect(r.fairValue!).toBeCloseTo(r.listValue! * factors["market.ask_discount"], 0);
  });

  it("цена за рай сходится с итогом и площадью", () => {
    const r = estimate({ ...plot, areaRai: 2 }, data(uniformLand));
    expect(r.perRai!).toBeCloseTo(r.listValue! / 2, 0);
  });

  it("уверенность всегда одна из трёх ступеней", () => {
    const r = estimate(plot, data(uniformLand));
    expect(["high", "medium", "low"]).toContain(r.confidence);
  });

  it("на одних и тех же данных отвечает одинаково", () => {
    const a = estimate(plot, data(uniformLand));
    const b = estimate(plot, data(uniformLand));
    expect(b.listValue).toBe(a.listValue);
    expect(b.confidence).toBe(a.confidence);
  });
});

describe("estimate — направление влияния факторов", () => {
  it("больший участок стоит дороже целиком", () => {
    const one = estimate({ ...plot, areaRai: 1 }, data(uniformLand));
    const three = estimate({ ...plot, areaRai: 3 }, data(uniformLand));
    expect(three.listValue!).toBeGreaterThan(one.listValue!);
  });

  it("вид на море и первая линия поднимают цену", () => {
    const plain = estimate(plot, data(uniformLand));
    const sea = estimate({ ...plot, seaView: true }, data(uniformLand));
    const beach = estimate({ ...plot, beachfront: true }, data(uniformLand));
    expect(sea.listValue!).toBeGreaterThan(plain.listValue!);
    expect(beach.listValue!).toBeGreaterThan(plain.listValue!);
  });

  it("слабый документ снижает цену относительно чанота", () => {
    const chanote = estimate({ ...plot, documentType: "Chanote" }, data(uniformLand));
    const ns3 = estimate({ ...plot, documentType: "Nor Sor 3" }, data(uniformLand));
    expect(ns3.listValue!).toBeLessThan(chanote.listValue!);
  });

  it("отсутствие дороги и электричества не делает участок дороже", () => {
    const serviced = estimate(plot, data(uniformLand));
    const raw = estimate(
      { ...plot, roadType: "None", electricity: false },
      data(uniformLand),
    );
    expect(raw.listValue!).toBeLessThanOrEqual(serviced.listValue!);
  });

  it("дорогой рынок двигает оценку вверх", () => {
    const cheap = estimate(plot, data(uniformLand));
    const pricey = estimate(
      plot,
      data(uniformLand.map((c) => ({ ...c, priceThb: 20_000_000, pricePerRai: 20_000_000 }))),
    );
    expect(pricey.listValue!).toBeGreaterThan(cheap.listValue!);
  });
});

describe("estimate — устойчивость к грязным данным", () => {
  it("компсы с пустой ценой не ломают расчёт", () => {
    const dirty = [
      ...uniformLand,
      landComp({ ref: "RW-L9001", priceThb: null, pricePerRai: null }),
      landComp({ ref: "RW-L9002", areaRai: null }),
    ];
    const r = estimate(plot, data(dirty));
    expect(r.ok).toBe(true);
    expect(Number.isFinite(r.listValue!)).toBe(true);
  });

  it("не выдаёт отрицательных или нечисловых значений", () => {
    const r = estimate({ ...plot, areaRai: 0.25 }, data(uniformLand));
    if (r.ok) {
      for (const v of [r.listValue!, r.fairValue!, r.low!, r.high!]) {
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThan(0);
      }
    }
  });

  it("каждый метод отчитывается о доступности и весе", () => {
    const r = estimate(plot, data(uniformLand));
    expect(r.methods.length).toBeGreaterThan(0);
    for (const m of r.methods) {
      expect(typeof m.available).toBe("boolean");
      expect(Number.isFinite(m.weight)).toBe(true);
      if (m.available && m.value) expect(m.value).toBeGreaterThan(0);
    }
  });
});
