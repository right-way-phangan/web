import { describe, expect, it } from "vitest";
import {
  profileToFilter,
  scoreObject,
  shortlistCandidates,
  deterministicRank,
  serializeCandidate,
  formatReasons,
  sanitizeProfile,
  mergeProfile,
} from "./engine";
import type { BuyerProfile } from "@/types/match";
import type { RealEstateObject } from "@/types/object";

const o = (p: Partial<RealEstateObject>): RealEstateObject => p as RealEstateObject;

describe("profileToFilter", () => {
  it("maps budget (millions) to a THB price range and mustHaves to hard view flags", () => {
    const p: BuyerProfile = {
      budgetMinMThb: 5,
      budgetMaxMThb: 15,
      type: ["Villa"],
      districts: ["Sri Thanu"],
      mustHaves: ["seaView", "pool"],
    };
    const f = profileToFilter(p);
    expect(f.mode).toBe("buy");
    expect(f.priceMinThb).toBe(5_000_000);
    expect(f.priceMaxThb).toBe(15_000_000);
    expect(f.type).toEqual(["Villa"]);
    expect(f.district).toEqual(["Sri Thanu"]);
    // Only the three view features are hard filters; pool stays a soft signal.
    expect(f.seaView).toBe(true);
    expect(f.beachfront).toBe(false);
    expect(f.mountainView).toBe(false);
  });
});

describe("scoreObject", () => {
  const villa = o({
    rwNumber: "RW-V0001",
    type: "Villa",
    district: "Sri Thanu",
    priceThb: 12_000_000,
    seaView: true,
    pool: true,
    netYieldPct: 7,
  });

  it("gives 100% when every specified criterion is met", () => {
    const p: BuyerProfile = {
      budgetMaxMThb: 15,
      type: ["Villa"],
      districts: ["Sri Thanu"],
      mustHaves: ["seaView", "pool"],
      goal: "invest",
    };
    expect(scoreObject(p, villa).fitPct).toBe(100);
  });

  it("drops proportionally when one criterion misses", () => {
    const p: BuyerProfile = {
      budgetMaxMThb: 15,
      type: ["Villa"],
      districts: ["Ban Tai"], // villa is in Sri Thanu → district misses (weight 2 of 10)
      mustHaves: ["seaView", "pool"],
      goal: "invest",
    };
    expect(scoreObject(p, villa).fitPct).toBe(80);
  });

  it("counts a leasehold's lease total against the budget, not a missing priceThb", () => {
    const lease = o({
      rwNumber: "RW-L0002",
      type: "Land",
      rentPerMonth: 40_000,
      leaseTermYears: 30, // lease total = 40k × 12 × 30 = ฿14.4M
      tenure: ["Leasehold"],
    });
    expect(scoreObject({ budgetMaxMThb: 15 }, lease).met).toContain("budget");
    expect(scoreObject({ budgetMaxMThb: 10 }, lease).met).not.toContain("budget");
  });

  it("returns a neutral 60% for an empty profile", () => {
    expect(scoreObject({}, villa).fitPct).toBe(60);
  });
});

describe("shortlistCandidates", () => {
  const catalog: RealEstateObject[] = Array.from({ length: 8 }, (_, i) =>
    o({
      rwNumber: `RW-V${100 + i}`,
      type: "Villa",
      district: "Ban Tai",
      priceThb: 10_000_000,
    }),
  );

  it("relaxes the district first when the strict filter is too thin", () => {
    const p: BuyerProfile = { type: ["Villa"], districts: ["Sri Thanu"], budgetMaxMThb: 15 };
    const { candidates, relaxations } = shortlistCandidates(catalog, p);
    expect(candidates.length).toBe(8); // all Ban Tai villas surface after dropping district
    expect(relaxations).toContain("district");
    expect(relaxations).not.toContain("budget"); // stopped as soon as enough matched
  });

  it("caps the shortlist", () => {
    const many = Array.from({ length: 40 }, (_, i) =>
      o({ rwNumber: `RW-L${i}`, type: "Land", district: "Ban Tai", priceThb: 5_000_000 }),
    );
    const { candidates } = shortlistCandidates(many, { type: ["Land"] }, { cap: 30 });
    expect(candidates.length).toBe(30);
  });
});

