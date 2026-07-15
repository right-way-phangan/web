import { describe, expect, it } from "vitest";
import {
  isRental,
  isLongLeaseAcquisition,
  acquisitionValueThb,
  makeFilterPredicate,
  parseListingsSearchParams,
} from "./listings";
import type { RealEstateObject } from "@/types/object";

const o = (p: Partial<RealEstateObject>): RealEstateObject => p as RealEstateObject;

describe("isLongLeaseAcquisition", () => {
  it("a multi-year lease is an acquisition", () => {
    expect(isLongLeaseAcquisition(o({ leaseTermYears: 30 }))).toBe(true);
  });
  it("a short or absent term is not", () => {
    expect(isLongLeaseAcquisition(o({ leaseTermYears: 1 }))).toBe(false);
    expect(isLongLeaseAcquisition(o({}))).toBe(false);
  });
});

describe("isRental", () => {
  it("a 30-year leasehold priced by rent is NOT a rental (browses under Buy)", () => {
    expect(
      isRental(o({ rentPerMonth: 40_000, leaseTermYears: 30, tenure: ["Leasehold"] })),
    ).toBe(false);
  });
  it("a short monthly tenancy is a rental", () => {
    expect(isRental(o({ rentPerMonth: 25_000, leaseTermYears: 1 }))).toBe(true);
    expect(isRental(o({ rentPerRaiMonth: 5_000 }))).toBe(true);
  });
  it("a sale listing is not a rental", () => {
    expect(isRental(o({ priceThb: 5_000_000 }))).toBe(false);
  });
});

describe("acquisitionValueThb", () => {
  it("uses the sale price when present", () => {
    expect(acquisitionValueThb(o({ priceThb: 5_000_000 }))).toBe(5_000_000);
  });
  it("uses the lease total for a long leasehold priced by whole-plot rent", () => {
    expect(acquisitionValueThb(o({ rentPerMonth: 40_000, leaseTermYears: 30 }))).toBe(14_400_000);
  });
  it("scales a per-rai rent by plot area", () => {
    expect(
      acquisitionValueThb(o({ rentPerRaiMonth: 10_000, areaRai: 2, leaseTermYears: 30 })),
    ).toBe(7_200_000);
  });
  it("is undefined for a short rental", () => {
    expect(acquisitionValueThb(o({ rentPerMonth: 25_000, leaseTermYears: 1 }))).toBeUndefined();
  });
});

describe("makeFilterPredicate — Buy/Rent partition for long leaseholds", () => {
  const lease = o({
    rwNumber: "RW-L0073",
    type: "Land",
    rentPerMonth: 40_000,
    leaseTermYears: 30,
    tenure: ["Leasehold"],
  });

  it("a long leasehold shows in Buy and is hidden from Rent", () => {
    expect(makeFilterPredicate(parseListingsSearchParams({ mode: "buy" }))(lease)).toBe(true);
    expect(makeFilterPredicate(parseListingsSearchParams({ mode: "rent" }))(lease)).toBe(false);
  });

  it("the Buy price range matches a leasehold by its lease total (฿14.4M)", () => {
    const inRange = parseListingsSearchParams({ mode: "buy", pmin: "10", pmax: "20" });
    const above = parseListingsSearchParams({ mode: "buy", pmin: "20" });
    expect(makeFilterPredicate(inRange)(lease)).toBe(true);
    expect(makeFilterPredicate(above)(lease)).toBe(false);
  });
});
