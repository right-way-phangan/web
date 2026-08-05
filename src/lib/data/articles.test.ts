import { describe, it, expect } from "vitest";
import { mdToBlocks } from "./articles";

describe("mdToBlocks", () => {
  it("drops HTML comments instead of rendering them as paragraphs", () => {
    const md = [
      "<!-- ЧЕРНОВИК — не публиковать до валидации юристом. -->",
      "",
      "Первый абзац.",
      "",
      "<!-- multi",
      "line note -->",
      "",
      "## Заголовок",
    ].join("\n");

    expect(mdToBlocks(md)).toEqual(["Первый абзац.", { h: "Заголовок" }]);
  });
});
