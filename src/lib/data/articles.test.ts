import { describe, it, expect } from "vitest";
import { editorialNotes, mdToBlocks } from "./articles";

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

describe("editorialNotes", () => {
  it("collects the comments the review page has to show", () => {
    expect(editorialNotes("<!-- ЧЕРНОВИК — до юриста -->\n\nТекст.")).toEqual([
      "ЧЕРНОВИК — до юриста",
    ]);
    expect(editorialNotes("Текст без пометок.")).toEqual([]);
  });
});