describe("deterministicRank & formatReasons", () => {
  it("ranks by fit and localizes the reason", () => {
    const cands = [
      o({ rwNumber: "RW-V1", type: "Villa", district: "Sri Thanu", priceThb: 12_000_000, seaView: true }),
      o({ rwNumber: "RW-V2", type: "Villa", district: "Ban Tai", priceThb: 12_000_000 }),
    ];
    const p: BuyerProfile = { type: ["Villa"], districts: ["Sri Thanu"], mustHaves: ["seaView"], lang: "ru" };
    const ranked = deterministicRank(p, cands, "ru");
    expect(ranked[0].rw).toBe("RW-V1");
    expect(ranked[0].fitPct).toBeGreaterThan(ranked[1].fitPct);
    expect(ranked[0].reason).toContain("вид на море");
  });

  it("falls back to a generic phrase with no matched criteria", () => {
    expect(formatReasons([], "en")).toBe("close to your criteria");
    expect(formatReasons([], "ru")).toBe("близко к вашим критериям");
  });
});

describe("sanitizeProfile", () => {
  it("keeps valid fields, coerces numbers, drops unknown districts and features", () => {
    const p = sanitizeProfile(
      {
        goal: "invest",
        budgetMaxMThb: "15",
        type: ["Villa", "Spaceship"],
        districts: ["Sri Thanu", "Atlantis"],
        mustHaves: ["seaView", "helipad"],
        timeframe: "1-3m",
        junk: 123,
      },
      ["Sri Thanu", "Ban Tai"],
    );
    expect(p.goal).toBe("invest");
    expect(p.budgetMaxMThb).toBe(15);
    expect(p.type).toEqual(["Villa"]);
    expect(p.districts).toEqual(["Sri Thanu"]);
    expect(p.mustHaves).toEqual(["seaView"]);
    expect(p.timeframe).toBe("1-3m");
    expect(p).not.toHaveProperty("junk");
  });

  it("returns an empty profile for garbage input", () => {
    expect(sanitizeProfile(null)).toEqual({});
    expect(sanitizeProfile({ goal: "nonsense", budgetMaxMThb: -5 })).toEqual({});
  });
});

describe("mergeProfile", () => {
  it("unions arrays and prefers patch scalars", () => {
    const merged = mergeProfile(
      { type: ["Villa"], districts: ["Sri Thanu"], budgetMaxMThb: 10 },
      { type: ["Land"], districts: ["Ban Tai"], budgetMaxMThb: 15 },
    );
    expect(merged.type).toEqual(["Villa", "Land"]);
    expect(merged.districts).toEqual(["Sri Thanu", "Ban Tai"]);
    expect(merged.budgetMaxMThb).toBe(15);
  });
});

describe("serializeCandidate", () => {
  it("packs only real fields into one compact line", () => {
    const s = serializeCandidate(
      o({
        rwNumber: "RW-V0001",
        type: "Villa",
        district: "Sri Thanu",
        priceThb: 12_000_000,
        areaSqm: 200,
        bedrooms: 3,
        tenure: ["Leasehold"],
        seaView: true,
        pool: true,
        netYieldPct: 7,
      }),
    );
    expect(s).toContain("RW-V0001");
    expect(s).toContain("Villa");
    expect(s).toContain("Sri Thanu");
    expect(s).toContain("฿12.0M");
    expect(s).toContain("3bd");
    expect(s).toContain("Leasehold");
    expect(s).toContain("seaView");
    expect(s).toContain("yield 7%");
  });
});
