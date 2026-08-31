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

describe("АТАКА 3 [MEDIUM]: окно жизни сессии и строгая верификация", () => {
  // АТАКА 3 [MEDIUM]: у уволенного/пониженного сотрудника остаётся выданная кука
  // | ОЖИДАЛОСЬ: сервер сверяет сессию с актуальной ролью/статусом пользователя
  // | БЫЛО: роль берётся из payload и живёт SESSION_DAYS = 90 дней; ни logout
  // другого устройства, ни смена пароля, ни понижение admin→agent её не гасят
  // | ЧАСТИЧНО ИСПРАВЛЕНО 2026-08-31: серверного отзыва по-прежнему нет (нужен
  // session store — вынесено в задачи), но окно сокращено 90 → 14 дней: это и
  // есть максимальная задержка отзыва. Тест стережёт границу окна.
  // | код: web/src/lib/auth/session.ts:14-16
  it("окно жизни сессии ограничено 14 днями — это и есть задержка отзыва", async () => {
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
    expect(SESSION_DAYS).toBe(14);
  });

  // АТАКА 3b [LOW]: токен, выпущенный другой системой на том же AUTH_SECRET
  // | ОЖИДАЛОСЬ: jwtVerify с { issuer, audience, algorithms: ["HS256"] } |
  // БЫЛО: jwtVerify(token, key) без ограничений — любой HS-токен на том же
  // секрете с claim role:"admin" становился админ-сессией сайта (AUTH_SECRET
  // подписывает ещё и клиентские ссылки /match/saved/*) | ИСПРАВЛЕНО 2026-08-31
  // | код: web/src/lib/auth/session.ts:48-52
  it("отвергает чужой токен на том же секрете (iss/aud/alg зафиксированы)", async () => {
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

    expect(await verifySession(foreign)).toBeNull();
  });

  // АТАКА 3c [LOW]: токен вообще без claim `role`
  // | ОЖИДАЛОСЬ: null (структура сессии не подтверждена) | БЫЛО: String(undefined)
  // → роль "undefined", id → NaN, сессия считалась валидной; fail-closed держался
  // на одной строке в другом файле (canAccessAdminPath на неизвестной роли)
  // | ИСПРАВЛЕНО 2026-08-31: verifySession требует строковый role и числовой id
  // | код: web/src/lib/auth/session.ts:54-56
  it("отвергает сессию без claim role", async () => {
    const { verifySession } = await import("@/lib/auth/session");

    const bare = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("rightway:web")
      .setAudience("rightway:admin")
      .setExpirationTime("1d")
      .sign(key);

    expect(await verifySession(bare)).toBeNull();

    // id нечислового типа тоже не сессия (раньше давал NaN)
    const badId = await new SignJWT({ id: "7", role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("rightway:web")
      .setAudience("rightway:admin")
      .setExpirationTime("1d")
      .sign(key);

    expect(await verifySession(badId)).toBeNull();
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
