import { describe, expect, it } from "vitest";
import { leaseLine, leaseTotalThb } from "./lease-format";

describe("leaseTotalThb", () => {
  it("multiplies whole-plot monthly rent by the months in the term", () => {
    expect(leaseTotalThb(40_000, 30)).toBe(14_400_000);
    expect(leaseTotalThb(25_000, 10)).toBe(3_000_000);
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
