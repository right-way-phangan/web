import { describe, expect, it } from "vitest";
import { buildFacts, buildLandingUrl, fallbackCreatives, LIMITS } from "./creatives";
import { creativesToCsv } from "./csv";
import type { RealEstateObject } from "@/types/object";

function obj(patch: Partial<RealEstateObject> = {}): RealEstateObject {
  return {
    id: 1,
    rwNumber: "RW-L0074",
    titleEn: "Sea-view land in Sri Thanu",
    type: "Land",
    status: "Active",
    district: "Sri Thanu",
    areaRai: 2,
    seaView: true,
    beachfront: false,
    mountainView: false,
    jungleView: false,
    flatLand: true,
    quiet: true,
    electricity: true,
    photos: [],
    ...patch,
  } as RealEstateObject;
}

describe("buildFacts", () => {
  it("сводит объект к фактам без цены", () => {
    const f = buildFacts(obj({ priceThb: 12_000_000, pricePerRai: 6_000_000 }));
    expect(JSON.stringify(f)).not.toMatch(/12000000|6000000/);
    expect(f.district).toBe("Sri Thanu");
    expect(f.area).toBe("2 rai");
  });

  it("beachfront вытесняет sea view — иначе дублируем одно и то же", () => {
    expect(buildFacts(obj({ beachfront: true })).features).toContain("beachfront");
    expect(buildFacts(obj({ beachfront: true })).features).not.toContain("sea view");
  });

  it("отмечает leasehold, когда он есть среди вариантов владения", () => {
    expect(buildFacts(obj({ tenure: ["Freehold", "Leasehold"] })).tenure).toMatch(/lease/i);
    expect(buildFacts(obj({ tenure: ["Freehold"] })).tenure).toBe("");
  });
});

describe("fallbackCreatives", () => {
  it("отдаёт пару EN+RU — правило двуязычия действует и без LLM", () => {
    const langs = fallbackCreatives(obj(), "meta").map((v) => v.lang);
    expect(langs).toEqual(["en", "ru"]);
  });

  it("укладывается в лимиты канала", () => {
    for (const channel of ["meta", "google"] as const) {
      for (const v of fallbackCreatives(obj({ district: "Ban Tai Beach Area" }), channel)) {
        expect(v.headline.length).toBeLessThanOrEqual(LIMITS[channel].headline);
        expect(v.primary.length).toBeLessThanOrEqual(LIMITS[channel].primary);
        expect(v.description.length).toBeLessThanOrEqual(LIMITS[channel].description);
      }
    }
  });

  it("не упоминает цену", () => {
    const text = fallbackCreatives(obj({ priceThb: 12_000_000 }), "meta")
      .map((v) => `${v.headline} ${v.primary} ${v.description}`)
      .join(" ");
    expect(text).not.toMatch(/฿|THB|บาท|млн/i);
  });

  it("про leasehold говорит как о регистрируемой аренде, а не о владении землёй", () => {
    const [en, ru] = fallbackCreatives(obj({ tenure: ["Leasehold"] }), "meta");
    expect(en.primary).toMatch(/registered lease/i);
    expect(ru.primary).toMatch(/регистрируемая аренда/i);
    expect(en.primary).not.toMatch(/own the land/i);
  });
});

describe("buildLandingUrl", () => {
  it("ведёт на карточку объекта и несёт RW в utm_content", () => {
    const url = new URL(buildLandingUrl(obj(), "meta"));
    expect(url.pathname).toBe("/object/RW-L0074");
    expect(url.searchParams.get("utm_content")).toBe("RW-L0074");
    expect(url.searchParams.get("utm_source")).toBe("facebook");
  });

  it("для проекта берёт переданный слаг лендинга", () => {
    const url = new URL(
      buildLandingUrl(obj({ rwNumber: "RW-P0019", type: "Project" }), "google", {
        projectSlug: "the-sands-haad-yao-beach",
      }),
    );
    expect(url.pathname).toBe("/projects/the-sands-haad-yao-beach");
    expect(url.searchParams.get("utm_source")).toBe("google");
  });
});

describe("creativesToCsv", () => {
  it("экранирует кавычки и запятые, чтобы импорт Meta не поехал", () => {
    const csv = creativesToCsv([
      {
        rwNumber: "RW-L0074",
        channel: "meta",
        landingUrl: "https://rightwaygroup.co/object/RW-L0074",
        fromLlm: false,
        variants: [
          { lang: "en", headline: 'Land, "prime"', primary: "A, B", description: "C" },
        ],
      },
    ]);
    expect(csv).toContain('"Land, ""prime"""');
    expect(csv.split("\r\n")[0]).toContain("Headline");
  });
});
