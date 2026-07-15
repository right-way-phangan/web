import { describe, expect, it } from "vitest";
import { leaseLine, leaseTotalThb, escalatedLeaseTotalThb } from "./lease-format";

describe("leaseTotalThb", () => {
  it("multiplies whole-plot monthly rent by the months in the term", () => {
    expect(leaseTotalThb(40_000, 30)).toBe(14_400_000);
    expect(leaseTotalThb(25_000, 10)).toBe(3_000_000);
  });
});

describe("escalatedLeaseTotalThb", () => {
  it("equals the flat total when no escalation terms are given", () => {
    expect(escalatedLeaseTotalThb(40_000, 30)).toBe(14_400_000);
    expect(escalatedLeaseTotalThb(40_000, 30, 0, 5)).toBe(14_400_000);
  });
  it("steps the rate up each escalation block", () => {
    // 10k/mo, 10y, +100% every 5y: 10k×12×5 + 20k×12×5 = 600k + 1.2M
    expect(escalatedLeaseTotalThb(10_000, 10, 100, 5)).toBe(1_800_000);
  });
  it("handles a partial final block", () => {
    // 10k/mo, 7y, +100% every 5y: 10k×12×5 + 20k×12×2 = 600k + 480k
    expect(escalatedLeaseTotalThb(10_000, 7, 100, 5)).toBe(1_080_000);
  });
});

describe("leaseLine", () => {
  it("EN: term + total, no escalation", () => {
    expect(leaseLine("en", 30, "฿14.4M", false)).toBe("30-year lease · ≈ ฿14.4M total");
  });
  it("EN: appends indexation when the lease escalates", () => {
    expect(leaseLine("en", 30, "฿14.4M", true)).toBe("30-year lease · ≈ ฿14.4M total + indexation");
  });
  it("EN: term only when the total is unknown (per-rai rent)", () => {
    expect(leaseLine("en", 30, undefined, false)).toBe("30-year lease");
    expect(leaseLine("en", 30, undefined, true)).toBe("30-year lease + indexation");
  });
  it("RU: term + total", () => {
    expect(leaseLine("ru", 30, "฿14.4M", false)).toBe("лизинг 30 лет · ≈ ฿14.4M всего");
  });
  it("RU: term only when the total is unknown", () => {
    expect(leaseLine("ru", 30, undefined, false)).toBe("лизинг 30 лет");
  });
});
