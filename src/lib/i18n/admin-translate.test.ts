import { describe, expect, it } from "vitest";
import { translateUi } from "./admin-translate";

describe("translateUi", () => {
  it("translates dictionary phrases, keeps surrounding whitespace", () => {
    expect(translateUi("  Сохранить ", "en")).toBe("  Save ");
    expect(translateUi("Сохранить", "th")).toBe("บันทึก");
  });
  it("keeps emoji and punctuation around a known phrase", () => {
    expect(translateUi("Статус:", "en")).toBe("Status:");
    expect(translateUi("📞 Позвонить", "th")).toBe("📞 โทร");
  });
  it("leaves admin (ru), user data and non-Cyrillic untouched", () => {
    expect(translateUi("Сохранить", "ru")).toBe("Сохранить");
    expect(translateUi("Иван Петров", "en")).toBe("Иван Петров");
    expect(translateUi("RW-0541", "th")).toBe("RW-0541");
  });
});
