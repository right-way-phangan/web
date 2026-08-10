import { existsSync } from "node:fs";
import { join } from "node:path";
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
  it("has five timeline entries with Verana linked to RW-P0018", () => {
    // Five projects, not six: «Verana Villas 2» is phase 2 of Verana itself,
    // confirmed by the developer 2026-08-06 — not a separate project.
    expect(arqa.timeline).toHaveLength(5);
    const verana = arqa.timeline.find((e) => e.title === "Verana Villas");
    expect(verana?.rwNumber).toBe("RW-P0018");
    expect(verana?.status).toBe("under-construction");
  });

  it("uses only valid RW numbers and statuses", () => {
    for (const entry of arqa.timeline) {
      if (entry.rwNumber) expect(entry.rwNumber).toMatch(/^RW-P\d{4}$/);
      // Objects (not projects) carry a plain RW-#### and link to /object/…
      if (entry.objectRw) expect(entry.objectRw).toMatch(/^RW-[A-Z]?\d{4}$/);
      if (entry.status)
        expect(["built", "under-construction", "planned"]).toContain(
          entry.status,
        );
    }
  });

  it("links Tree House to the object it is sold as", () => {
    // The developer's own delivered house, listed with us as RW-0625
    // (confirmed by Vladimir 2026-08-10) — the timeline card links to it.
    const tree = arqa.timeline.find((e) => e.title === "Tree House");
    expect(tree?.objectRw).toBe("RW-0625");
    expect(tree?.status).toBe("built");
    expect(tree?.rwNumber).toBeUndefined();
  });

  it("opens the timeline with Phangaia, the first project", () => {
    expect(arqa.timeline[0].title).toBe("Phangaia Garden Resort");
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

  it("points every photo at a file that exists under /public", () => {
    const gallery = (arqa.gallery ?? []).flatMap((set) => set.photos);
    const paths = [
      arqa.hero?.photo,
      ...arqa.timeline.map((e) => e.photo),
      ...gallery,
    ].filter((p): p is string => Boolean(p));
    expect(paths.length).toBeGreaterThan(0);
    for (const p of paths) {
      expect(existsSync(join(process.cwd(), "public", p))).toBe(true);
    }
    // The carousel loads the -sm.webp sibling; a missing one is a broken thumb.
    for (const p of gallery) {
      const thumb = p.replace(/\.jpe?g$/i, "-sm.webp");
      expect(existsSync(join(process.cwd(), "public", thumb))).toBe(true);
    }
  });

  it("keeps map pins inside the Phangan bbox and localizes their notes", () => {
    for (const loc of arqa.locations ?? []) {
      expect(loc.lat).toBeGreaterThan(9.6);
      expect(loc.lat).toBeLessThan(9.85);
      expect(loc.lng).toBeGreaterThan(99.9);
      expect(loc.lng).toBeLessThan(100.15);
      if (loc.note) expect(loc.note.en && loc.note.ru).toBeTruthy();
    }
  });
});

describe("resolveTimeline", () => {
  const entries = [
    { title: "Built one", rwNumber: "RW-P0001" },
    { title: "No link" },
    { title: "Unpublished", rwNumber: "RW-P0002" },
    { title: "Sold as an object", objectRw: "RW-0625" },
  ];

  it("attaches hrefs from the map, preserving order", () => {
    const resolved = resolveTimeline(entries, {
      "RW-P0001": "/projects/built-one",
      "RW-0625": "/object/RW-0625",
    });
    expect(resolved.map((e) => e.title)).toEqual([
      "Built one",
      "No link",
      "Unpublished",
      "Sold as an object",
    ]);
    expect(resolved[0].href).toBe("/projects/built-one");
    expect(resolved[1].href).toBeUndefined();
    // rwNumber present but not published → entry stays, just without a link.
    expect(resolved[2].href).toBeUndefined();
    // objectRw resolves through the same map, to the object page.
    expect(resolved[3].href).toBe("/object/RW-0625");
  });
});
