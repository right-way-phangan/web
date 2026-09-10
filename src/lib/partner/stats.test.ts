import { describe, expect, it } from "vitest";
import { buildPartnerRows, sumRows } from "./stats";
import type { RealEstateObject } from "@/types/object";
import type { CrmLead } from "@/lib/data/leads";

const project = (rw: string, title: string) => ({ rwNumber: rw, titleEn: title, status: "Active" }) as RealEstateObject;
const lead = (rw: string | null, createdAt: string) => ({ id: 1, name: "x", status: "new", rwNumber: rw, createdAt }) as CrmLead;
const NOW = Date.parse("2026-09-10T00:00:00Z");

describe("buildPartnerRows", () => {
  it("складывает юниты в проект и считает лиды за 30 дней и всего", () => {
    const rows = buildPartnerRows(
      [project("RW-P0001", "Atmos")],
      new Map([["RW-P0001", ["RW-P0001-A1", "RW-P0001-A2"]]]),
      new Map([
        ["RW-P0001", { rwNumber: "RW-P0001", d7: 3, d30: 10, total: 50, uniques30: 8 }],
        ["RW-P0001-A1", { rwNumber: "RW-P0001-A1", d7: 1, d30: 4, total: 9, uniques30: 3 }],
      ]),
      new Map([["RW-P0001-A2", { rwNumber: "RW-P0001-A2", save: 2, calc: 1, brochure: 0, share: 0, clicks: 5, score: 0 }]]),
      [lead("RW-P0001", "2026-09-01"), lead("RW-P0001-A1", "2026-06-01"), lead("RW-V0009", "2026-09-05"), lead(null, "2026-09-05")],
      (p) => p.titleEn.toLowerCase(),
      NOW,
    );
    expect(rows).toHaveLength(1);
    const r = rows[0];
    expect(r.slug).toBe("atmos");
    expect([r.views7, r.views30, r.uniques30]).toEqual([4, 14, 11]);
    expect([r.clicks30, r.calc30, r.save30]).toEqual([5, 1, 2]);
    expect([r.leads30, r.leadsTotal, r.lastLeadAt]).toEqual([1, 2, "2026-09-01"]);
  });

  it("проект без данных даёт нули, sumRows складывает строки", () => {
    const rows = buildPartnerRows([project("RW-P0002", "B"), project("RW-P0003", "C")], new Map(), new Map(), new Map(), [], () => "s", NOW);
    expect(rows.every((r) => r.views30 === 0 && r.leadsTotal === 0 && r.lastLeadAt === null)).toBe(true);
    const t = sumRows([{ ...rows[0], views30: 2, leads30: 1 }, { ...rows[1], views30: 3, leadsTotal: 4 }]);
    expect([t.views30, t.leads30, t.leadsTotal]).toEqual([5, 1, 4]);
  });
});
