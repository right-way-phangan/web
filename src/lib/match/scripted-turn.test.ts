import { describe, expect, it } from "vitest";
import { scriptedTurn } from "@/lib/match/llm";
import type { MatchMessage } from "@/types/match";

const DISTRICTS = ["Sri Thanu", "Ban Tai", "Chaloklum"];
const OPENING =
  "Hi! I'll help you find the right place on Koh Phangan. First — are you buying to live, to invest, to rent out, or for holidays?";

function turn(history: MatchMessage[]) {
  return scriptedTurn(history, {}, "en", DISTRICTS);
}

describe("scriptedTurn", () => {
  it("не переспрашивает то, что клиент уже сказал в первой реплике", () => {
    const r = turn([
      { role: "assistant", content: OPENING },
      {
        role: "user",
        content: "Investment, budget around 8 million baht, villa near Sri Thanu with sea view",
      },
    ]);
    expect(r.profile.goal).toBe("invest");
    expect(r.profile.budgetMaxMThb).toBe(8);
    expect(r.profile.type).toEqual(["Villa"]);
    expect(r.profile.districts).toEqual(["Sri Thanu"]);
    expect(r.reply).not.toContain("budget");
    expect(r.done).toBe(true);
  });

  it("спрашивает только незакрытые слоты", () => {
    const r = turn([
      { role: "assistant", content: OPENING },
      { role: "user", content: "I want to invest" },
    ]);
    expect(r.reply).toContain("budget");
    expect(r.done).toBe(false);
  });

  it("не повторяет уже заданный вопрос, даже если ответ не распознан", () => {
    const asked = scriptedTurn(
      [
        { role: "assistant", content: OPENING },
        { role: "user", content: "invest, 8m, villa" },
      ],
      {},
      "en",
      DISTRICTS,
    );
    expect(asked.reply).toContain("area");

    const next = scriptedTurn(
      [
        { role: "assistant", content: OPENING },
        { role: "user", content: "invest, 8m, villa" },
        { role: "assistant", content: asked.reply },
        { role: "user", content: "anywhere, no preference" },
      ],
      asked.profile,
      "en",
      DISTRICTS,
    );
    expect(next.reply).not.toBe(asked.reply);
  });

  it("не принимает площадь в м² за бюджет", () => {
    const r = turn([
      { role: "assistant", content: OPENING },
      { role: "user", content: "a house about 100 m² to live in" },
    ]);
    expect(r.profile.budgetMaxMThb).toBeUndefined();
    expect(r.reply).toContain("budget");
  });
});
