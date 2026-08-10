import { describe, it, expect } from "vitest";
import { BUILD_BANDS, POOL_LUMP, FEES_PCT, estimateBuildCost } from "./build-cost";

const mid = BUILD_BANDS.find((b) => b.key === "mid")!;

describe("estimateBuildCost", () => {
  it("умножает площадь на вилку бэнда", () => {
    const e = estimateBuildCost({ areaSqm: 100, band: mid, pool: false, fees: false });
    expect(e.low).toBe(100 * mid.low);
    expect(e.high).toBe(100 * mid.high);
    expect(e.openEnded).toBe(false);
  });

  it("добавляет бассейн лумпом, а не за м²", () => {
    const withPool = estimateBuildCost({ areaSqm: 100, band: mid, pool: true, fees: false });
    const without = estimateBuildCost({ areaSqm: 100, band: mid, pool: false, fees: false });
    expect(withPool.low - without.low).toBe(POOL_LUMP.low);
    expect(withPool.high - without.high).toBe(POOL_LUMP.high);
  });

  it("накидывает гонорары процентом сверху", () => {
    const e = estimateBuildCost({ areaSqm: 100, band: mid, pool: false, fees: true });
    expect(e.low).toBeCloseTo(100 * mid.low * (1 + FEES_PCT.low), 6);
    expect(e.high).toBeCloseTo(100 * mid.high * (1 + FEES_PCT.high), 6);
  });

  it("помечает премиум как открытый сверху", () => {
    const premium = BUILD_BANDS.find((b) => b.key === "premium")!;
    expect(estimateBuildCost({ areaSqm: 50, band: premium, pool: false, fees: false }).openEnded).toBe(true);
  });

  it("не уходит в минус на пустой площади", () => {
    const e = estimateBuildCost({ areaSqm: -10, band: mid, pool: false, fees: true });
    expect(e.low).toBe(0);
    expect(e.high).toBe(0);
  });

  it("бэнды не пересекаются и идут по возрастанию", () => {
    for (let i = 1; i < BUILD_BANDS.length; i++) {
      expect(BUILD_BANDS[i].low).toBeGreaterThanOrEqual(BUILD_BANDS[i - 1].high);
    }
  });
});
