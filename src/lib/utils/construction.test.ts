import { describe, expect, it } from "vitest";
import { updateDate, updateNote } from "./construction";

const u = {
  date: "July 2026",
  dateRu: "Июль 2026",
  dateTh: "กรกฎาคม 2569",
  note: "Roof",
  noteRu: "Кровля",
  noteTh: "มุงหลังคา",
  photos: [],
};

describe("construction updates — язык подписи", () => {
  it("берёт поле своего языка", () => {
    expect(updateDate(u, "th")).toBe("กรกฎาคม 2569");
    expect(updateNote(u, "th")).toBe("มุงหลังคา");
    expect(updateDate(u, "ru")).toBe("Июль 2026");
    expect(updateNote(u, "en")).toBe("Roof");
  });

  it("без перевода падает в EN", () => {
    const en = { date: "July 2026", note: "Roof", photos: [] };
    expect(updateDate(en, "th")).toBe("July 2026");
    expect(updateNote(en, "th")).toBe("Roof");
    expect(updateNote({ ...en, noteTh: "  " }, "th")).toBe("Roof");
    expect(updateNote({ date: "", photos: [] }, "th")).toBeUndefined();
  });
});
