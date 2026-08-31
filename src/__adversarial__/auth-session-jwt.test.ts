// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

/**
 * Red-team: кук-сессия (jose HS256) и per-IP throttle логина.
 */

const SECRET = "adversarial-test-secret";
const key = new TextEncoder().encode(SECRET);

let headerBag = new Headers();
const backendCalls: Array<{ path: string; init: RequestInit }> = [];

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => undefined }),
  headers: () => Promise.resolve(headerBag),
}));

vi.mock("@/lib/api/backend", () => ({
  BACKEND_URL: "https://backend.test",
  backendFetch: vi.fn((path: string, init: RequestInit = {}) => {
    backendCalls.push({ path, init });
    return Promise.resolve(
      new Response(JSON.stringify({ allowed: true }), { status: 200 }),
    );
  }),
}));

beforeEach(() => {
  backendCalls.length = 0;
  headerBag = new Headers();
  vi.resetModules();
  vi.stubEnv("AUTH_SECRET", SECRET);
  vi.stubEnv("OBJECTS_API_URL", "https://backend.test");
});

describe("АТАКА 3 [MEDIUM]: сессия неотзываема 90 дней", () => {
  // АТАКА 3 [MEDIUM]: у уволенного/пониженного сотрудника остаётся выданная кука
  // | ОЖИДАЕТСЯ: сервер сверяет сессию с актуальной ролью/статусом пользователя
  // (jti + чёрный список, либо version/tokenVersion в payload)
  // | ФАКТ: verifySession() имеет ровно два входа — токен и секрет; роль берётся
  // из payload и живёт SESSION_DAYS = 90 дней. Ни logout другого устройства, ни
  // смена пароля, ни удаление юзера, ни понижение admin→agent сессию не гасят
  // | код: web/src/lib/auth/session.ts:11,32-44
  it("токен с ролью admin остаётся admin — механизма отзыва нет", async () => {
    const { signSession, verifySession, SESSION_DAYS } = await import(
      "@/lib/auth/session"
    );

    const token = await signSession({
      id: 7,
      email: "fired@example.com",
      role: "admin",
    });

    // «Пользователь уволен / понижен» — тут нечего вызвать: API отзыва не существует.
    const session = await verifySession(token);
    expect(session).toMatchObject({ id: 7, role: "admin" });

    const exp = JSON.parse(atob(token.split(".")[1])).exp as number;
    const days = (exp - Math.floor(Date.now() / 1000)) / 86400;
    expect(Math.round(days)).toBe(SESSION_DAYS);
    expect(SESSION_DAYS).toBe(90);
  });

  // АТАКА 3b [LOW]: токен, выпущенный другой системой на том же AUTH_SECRET
  // | ОЖИДАЕТСЯ: jwtVerify с { issuer, audience, algorithms: ["HS256"] } —
  // сессия сайта принимается только своя | ФАКТ: jwtVerify(token, key) без
  // ограничений: любой HS-токен на том же секрете с claim role:"admin"
  // становится админ-сессией сайта | код: web/src/lib/auth/session.ts:35
  it("принимает чужой токен на том же секрете (нет проверки iss/aud)", async () => {
    const { verifySession } = await import("@/lib/auth/session");

    const foreign = await new SignJWT({
      id: 1,
      email: "svc@other",
      role: "admin",
      scope: "unrelated-service",
    })
      .setProtectedHeader({ alg: "HS512" }) // алгоритм тоже не зафиксирован
      .setIssuer("https://some-other-system")
      .setAudience("not-rightwaygroup")
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(key);

    expect(await verifySession(foreign)).toMatchObject({ role: "admin" });
  });

  // АТАКА 3c [LOW]: токен вообще без claim `role`
  // | ОЖИДАЕТСЯ: null (структура сессии не подтверждена) | ФАКТ: String(undefined)
  // → роль "undefined", сессия считается валидной; спасает только то, что
  // canAccessAdminPath отдаёт false на неизвестную роль — fail-closed держится
  // на одной строке в другом файле | код: web/src/lib/auth/session.ts:36-41
  it("считает валидной сессию без claim role (роль становится строкой \"undefined\")", async () => {
    const { verifySession } = await import("@/lib/auth/session");
    const { canAccessAdminPath } = await import("@/lib/auth/roles");

    const bare = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(key);

    const session = await verifySession(bare);
    expect(session).not.toBeNull();
    expect(session!.role).toBe("undefined");
    expect(Number.isNaN(session!.id)).toBe(true);
    // Единственное, что спасает:
    expect(canAccessAdminPath(session!.role, "/admin/finance")).toBe(false);
  });
});

describe("АТАКА 4 [LOW]: throttle логина ключуется на клиентском заголовке", () => {
  // АТАКА 4 [LOW]: атакующий шлёт свой X-Forwarded-For и меняет его на каждой
  // попытке | ОЖИДАЕТСЯ: IP берётся из доверенного источника прокси
  // (x-vercel-forwarded-for / request.ip), клиентский XFF игнорируется
  // | ФАКТ: clientIp() берёт ПЕРВЫЙ элемент клиентского x-forwarded-for → ключ
  // счётчика подконтролен атакующему; ротация заголовка = новое ведро на каждую
  // попытку, лимит «10 паролей / 15 мин» перестаёт существовать там, где прокси
  // XFF не переписывает | код: web/src/lib/ratelimit.ts:8-9
  it("ключ счётчика собирается из подставленного клиентом XFF", async () => {
    const { rateLimit } = await import("@/lib/ratelimit");

    headerBag = new Headers({ "x-forwarded-for": "9.9.9.9, 203.0.113.7" });
    await rateLimit("login", 10, 900, { failClosed: true });

    headerBag = new Headers({ "x-forwarded-for": "9.9.9.10, 203.0.113.7" });
    await rateLimit("login", 10, 900, { failClosed: true });

    const keys = backendCalls.map(
      (c) => (JSON.parse(String(c.init.body)) as { key: string }).key,
    );
    expect(keys).toEqual(["login:9.9.9.9", "login:9.9.9.10"]);
  });

  // АТАКА 4b [LOW]: публичные формы (inquiry / seller-listing / match) throttle-ятся
  // fail-open | ОЖИДАЕТСЯ (осознанное решение): лид важнее спама | ФАКТ: уронив
  // backend /ratelimit, атакующий снимает throttle со ВСЕХ публичных форм разом —
  // цепочка «завалить backend → залить CRM спамом» | код: web/src/lib/ratelimit.ts:26,36,40
  it("при недоступном backend публичные формы пропускают всё", async () => {
    vi.doMock("@/lib/api/backend", () => ({
      BACKEND_URL: "https://backend.test",
      backendFetch: () => Promise.reject(new Error("backend down")),
    }));
    const { rateLimit } = await import("@/lib/ratelimit");

    expect(await rateLimit("inquiry", 8, 3600)).toBe(true); // fail-open
    expect(await rateLimit("login", 10, 900, { failClosed: true })).toBe(false);
  });
});
