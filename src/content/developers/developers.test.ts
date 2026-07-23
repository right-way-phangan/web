import { describe, expect, it } from "vitest";
import { arqa } from "./arqa";
import { getDeveloperProfile, profileSlugs, resolveTimeline } from "./index";

describe("developer profiles registry", () => {
  it("resolves the ARQA profile by its catalog-derived slug", () => {
    // Slug is an invariant: developerSlug("ARQA Development") — the exact
    // `developer` field value on ARQA catalog objects.
    expect(arqa.slug).toBe("arqa-development");
    expect(getDeveloperProfile("arqa-development")).toBe(arqa);
    expect(profileSlugs()).toContain("arqa-development");
  });

  it("returns null for unknown slugs", () => {
    expect(getDeveloperProfile("no-such-developer")).toBeNull();
  });
});

describe("ARQA profile data integrity", () => {
  it("has six timeline entries with Verana linked to RW-P0018", () => {
    expect(arqa.timeline).toHaveLength(6);
    const verana = arqa.timeline.find((e) => e.title === "Verana Villas");
    expect(verana?.rwNumber).toBe("RW-P0018");
    expect(verana?.status).toBe("under-construction");
  });

  it("uses only valid RW-P numbers and statuses", () => {
    for (const entry of arqa.timeline) {
      if (entry.rwNumber) expect(entry.rwNumber).toMatch(/^RW-P\d{4}$/);
      if (entry.status)
        expect(["built", "under-construction", "planned"]).toContain(
          entry.status,
        );
    }
  });

  it("localizes every bilingual field in both languages", () => {
    expect(arqa.bio.en.length).toBeGreaterThan(0);
    expect(arqa.bio.ru.length).toBeGreaterThan(0);
    for (const fact of arqa.facts) {
      expect(fact.label.en && fact.label.ru).toBeTruthy();
      expect(fact.value.en && fact.value.ru).toBeTruthy();
    }
    for (const entry of arqa.timeline) {
      if (entry.description)
        expect(entry.description.en && entry.description.ru).toBeTruthy();
      if (entry.note) expect(entry.note.en && entry.note.ru).toBeTruthy();
    }
  });
});

describe("resolveTimeline", () => {
  const entries = [
    { title: "Built one", rwNumber: "RW-P0001" },
    { title: "No link" },
    { title: "Unpublished", rwNumber: "RW-P0002" },
  ];

  it("attaches hrefs from the map, preserving order", () => {
    const resolved = resolveTimeline(entries, {
      "RW-P0001": "/projects/built-one",
    });
    expect(resolved.map((e) => e.title)).toEqual([
      "Built one",
      "No link",
      "Unpublished",
    ]);
    expect(resolved[0].href).toBe("/projects/built-one");
    expect(resolved[1].href).toBeUndefined();
    // rwNumber present but not published → entry stays, just without a link.
    expect(resolved[2].href).toBeUndefined();
  });
});
