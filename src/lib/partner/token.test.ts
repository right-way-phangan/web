// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from "vitest";

let token: typeof import("./token");

beforeAll(async () => {
  vi.stubEnv("AUTH_SECRET", "test-secret-for-partner-links");
  token = await import("./token");
});

describe("partner token", () => {
  it("подписывает и читает slug обратно", async () => {
    const t = await token.signPartnerToken("arqa");
    expect(await token.verifyPartnerToken(t)).toBe("arqa");
  });

  it("подделка и мусор не проходят", async () => {
    const t = await token.signPartnerToken("arqa");
    expect(await token.verifyPartnerToken(t.slice(0, -2) + "xx")).toBeNull();
    expect(await token.verifyPartnerToken("")).toBeNull();
    expect(await token.verifyPartnerToken(undefined)).toBeNull();
  });

  it("админская сессия на том же секрете — не партнёрская ссылка", async () => {
    vi.stubEnv("AUTH_SECRET", "test-secret-for-partner-links");
    const { signSession } = await import("@/lib/auth/session");
    const admin = await signSession({ id: 1, email: "a@b.c", role: "admin" });
    expect(await token.verifyPartnerToken(admin)).toBeNull();
  });
});
