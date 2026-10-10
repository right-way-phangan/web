import { describe, expect, it } from "vitest";
import { developerTag, filterLeadsForPartner, leadInPartnerScope, partnerVisibleNotes } from "./lead-scope";

const leads = [
  { id: 1, tags: ["developer:arqa-development", "intent:price_pack"] },
  { id: 2, tags: ["developer:other-dev"] },
  { id: 3, tags: ["hot"] },
  { id: 4, tags: null },
  { id: 5 },
  { id: 6, tags: ["developer:arqa-development-evil", "xdeveloper:arqa-development"] },
];

describe("partner isolation", () => {
  it("returns only leads tagged with the partner's developer", () => {
    const got = filterLeadsForPartner(leads, "arqa-development");
    expect(got.map((l) => l.id)).toEqual([1]);
  });

  it("developer slug is normalised (case/space) but never matches by prefix", () => {
    expect(developerTag(" ARQA-Development ")).toBe("developer:arqa-development");
    expect(leadInPartnerScope(["developer:arqa-development"], " ARQA-Development ")).toBe(true);
    expect(leadInPartnerScope(["developer:arqa-development-evil"], "arqa-development")).toBe(false);
  });

  it("fails closed: no developer, empty developer, untagged lead → nothing", () => {
    expect(filterLeadsForPartner(leads, null)).toEqual([]);
    expect(filterLeadsForPartner(leads, "")).toEqual([]);
    expect(filterLeadsForPartner(leads, undefined)).toEqual([]);
    expect(leadInPartnerScope(undefined, "arqa-development")).toBe(false);
    expect(leadInPartnerScope([], "arqa-development")).toBe(false);
  });

  it("a partner never gets a lead without the tag, whatever the developer", () => {
    for (const dev of ["arqa-development", "other-dev", "zzz"]) {
      for (const l of filterLeadsForPartner(leads, dev)) {
        expect(l.tags).toContain(`developer:${dev}`);
      }
    }
  });
});

describe("partner note visibility", () => {
  const notes = [
    { id: 1, text: "Квалификация: goal=live", sharedWithPartner: false },
    { id: 2, text: "internal: commission 3%" },
    { id: 3, text: "shared", sharedWithPartner: true },
    { id: 4, text: "null flag", sharedWithPartner: null },
  ];

  it("partner never gets an internal note — only explicitly shared ones", () => {
    expect(partnerVisibleNotes(notes).map((n) => n.id)).toEqual([3]);
  });

  it("fails closed when the backend sends no flag at all", () => {
    expect(partnerVisibleNotes([{ id: 9, text: "old backend" }])).toEqual([]);
    expect(partnerVisibleNotes(undefined)).toEqual([]);
  });
});
