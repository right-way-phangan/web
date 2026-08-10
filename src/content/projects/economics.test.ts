import { describe, expect, it } from "vitest";
import { getProjectEconomics } from "./economics";

/**
 * The developer's table is published verbatim, so a typo in a single figure
 * would be shown to buyers as fact. These checks re-derive every line the way
 * the source page does — the same pass that caught the land-indexation and
 * permit-rate mismatches in ARQA's own page.
 */
describe("Verana economics (RW-P0018)", () => {
  const economics = getProjectEconomics("RW-P0018");

  it("is registered for the project", () => {
    expect(economics).toBeDefined();
    expect(economics!.formats.map((f) => f.id)).toEqual(["1BR", "2BR", "3BR"]);
  });

  it("keeps every P&L line internally consistent", () => {
    for (const f of economics!.formats) {
      expect(f.operatingProfit).toBe(f.grossRevenue - f.opex);
      // 25% of operating profit, rounded — but not by one consistent rule:
      // 1BR lands on 341,874.50 and the source rounds it down, while 2BR and
      // 3BR (…237.75 / …250.75) round up. Three data points cannot settle
      // half-to-even vs half-down, so allow the one-baht spread.
      expect(Math.abs(f.managementFee - f.operatingProfit * 0.25)).toBeLessThanOrEqual(1);
      expect(f.netOwnerIncome).toBe(f.operatingProfit - f.managementFee);
      expect(f.netMonthly).toBe(Math.round(f.netOwnerIncome / 12));
      expect(f.yieldPct).toBeCloseTo((f.netOwnerIncome / f.entryThb) * 100, 1);
      expect(f.paybackYears).toBeCloseTo(f.entryThb / f.netOwnerIncome, 1);
    }
  });

  // The 2BR and 3BR rates are the 1BR rate plus 35% and 50% — stated on the
  // source page and the only thing tying the three revenue lines together.
  it("derives 2BR and 3BR revenue from the 1BR base", () => {
    const [oneBr, twoBr, threeBr] = economics!.formats;
    expect(twoBr.grossRevenue).toBe(oneBr.grossRevenue * 1.35);
    expect(threeBr.grossRevenue).toBe(oneBr.grossRevenue * 1.5);
  });

  it("carries both languages for source and caveats", () => {
    expect(economics!.source.en).not.toHaveLength(0);
    expect(economics!.source.ru).not.toHaveLength(0);
    expect(economics!.caveats.length).toBeGreaterThan(0);
    for (const c of economics!.caveats) {
      expect(c.en).not.toHaveLength(0);
      expect(c.ru).not.toHaveLength(0);
      // EN copy is rendered verbatim, including into SEO meta — no Cyrillic.
      expect(c.en).not.toMatch(/[Ѐ-ӿ]/);
    }
    expect(economics!.source.en).not.toMatch(/[Ѐ-ӿ]/);
  });
});
