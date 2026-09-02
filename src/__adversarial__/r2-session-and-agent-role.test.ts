// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

/**
 * RED-TEAM, РАУНД 2 — атака на фиксы 66435c5 в `lib/auth/session.ts`
 * (TTL 90→14, iss/aud/algorithms, обязательные claim'ы) и в
 * `lib/actions/valuation.ts` (неадмину — publicView + throttle).
 * Обе найденные регрессии закрыты 2026-08-31: mint стал так же строг, как
 * verify, а полный результат оценки получает любой СОТРУДНИК, не только админ.
 */

const SECRET = "adversarial-r2-secret";
const key = new TextEncoder().encode(SECRET);

let cookieValue: string | undefined;
let headerBag = new Headers();
const backendCalls: Array<{ path: string; init: RequestInit }> = [];

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) => (name === "rw_session" && cookieValue ? { value: cookieValue } : undefined),
    }),
  headers: () => Promise.resolve(headerBag),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

vi.mock("@/lib/api/backend", () => ({
  BACKEND_URL: "https://backend.test",
  backendFetch: vi.fn((path: string, init: RequestInit = {}) => {
    backendCalls.push({ path, init });
    const body = path.startsWith("/valuation/") ? [] : { allowed: true, ok: true, id: 1 };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  }),
}));

beforeEach(() => {
  backendCalls.length = 0;
  cookieValue = undefined;
  headerBag = new Headers();
  vi.resetModules();
  vi.stubEnv("AUTH_SECRET", SECRET);
  vi.stubEnv("OBJECTS_API_URL", "https://backend.test");
});

