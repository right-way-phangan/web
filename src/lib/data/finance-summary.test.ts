import { describe, expect, it } from "vitest";
import { apiFinanceSummary, opexActiveMonthly, monthlyBalance, type LedgerEntry } from "./finance";

const entry = (date: string, thb: number, kind: LedgerEntry["kind"] = "OpEx"): LedgerEntry => ({
  date, item: "x", amountOrig: thb, currency: "THB", thb, account: "личная", kind, receipt: false,
});

describe("apiFinanceSummary", () => {
  it("месяц по Бангкоку, факт месяца из ledger без доходов", () => {
    // 2026-09-30 20:00 UTC = 2026-10-01 03:00 в Бангкоке
    const r = apiFinanceSummary(undefined, [
      entry("2026-10-01", 1000), entry("2026-10-05", 500), entry("2026-10-06", 9000, "income"),
      entry("2026-09-28", 777),
    ], new Date("2026-09-30T20:00:00Z"));
    expect(r.month).toBe("2026-10");
    expect(r.spentMonth).toBe(1500);
    expect(r.currency).toBe("THB");
  });

  it("нет данных за месяц → spentMonth 0; план и баланс — как у дашборда", () => {
    const r = apiFinanceSummary(undefined, [], new Date("2026-10-13T00:00:00Z"));
    expect(r.spentMonth).toBe(0);
    expect(r.opexMonthly).toBe(Math.round(opexActiveMonthly()));
    expect(r.monthlyBalance).toBe(Math.round(monthlyBalance()));
    expect(r.updatedAt).toBe("2026-10-13T00:00:00.000Z");
  });
});
