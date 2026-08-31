// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * RED-TEAM, РАУНД 3 — атака на фиксы 78bdb51 в `lib/auth/session.ts`
 * (signSession бросает на нечисловом id) и `lib/actions/valuation.ts`
 * (полный результат — любому сотруднику), плюс публичный beacon без throttle.
 * Тесты характеризующие.
 */

const SECRET = "adversarial-r3-secret";

let cookieValue: string | undefined;
const cookieSets: Array<{ name: string; value: string }> = [];
const backendCalls: Array<{ path: string; init: RequestInit }> = [];
let loginResponse: () => Response = () =>
  new Response(JSON.stringify({ user: { id: 7, email: "a@b.c", role: "agent" } }), { status: 200 });

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) =>
        name === "rw_session" && cookieValue ? { value: cookieValue } : undefined,
      set: (name: string, value: string) => cookieSets.push({ name, value }),
      delete: () => {},
    }),
  headers: () => Promise.resolve(new Headers()),
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
    if (path === "/auth/login") return Promise.resolve(loginResponse());
    const body = path.startsWith("/valuation/") ? [] : { allowed: true, ok: true, id: 1 };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  }),
}));

beforeEach(() => {
  backendCalls.length = 0;
  cookieSets.length = 0;
  cookieValue = undefined;
  vi.resetModules();
  vi.stubEnv("AUTH_SECRET", SECRET);
  vi.stubEnv("OBJECTS_API_URL", "https://backend.test");
});

// АТАКА 57 [HIGH, вход]: фикс «signSession падает на нечисловом id» превратил
// тихую петлю логина в НЕОБРАБОТАННОЕ исключение | ОЖИДАЕТСЯ: если сессию
// выпустить нельзя, посетитель видит понятное сообщение в форме — так же, как
// «Неверный email или пароль» и «Сервис недоступен» | ФАКТ: `signSession`
// вызывается СНАРУЖИ try/catch (try закрывается на разборе ответа backend),
// поэтому исключение уходит из server action наверх: React отдаёт форме
// не `{error}`, а падение — экран ошибки/500 с непрозрачным digest'ом, без
// единого слова о причине, и в логе — «некорректный id пользователя».
// Триггер реальный и не редкий: backend, отдающий id строкой-UUID (или ответ
// 200 без поля id), выключает вход ВСЕМ разом. Второй цикл поменял класс
// отказа, но не добавил ему обработчика.
// код: src/lib/actions/auth.ts:40 (вне try из :25-37) → src/lib/auth/session.ts:41
describe("АТАКА 57 — login-экшен падает наружу вместо ошибки в форме", () => {
  it("контроль: нормальный вход выставляет куку и редиректит", async () => {
    const { loginAction } = await import("@/lib/actions/auth");
    await expect(loginAction({}, form())).rejects.toThrow(/NEXT_REDIRECT:\/admin\/crm/);
    expect(cookieSets.map((c) => c.name)).toEqual(["rw_session"]);
  });

  it("неверный пароль — аккуратная ошибка в форме", async () => {
    loginResponse = () => new Response("nope", { status: 401 });
    const { loginAction } = await import("@/lib/actions/auth");
    expect(await loginAction({}, form())).toEqual({ error: "Неверный email или пароль." });
    resetLogin();
  });

  // ИСПРАВЛЕНО 2026-09-01: signSession обёрнут в try/catch — пользователь видит
  // состояние ошибки в форме, а не экран падения server action.
  it("backend с id-UUID: экшен возвращает ошибку формы, а не падает", async () => {
    loginResponse = () =>
      new Response(
        JSON.stringify({ user: { id: "3f1c…-uuid", email: "a@b.c", role: "admin" } }),
        { status: 200 },
      );
    const { loginAction } = await import("@/lib/actions/auth");
    const res = await loginAction({}, form());
    expect(res).toEqual({ error: "Не удалось создать сессию. Сообщите администратору." });
    expect(cookieSets).toHaveLength(0);
    resetLogin();
  });

  it("ответ 200 без поля id — тоже понятная ошибка, а не падение", async () => {
    loginResponse = () =>
      new Response(JSON.stringify({ user: { email: "a@b.c", role: "admin" } }), { status: 200 });
    const { loginAction } = await import("@/lib/actions/auth");
    expect(await loginAction({}, form())).toEqual({
      error: "Не удалось создать сессию. Сообщите администратору.",
    });
    expect(cookieSets).toHaveLength(0);
    resetLogin();
  });
});

function form(): FormData {
  const fd = new FormData();
  fd.set("email", "vladimir@rightwaygroup.co");
  fd.set("password", "correct-horse");
  return fd;
}
function resetLogin() {
  loginResponse = () =>
    new Response(JSON.stringify({ user: { id: 7, email: "a@b.c", role: "agent" } }), { status: 200 });
}

