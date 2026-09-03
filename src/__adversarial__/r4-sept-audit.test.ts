// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

/**
 * RED-TEAM, РАУНД 4 (аудит 2026-09-03). Закрывает находки, не покрытые
 * раундами 1–3: SSRF в публичном чекере зон, beacon'ы без Origin/throttle,
 * агент с правом каскадного удаления каталога, CSV всех лидов для агента,
 * /admin/api/* без собственного гейта, публичная форма без верхних границ.
 */

const SECRET = "adversarial-r4-secret";
const key = new TextEncoder().encode(SECRET);

let cookieValue: string | undefined;
let headerBag = new Headers();
const backendCalls: Array<{ path: string; init: RequestInit }> = [];

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) =>
        name === "rw_session" && cookieValue ? { value: cookieValue } : undefined,
    }),
  headers: () => Promise.resolve(headerBag),
}));

class RedirectSignal extends Error {}
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new RedirectSignal(`NEXT_REDIRECT:${to}`);
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

vi.mock("@/lib/api/backend", () => ({
  BACKEND_URL: "https://backend.test",
  backendFetch: vi.fn((path: string, init: RequestInit = {}) => {
    backendCalls.push({ path, init });
    const body = path === "/ratelimit" ? { allowed: true } : path === "/leads" ? [] : { ok: true };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  }),
}));

