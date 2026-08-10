import { describe, expect, it } from "vitest";
import { canRunAction } from "./require-admin";

describe("canRunAction", () => {
  it("permits agents only on staff actions", () => {
    expect(canRunAction("agent", "staff")).toBe(true);
    expect(canRunAction("agent", "admin")).toBe(false);
  });

  it("permits admins everywhere and rejects missing or unknown roles", () => {
    expect(canRunAction("admin", "staff")).toBe(true);
    expect(canRunAction("admin", "admin")).toBe(true);
    expect(canRunAction(null, "staff")).toBe(false);
    expect(canRunAction("viewer", "admin")).toBe(false);
  });
});