// АТАКА 58 [HIGH, роли]: server action отдаёт роли `agent` ровно то, что
// middleware ей на странице ЗАПРЕЩАЕТ | ОЖИДАЕТСЯ: одна граница роли — если
// агенту закрыт /admin/valuation, он не получает содержимое этого раздела и
// другим путём | ФАКТ: `canAccessAdminPath("agent", …)` пускает агента только
// в /admin/crm, /admin/objects, /admin/new, а `runValuation` после фикса
// ключуется на `isStaff()` и отдаёт агенту СЫРОЙ результат: разбивку по
// методам, ссылки на использованные компсы, множители факторов и внутренние
// оговорки. Server action — обычный POST-эндпоинт, вызываемый с любой
// разрешённой агенту страницы, так что ACL раздела обходится без всякого
// взлома. Второй цикл чинил регресс агента в /admin/new (АТАКА 41) и заодно
// открыл ему методику оценки целиком.
// код: src/lib/auth/roles.ts:3-10 против src/lib/actions/valuation.ts:154,192
describe("АТАКА 58 — агент получает экшеном методику раздела, закрытого ему middleware", () => {
  const RAW = {
    ok: true,
    listValue: 12_000_000,
    fairValue: 10_800_000,
    low: 9_500_000,
    high: 13_000_000,
    confidence: "high",
    methods: [{ key: "comparative", label: "Сравнительный", compsUsed: [{ ref: "RW-L0042", priceThb: 8_900_000 }] }],
    adjustments: [{ label: "Вид на море", mult: 1.22 }],
    caveats: ["Мало компсов в районе — вилка широкая."],
  };

  beforeEach(() => {
    vi.doMock("@/lib/data/objects", () => ({ getAllObjects: () => Promise.resolve([]) }));
    vi.doMock("@/lib/data/rental-market", () => ({ getRentalMarket: () => ({ districts: [], asOf: null }) }));
    vi.doMock("@/lib/actions/zone-lookup", () => ({ lookupZoneByLocation: () => Promise.resolve(null) }));
    vi.doMock("@/lib/valuation/llm-explain", () => ({ explainValuation: () => Promise.resolve(null) }));
    vi.doMock("@/lib/valuation/engine", () => ({ estimate: () => RAW }));
  });

  it("middleware не пускает агента на страницу оценки", async () => {
    const { canAccessAdminPath } = await import("@/lib/auth/roles");
    expect(canAccessAdminPath("agent", "/admin/valuation")).toBe(false);
    expect(canAccessAdminPath("agent", "/admin/new")).toBe(true);
  });

  it("но экшен считает его сотрудником и отдаёт компсы, множители и оговорки", async () => {
    const { canRunAction } = await import("@/lib/auth/require-admin");
    expect(canRunAction("agent", "staff")).toBe(true);

    const { signSession } = await import("@/lib/auth/session");
    cookieValue = await signSession({ id: 42, email: "agent@rightwaygroup.co", role: "agent" });
    const { runValuation } = await import("@/lib/actions/valuation");
    const r = (await runValuation({ type: "Land", areaRai: 2 } as never)) as Record<string, unknown>;

    expect(r.methods).toEqual(RAW.methods); // цены компсов — закупочные данные
    expect(r.adjustments).toEqual(RAW.adjustments);
    expect(r.caveats).toEqual(RAW.caveats);
  });

  it("проверено и НЕ сломано: публичный фасад /tools/estimate режет результат даже под сессией", async () => {
    const { signSession } = await import("@/lib/auth/session");
    cookieValue = await signSession({ id: 42, email: "agent@rightwaygroup.co", role: "agent" });
    const { estimatePublic } = await import("@/lib/actions/public-estimate");
    const r = (await estimatePublic({ type: "Land", areaRai: 2 })) as Record<string, unknown>;
    expect(Object.keys(r).sort()).toEqual(["confidence", "high", "low", "mid", "ok", "perRaiMid"]);
  });
});

// АТАКА 59 [MEDIUM, отравление отчёта]: публичный beacon спроса без единого
// ограничения | ОЖИДАЕТСЯ: анонимный эндпоинт, который пишет в отчёт
// /admin/demand, ограничен по частоте так же, как соседний NL-поиск
// (`rateLimit("nl-search", 20, 3600)`) | ФАКТ: `POST /api/track-search`
// не зовёт `rateLimit` вообще — каждый запрос пересылается в backend. Allow-set
// значений (добавленный прошлым циклом) защищает от мусорных СТРОК, но не от
// объёма: скрипт, шлющий валидные комбинации, за минуты переписывает
// распределение спроса, по которому принимаются решения о наборе инвентаря.
// Ответ всегда 204, так что и обнаружить это по ошибкам нельзя.
// код: src/app/api/track-search/route.ts:25-60 (нет rateLimit) против
//      src/lib/actions/search.ts:42
describe("АТАКА 59 — /api/track-search пересылает всё без throttle", () => {
  const hit = (body: unknown) =>
    new Request("https://rightwaygroup.co/api/track-search", {
      method: "POST",
      body: JSON.stringify(body),
    });

  it("50 подряд запросов — 50 записей спроса и ни одной проверки лимита", async () => {
    const { POST } = await import("@/app/api/track-search/route");
    for (let i = 0; i < 50; i++) {
      const res = await POST(hit({ types: ["Land"], districts: ["Sri Thanu"], resultCount: 0 }));
      expect(res.status).toBe(204);
    }
    expect(backendCalls.filter((c) => c.path === "/track/search")).toHaveLength(50);
    expect(backendCalls.filter((c) => c.path === "/ratelimit")).toHaveLength(0);
  });

  it("для сравнения: NL-поиск на той же странице лимит проверяет", async () => {
    vi.doMock("@/lib/data/objects", () => ({ getPublicObjects: () => Promise.resolve([]) }));
    vi.doMock("@/lib/data/demand", () => ({ recordSearchEvent: () => Promise.resolve() }));
    vi.doMock("@/lib/search/parse-query", () => ({
      parseSearchQuery: () => Promise.resolve({ params: {}, interpreted: [] }),
    }));
    const { runNlSearch } = await import("@/lib/actions/search");
    await runNlSearch("land in sri thanu");
    expect(backendCalls.filter((c) => c.path === "/ratelimit")).toHaveLength(1);
  });
});
