import { describe, expect, it } from "vitest";
import { seoTitle } from "./seo-title";

describe("seoTitle", () => {
  it("короткий заголовок не трогает", () => {
    expect(seoTitle("Ban Tai")).toBe("Ban Tai");
  });

  it("режет по границе слова и ставит многоточие", () => {
    const long =
      "Покупка недвижимости в Хад Юане и Хад Тиене: чем эти бухты отличаются от остального острова и что важно знать до сделки";
    const out = seoTitle(long);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
    expect(out).not.toMatch(/[:,—-]…$/);
  });

  it("ровно на границе — без многоточия", () => {
    const exact = "a".repeat(60);
    expect(seoTitle(exact)).toBe(exact);
  });

  it("одно длинное слово — жёсткий срез, не пустая строка", () => {
    const out = seoTitle("b".repeat(90), 40);
    expect(out.length).toBe(40);
    expect(out.endsWith("…")).toBe(true);
  });

  it("схлопывает лишние пробелы", () => {
    expect(seoTitle("  Two   words ")).toBe("Two words");
  });
});
