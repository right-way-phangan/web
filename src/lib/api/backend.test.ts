// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * backendFetch: полный токен по умолчанию, узкий OBJECTS_API_TRACK_TOKEN для
 * beacon'ов (scope: "track"), фолбэк на полный, пока track-токен не выдан.
 */
const calls: Array<{ url: string; auth: string | null }> = [];

beforeEach(() => {
  calls.length = 0;
  vi.resetModules();
  vi.stubEnv("OBJECTS_API_URL", "https://backend.test");
  vi.stubEnv("OBJECTS_API_TOKEN", "full-secret");
  vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
    calls.push({ url, auth: new Headers(init.headers).get("authorization") });
    return Promise.resolve(new Response("{}"));
  });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("backendFetch — скоупы токенов", () => {
  it("обычный вызов несёт полный токен", async () => {
    const { backendFetch } = await import("./backend");
    await backendFetch("/objects");
    expect(calls[0]).toEqual({ url: "https://backend.test/objects", auth: "Bearer full-secret" });
  });

  it("scope: track → узкий токен, и он не попадает в init как поле", async () => {
    vi.stubEnv("OBJECTS_API_TRACK_TOKEN", "track-secret");
    const { backendFetch } = await import("./backend");
    await backendFetch("/track/view", { method: "POST", scope: "track" });
    expect(calls[0].auth).toBe("Bearer track-secret");
  });

  it("без track-токена в env beacon идёт с полным (аддитивный rollout)", async () => {
    const { backendFetch } = await import("./backend");
    await backendFetch("/ratelimit", { scope: "track" });
    expect(calls[0].auth).toBe("Bearer full-secret");
  });
});
