import { describe, expect, it } from "vitest";
import { splitProjectTitle } from "./project-title";

describe("splitProjectTitle", () => {
  it("выносит формат в скобках в подзаголовок", () => {
    expect(splitProjectTitle("Verana Villas (1-3BR Pool Villas)")).toEqual({
      name: "Verana Villas",
      spec: "1-3BR Pool Villas",
    });
  });

  it("заголовок без скобок не меняется", () => {
    expect(splitProjectTitle("Hush Villas")).toEqual({ name: "Hush Villas" });
  });

  it("скобки в середине названия не трогает — только хвост", () => {
    expect(splitProjectTitle("Sands (phase 2) Haad Yao")).toEqual({ name: "Sands (phase 2) Haad Yao" });
  });

  it("пустые скобки — не формат", () => {
    expect(splitProjectTitle("Atmos ()")).toEqual({ name: "Atmos ()" });
  });
});