async function sessionFor(role: "admin" | "agent"): Promise<string> {
  return new SignJWT({ id: 7, email: "x@rightwaygroup.co", role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("rightway:web")
    .setAudience("rightway:admin")
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(key);
}

beforeEach(() => {
  backendCalls.length = 0;
  cookieValue = undefined;
  headerBag = new Headers({ "x-forwarded-for": "203.0.113.9" });
  vi.resetModules();
  vi.unstubAllGlobals();
  vi.stubEnv("AUTH_SECRET", SECRET);
  vi.stubEnv("OBJECTS_API_URL", "https://backend.test");
});

// АТАКА 60 [MEDIUM]: SSRF через публичный экшен lookupZoneRules | ОЖИДАЛОСЬ:
// expandShortLink ходит только по хостам Google (короткие ссылки карт) |
// БЫЛО: любой ^https?:// — лямбда сайта дёргала произвольный адрес до 5 хопов
describe("АТАКА 60 — SSRF в чекере зон", () => {
  it("allow-list: только goo.gl / google.* (с поддоменами), остальное — нет", async () => {
    const { isAllowedShortLinkUrl } = await import("@/lib/geo/short-link-hosts");
    expect(isAllowedShortLinkUrl("https://maps.app.goo.gl/AbC123")).toBe(true);
    expect(isAllowedShortLinkUrl("https://goo.gl/maps/xyz")).toBe(true);
    expect(isAllowedShortLinkUrl("https://www.google.com/maps/place/x")).toBe(true);
    expect(isAllowedShortLinkUrl("https://maps.google.co.th/?q=1,2")).toBe(true);
    expect(isAllowedShortLinkUrl("http://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(isAllowedShortLinkUrl("http://localhost:5432/")).toBe(false);
    expect(isAllowedShortLinkUrl("https://evil.com/goo.gl")).toBe(false);
    expect(isAllowedShortLinkUrl("https://goo.gl.evil.com/")).toBe(false);
    expect(isAllowedShortLinkUrl("ftp://goo.gl/x")).toBe(false);
  });

  it("публичный экшен не делает ни одного fetch на чужой хост", async () => {
    const fetchSpy = vi.fn(() => Promise.resolve(new Response("", { status: 200 })));
    vi.stubGlobal("fetch", fetchSpy);
    vi.doMock("@/lib/notify/telegram", () => ({ notifyZoneLookupError: vi.fn() }));
    const { lookupZoneRules } = await import("@/lib/actions/zone-rules-lookup");
    const res = await lookupZoneRules("http://10.0.0.1:8080/admin", "en");
    expect(res.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("экшен троттлится per-IP через backend /ratelimit", async () => {
    vi.doMock("@/lib/notify/telegram", () => ({ notifyZoneLookupError: vi.fn() }));
    const { lookupZoneRules } = await import("@/lib/actions/zone-rules-lookup");
    await lookupZoneRules("9.7, 100.0", "en");
    const rl = backendCalls.find((c) => c.path === "/ratelimit");
    expect(rl).toBeDefined();
    expect(String(rl!.init.body)).toContain("zone-rules:203.0.113.9");
  });
});

// АТАКА 61 [MEDIUM/LOW]: beacon'ы /api/track-event, /track-referral,
// /track-search без Origin и без throttle | ОЖИДАЛОСЬ: как track-view —
// same-origin + per-IP | БЫЛО: curl-цикл двигал engagement-индекс и GEO-KPI
describe("АТАКА 61 — beacon'ы без первой стороны", () => {
  const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    new Request(`https://rightwaygroup.co${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", host: "rightwaygroup.co", ...headers },
      body: JSON.stringify(body),
    });

  it("track-event: без Origin — 204, но в backend ничего не уходит", async () => {
    const { POST } = await import("@/app/api/track-event/route");
    const res = await POST(post("/api/track-event", { kind: "wa_click", rw: "RW-L0001" }));
    expect(res.status).toBe(204);
    expect(backendCalls.filter((c) => c.path === "/track/event")).toHaveLength(0);
  });

  it("track-event: свой Origin — событие уходит, throttle-ключ per-IP", async () => {
    const { POST } = await import("@/app/api/track-event/route");
    await POST(post("/api/track-event", { kind: "wa_click", rw: "RW-L0001" }, { origin: "https://rightwaygroup.co" }));
    expect(backendCalls.filter((c) => c.path === "/track/event")).toHaveLength(1);
    expect(backendCalls.some((c) => c.path === "/ratelimit" && String(c.init.body).includes("track-event:"))).toBe(true);
  });

  it("track-referral: чужой Origin — ничего не уходит", async () => {
    const { POST } = await import("@/app/api/track-referral/route");
    await POST(post("/api/track-referral", { source: "ai:chatgpt" }, { origin: "https://evil.example" }));
    expect(backendCalls.filter((c) => c.path === "/track/referral")).toHaveLength(0);
  });

  it("track-search: без Origin — спрос не пишется", async () => {
    const { POST } = await import("@/app/api/track-search/route");
    await POST(post("/api/track-search", { types: ["Land"], districts: ["Haad Yao"] }));
    expect(backendCalls.filter((c) => c.path === "/track/search")).toHaveLength(0);
  });
});

// АТАКА 62 [MEDIUM]: роль agent каскадно удаляет объекты | ОЖИДАЛОСЬ: как
// bulkDeleteLeads — только admin | БЫЛО: requireStaff → агент сносит каталог
describe("АТАКА 62 — агент и bulkDeleteObjects", () => {
  it("агент: редирект, ни одного DELETE /objects", async () => {
    cookieValue = await sessionFor("agent");
    const { bulkDeleteObjects } = await import("@/lib/actions/bulk-objects");
    await expect(bulkDeleteObjects(["RW-L0001", "RW-L0002"])).rejects.toBeInstanceOf(RedirectSignal);
    expect(backendCalls.filter((c) => c.init.method === "DELETE")).toHaveLength(0);
  });

  it("контроль: admin удаляет", async () => {
    cookieValue = await sessionFor("admin");
    const { bulkDeleteObjects } = await import("@/lib/actions/bulk-objects");
    const res = await bulkDeleteObjects(["RW-L0001"]);
    expect(res.ok).toBe(true);
    expect(backendCalls.filter((c) => c.init.method === "DELETE")).toHaveLength(1);
  });
});

// АТАКА 63 [LOW]: /admin/crm/export — CSV всех лидов доступен роли agent
// (AGENT_PATHS покрывает /admin/crm/*) | ОЖИДАЛОСЬ: только admin
describe("АТАКА 63 — экспорт лидов", () => {
  it("агент → 403, лиды не читаются", async () => {
    cookieValue = await sessionFor("agent");
    const { GET } = await import("@/app/admin/crm/export/route");
    const res = await GET();
    expect(res.status).toBe(403);
    expect(backendCalls.filter((c) => c.path.startsWith("/leads"))).toHaveLength(0);
  });

  it("аноним → 403", async () => {
    const { GET } = await import("@/app/admin/crm/export/route");
    expect((await GET()).status).toBe(403);
  });

  it("контроль: admin получает CSV", async () => {
    cookieValue = await sessionFor("admin");
    const { GET } = await import("@/app/admin/crm/export/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
  });
});

// АТАКА 64 [LOW]: /admin/api/* держались только на matcher middleware |
// ОЖИДАЛОСЬ: свой гейт в каждом route handler (защита в глубину)
describe("АТАКА 64 — /admin/api без собственного гейта", () => {
  const json = (url: string, body: unknown) =>
    new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

  it("purge фото анонимом → 403, backend не вызывается", async () => {
    const { POST } = await import("@/app/admin/api/photo-audit/purge/route");
    const res = await POST(json("https://rightwaygroup.co/admin/api/photo-audit/purge", { urls: ["https://x/y.jpg"] }));
    expect(res.status).toBe(403);
    expect(backendCalls.filter((c) => c.path === "/photos/purge")).toHaveLength(0);
  });

  it("purge фото агентом → 403 (admin-only)", async () => {
    cookieValue = await sessionFor("agent");
    const { POST } = await import("@/app/admin/api/photo-audit/purge/route");
    const res = await POST(json("https://rightwaygroup.co/admin/api/photo-audit/purge", { urls: ["https://x/y.jpg"] }));
    expect(res.status).toBe(403);
  });

  it("поиск по лидам/объектам анонимом → 403", async () => {
    const { GET } = await import("@/app/admin/api/search/route");
    const res = await GET(new Request("https://rightwaygroup.co/admin/api/search?q=vladimir"));
    expect(res.status).toBe(403);
    expect(backendCalls).toHaveLength(0);
  });

  it("parcel-trace анонимом → 403", async () => {
    const { POST } = await import("@/app/admin/api/parcel-trace/route");
    const res = await POST(json("https://rightwaygroup.co/admin/api/parcel-trace", { lat: 9.7, lng: 100 }));
    expect(res.status).toBe(403);
  });
});

// АТАКА 65 [LOW]: публичная форма без верхних границ — 4 МБ тело уходило в
// CRM-строку и рвало Telegram-алерт | ОЖИДАЛОСЬ: .max() на полях
describe("АТАКА 65 — публичная форма без .max()", () => {
  it("сообщение в 5 000 символов отбивается схемой, лид не создаётся", async () => {
    vi.doMock("@/lib/amocrm/env", () => ({ amoEnv: { AMOCRM_PIPELINE_LAND: 1, AMOCRM_PIPELINE_VILLA_HOUSE: 2 } }));
    vi.doMock("@/lib/notify/telegram", () => ({ notifyLeadCreated: vi.fn() }));
    const { submitInquiry } = await import("@/lib/actions/inquiry");
    const fd = new FormData();
    fd.set("name", "Buyer");
    fd.set("email", "b@example.com");
    fd.set("message", "x".repeat(5000));
    fd.set("source", "contact");
    const state = await submitInquiry({ status: "idle" }, fd);
    expect(state.status).toBe("error");
    if (state.status === "error") expect(state.fieldErrors?.message?.[0]).toMatch(/4000/);
    expect(backendCalls.filter((c) => c.path === "/leads")).toHaveLength(0);
  });
});

// АТАКА 66 [LOW]: подпись публичных ссылок сравнивалась через === |
// ОЖИДАЛОСЬ: константное сравнение + отказ на токене другой длины
describe("АТАКА 66 — токены публичных ссылок", () => {
  it("shortlist: валидный токен принимается, подделка и нулевой паддинг — нет", async () => {
    const { makeShortlistToken, verifyShortlistToken } = await import("@/lib/shortlist-token");
    const tok = makeShortlistToken(42);
    expect(verifyShortlistToken(tok)).toBe(42);
    expect(verifyShortlistToken(`0${tok}`)).toBeNull();
    expect(verifyShortlistToken(tok.slice(0, -1) + (tok.endsWith("A") ? "B" : "A"))).toBeNull();
  });

  it("match: то же", async () => {
    const { makeMatchToken, verifyMatchToken } = await import("@/lib/match/match-token");
    const tok = makeMatchToken(9);
    expect(verifyMatchToken(tok)).toBe(9);
    expect(verifyMatchToken(`00${tok}`)).toBeNull();
  });
});