// АТАКА 39 [HIGH, эксплуатация]: добавление iss/aud в verifySession | ОЖИДАЕТСЯ:
// у смены формата сессии есть план миграции (двойная проверка старого формата
// на переходный период либо явный «всех разлогинило») | ФАКТ (НЕ ЗАКРЫТО): все
// куки, выданные ДО деплоя фикса, подписаны тем же секретом, но без claim'ов
// iss/aud — jwtVerify отвергает их все. В момент выката каждая активная сессия
// (включая установленную PWA CRM, которую держали открытой месяцами при старом
// TTL в 90 дней) превращается в 401/redirect без единого сообщения.
// код: src/lib/auth/session.ts:21-22,48-52
describe("АТАКА 39 — деплой фикса разлогинивает все существующие сессии", () => {
  it("кука старого формата (тот же секрет, без iss/aud) больше не сессия", async () => {
    const { verifySession } = await import("@/lib/auth/session");

    // ровно то, что выпускал signSession до 66435c5
    const legacy = await new SignJWT({ id: 7, email: "vladimir@rightwaygroup.co", role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("90d") // старый SESSION_DAYS
      .sign(key);

    expect(await verifySession(legacy)).toBeNull();
  });

  it("новый формат отличается только claim'ами iss/aud — подпись та же", async () => {
    const { signSession, verifySession } = await import("@/lib/auth/session");
    const fresh = await signSession({ id: 7, email: "vladimir@rightwaygroup.co", role: "admin" });
    const payload = JSON.parse(atob(fresh.split(".")[1])) as unknown as Record<string, unknown>;

    expect(payload.iss).toBe("rightway:web");
    expect(payload.aud).toBe("rightway:admin");
    expect(await verifySession(fresh)).toMatchObject({ id: 7, role: "admin" });
  });

  it("окно доверия ужалось с 90 до 14 дней — прежняя кука истекла бы вчетверо позже", async () => {
    const { SESSION_DAYS } = await import("@/lib/auth/session");
    expect(SESSION_DAYS).toBe(14);
  });
});

// АТАКА 40 [HIGH]: асимметрия mint/verify | ОЖИДАЕТСЯ: если verifySession
// требует ЧИСЛОВОЙ id, то signSession обязан его провалидировать при выпуске —
// иначе система выдаёт токен, который сама же не примет | БЫЛО: signSession
// делал `{ ...user }` без единой проверки, а `user` в loginAction — это
// нетипизированный `res.json()` от backend; драйвер, отдающий bigint строкой,
// давал id:"7" → логин проходил, кука выставлялась, middleware её отвергал,
// редирект обратно на /admin/login: петля без единого сообщения об ошибке |
// ИСПРАВЛЕНО 2026-08-31: mint приводит id к числу и падает на нечисловом —
// «петля логина» либо не возникает вовсе, либо превращается в громкий отказ.
// код: src/lib/auth/session.ts:40-41 против :62
describe("АТАКА 40 — signSession не выпускает токен, который verifySession отвергнет", () => {
  it("id строкой из backend-JSON: mint приводит его к числу, вход проходит", async () => {
    const { signSession, verifySession } = await import("@/lib/auth/session");

    const fromBackendJson = { id: "7", email: "agent@rightwaygroup.co", role: "agent" };
    const token = await signSession(fromBackendJson as never);

    expect(JSON.parse(atob(token.split(".")[1])).id).toBe(7); // не "7"
    expect(await verifySession(token)).toMatchObject({ id: 7, role: "agent" });
  });

  it("id, который числом не становится, — громкий отказ на выпуске, а не тихая петля", async () => {
    const { signSession } = await import("@/lib/auth/session");
    await expect(signSession({ email: "a@b.c", role: "admin" } as never)).rejects.toThrow(/id/);
    await expect(signSession({ id: "abc", email: "a@b.c", role: "admin" } as never)).rejects.toThrow(/id/);
  });

  it("контроль: числовой id проходит как и раньше", async () => {
    const { signSession, verifySession } = await import("@/lib/auth/session");
    const token = await signSession({ id: 7, email: "a@b.c", role: "agent" });
    expect(await verifySession(token)).toMatchObject({ id: 7, role: "agent" });
  });
});

// АТАКА 41 [MEDIUM, регресс админки]: фикс «неадмину — publicView» ключевался на
// isAdmin() = role === "admin" | ОЖИДАЕТСЯ: сотрудник с ролью agent, которому
// middleware ОТКРЫВАЕТ /admin/new и /admin/objects (roles.ts:3), получает в
// интейке полноценную оценку | БЫЛО: agent — не admin, поэтому runValuation
// отдавал ему publicView без `askingVerdict` и `leasehold`; блок «Цена продавца
// … переоценён, аргумент для торга», ради которого виджет и стоит в форме, у
// агента просто не рисовался, плюс он ел публичный throttle 12/час и попадал в
// журнал как «public» | ИСПРАВЛЕНО 2026-08-31: гейт переведён на isStaff() —
// срез и throttle остались ровно для анонимного (публичного) вызова.
// код: src/lib/actions/valuation.ts:156,188,192 + src/lib/auth/require-admin.ts:59
describe("АТАКА 41 — роль agent снова видит полную оценку в /admin/new", () => {
  const RAW = {
    ok: true,
    listValue: 12_000_000,
    fairValue: 10_800_000,
    low: 9_500_000,
    high: 13_000_000,
    perRai: 4_100_000,
    confidence: "high",
    askingVerdict: { askingPrice: 16_000_000, deltaPct: 48, verdict: "over" },
    leasehold: { fairRentPerRaiMonth: 31_500, rentVerdict: "over" },
    methods: [{ key: "comparative", label: "Сравнительный", compsUsed: [{ ref: "RW-L0042" }] }],
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

  /** role=null — анонимный вызов публичного фасада (сессии нет). */
  const asRole = async (role: string | null) => {
    if (role) {
      const { signSession } = await import("@/lib/auth/session");
      cookieValue = await signSession({ id: 42, email: `${role}@rightwaygroup.co`, role });
    } else {
      cookieValue = undefined;
    }
    const { runValuation } = await import("@/lib/actions/valuation");
    return runValuation({ type: "Land", areaRai: 2 } as never);
  };

  it("админ получает вердикт по цене продавца и лизхолд-блок", async () => {
    const r = (await asRole("admin")) as unknown as Record<string, unknown>;
    expect(r.askingVerdict).toBeDefined();
    expect(r.leasehold).toBeDefined();
    expect(r.caveats).toHaveLength(1);
  });

  it("agent получает ровно то же самое — вердикт, лизхолд-блок и оговорки", async () => {
    const r = (await asRole("agent")) as unknown as Record<string, unknown>;
    expect(r.fairValue).toBe(RAW.fairValue);
    expect(r.askingVerdict).toEqual(RAW.askingVerdict); // inline-estimate.tsx:127
    expect(r.leasehold).toEqual(RAW.leasehold); // inline-estimate.tsx:169
    expect(r.caveats).toEqual(RAW.caveats); // «Оговорок: N» не пусто
    expect(r.methods).toHaveLength(1);
  });

  it("а анонимный вызов по-прежнему срезан до publicView — методика наружу не уходит", async () => {
    const r = (await asRole(null)) as unknown as Record<string, unknown>;
    expect(r.fairValue).toBe(RAW.fairValue); // агрегаты публичны
    expect(r.askingVerdict).toBeUndefined();
    expect(r.leasehold).toBeUndefined();
    expect(r.methods).toEqual([]);
    expect(r.adjustments).toEqual([]);
    expect(r.caveats).toEqual([]);
  });

  it("throttle 12/час остался только на анонимном вызове", async () => {
    await asRole("agent");
    expect(backendCalls.filter((c) => c.path === "/ratelimit")).toHaveLength(0);

    backendCalls.length = 0;
    await asRole("admin");
    expect(backendCalls.filter((c) => c.path === "/ratelimit")).toHaveLength(0);

    backendCalls.length = 0;
    await asRole(null);
    const anon = backendCalls.filter((c) => c.path === "/ratelimit");
    expect(anon).toHaveLength(1);
    expect(String(anon[0].init.body)).toContain('"limit":12');
  });

  it("журнал больше не атрибутирует работу сотрудника как «public»", async () => {
    await asRole("agent");
    await new Promise((r) => setTimeout(r, 0));
    const writes = backendCalls.filter((c) => c.path === "/valuations");
    expect(writes).toHaveLength(1);
    expect(String(writes[0].init.body)).not.toContain('"createdBy":"public"');
    expect(String(writes[0].init.body)).toContain('"createdBy":"admin"');

    backendCalls.length = 0;
    await asRole(null);
    await new Promise((r) => setTimeout(r, 0));
    const anonWrites = backendCalls.filter((c) => c.path === "/valuations");
    expect(String(anonWrites[0].init.body)).toContain('"createdBy":"public"');
  });
});
