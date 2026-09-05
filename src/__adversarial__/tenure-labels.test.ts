import { describe, expect, it } from "vitest";
import { getObjectDict } from "@/lib/i18n/dictionaries";
import { normalizeTenure } from "@/lib/utils/tenure";

/**
 * АТАКА 49 [HIGH]: «Mixed / N.A.» в CRM означает «форма владения НЕ установлена».
 * | ОЖИДАЛОСЬ: покупателю не показывают сырой служебный токен
 * | БЫЛО: spec-table печатала `o.tenure.join(", ")` — в строке «Вид владения»
 *   стояло «Mixed», что читается как утверждение о некой третьей форме владения
 * | ИСПРАВЛЕНО 2026-09-05: значения переводятся через словарь (EN+RU одновременно)
 * | код: src/components/objects/spec-table.tsx:73-80, dictionaries.ts tenureValues
 */
describe("АТАКА 49 — форма владения не печатается сырым токеном", () => {
  it("«Mixed / N.A.» нормализуется в служебный токен Mixed", () => {
    expect(normalizeTenure(["Mixed / N.A."])).toEqual(["Mixed"]);
  });

  it("но наружу он идёт человеческой подписью — в обеих локалях", () => {
    const en = getObjectDict("en").tenureValues;
    const ru = getObjectDict("ru").tenureValues;

    expect(en.Mixed).toBeTruthy();
    expect(ru.Mixed).toBeTruthy();
    // главное: подпись не равна служебному токену
    expect(en.Mixed).not.toBe("Mixed");
    expect(ru.Mixed).not.toBe("Mixed");
    // и не обещает конкретного права
    expect(`${en.Mixed} ${ru.Mixed}`).not.toMatch(/freehold|leasehold|фрихолд|лизхолд/i);
  });

  it("а подтверждённые формы называются прямо", () => {
    const en = getObjectDict("en").tenureValues;
    const ru = getObjectDict("ru").tenureValues;
    expect(en.Freehold).toBe("Freehold");
    expect(en.Leasehold).toBe("Leasehold");
    expect(ru.Freehold).toBe("Фрихолд");
    expect(ru.Leasehold).toBe("Лизхолд");
  });
});
