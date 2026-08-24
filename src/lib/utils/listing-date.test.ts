import { describe, it, expect } from "vitest";
import { parseListingDate } from "./listing-date";

const FALLBACK = new Date("2020-01-01T00:00:00Z");

describe("parseListingDate", () => {
  it("читает Unix-секунды строкой — тот самый формат из базы", () => {
    // Ровно этот случай ронял фид в «Invalid Date» и гасил бейдж New.
    expect(parseListingDate("1755018000", FALLBACK).toISOString()).toBe(
      new Date(1755018000 * 1000).toISOString(),
    );
  });

  it("читает ISO-дату", () => {
    expect(parseListingDate("2026-06-09T17:00:00Z", FALLBACK).toISOString()).toBe(
      "2026-06-09T17:00:00.000Z",
    );
  });

  it("на мусоре и пустом значении отдаёт fallback, а не Invalid Date", () => {
    for (const raw of ["", "не дата", undefined, "0", "-5"]) {
      const d = parseListingDate(raw, FALLBACK);
      expect(Number.isNaN(d.getTime())).toBe(false);
      expect(d.toISOString()).toBe(FALLBACK.toISOString());
    }
  });
});
