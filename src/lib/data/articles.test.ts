import { describe, it, expect } from "vitest";
import { blogLanguages, editorialNotes, mdToBlocks } from "./articles";

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

describe("blogLanguages", () => {
  // Без OBJECTS_API_URL тест офлайновый: работает только статика (EN+RU+TH).
  it("lists every language a static post exists in", async () => {
    const langs = await blogLanguages("buying-land-koh-phangan-checks-that-matter");
    expect(Object.keys(langs).sort()).toEqual(["en", "ru", "th", "x-default"]);
  });

  it("does not advertise a language the post lacks (was a hreflang to a TH 404)", async () => {
    const langs = await blogLanguages("no-such-post");
    expect(langs.th).toBeUndefined();
    expect(langs.ru).toBeUndefined();
  });
});
