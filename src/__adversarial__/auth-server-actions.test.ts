import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Red-team: Server Actions как сетевые эндпоинты.
 *
 * Next.js диспатчит server action по ID в заголовке `Next-Action`, а НЕ по
 * пути. Матчер middleware — `["/admin/:path*"]` (web/src/middleware.ts:65),
 * поэтому POST с Next-Action на любой публичный путь («/», «/listings»)
 * middleware не видит вовсе. Единственная защита экшена — его собственный
 * requireAdmin/requireStaff/isAdmin. Тесты ниже фиксируют экшены, где его нет.
 */

const backendCalls: Array<{ path: string; init: RequestInit }> = [];

vi.mock("@/lib/api/backend", () => ({
  BACKEND_URL: "https://backend.test",
  backendFetch: vi.fn((path: string, init: RequestInit = {}) => {
    backendCalls.push({ path, init });
    const body = path.startsWith("/valuation/") ? [] : { ok: true, id: 1 };
    return Promise.resolve(
      new Response(JSON.stringify(body), { status: 200 }),
    );
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Анонимный вызывающий: ни cookie-сессии, ни Basic-заголовка.
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => undefined }),
  headers: () => Promise.resolve(new Headers()),
}));

beforeEach(() => {
  backendCalls.length = 0;
  vi.resetModules();
  vi.stubEnv("AUTH_SECRET", "test-secret-for-adversarial-run");
  vi.stubEnv("OBJECTS_API_URL", "https://backend.test");
});

describe("АТАКА 1 [CRITICAL]: bulkMoveLeads — server action без гейта", () => {
  // АТАКА 1 [CRITICAL]: анонимный POST с Next-Action ID `bulkMoveLeads` на любой
  // публичный путь | ОЖИДАЛОСЬ: экшен зовёт гейт и ничего не делает без сессии,
  // как его сосед bulkDeleteLeads | БЫЛО: гейта не было вообще — экшен PATCH-ил
  // любые лиды в любую стадию серверным bearer-токеном
  // | ИСПРАВЛЕНО 2026-08-31: isStaff() перед любой работой, до обращения к API
  // | код: web/src/lib/actions/bulk-leads.ts:21-25
  it("отбит гейтом: без сессии ни одного PATCH в backend", async () => {
    const { bulkMoveLeads } = await import("@/lib/actions/bulk-leads");

    const res = await bulkMoveLeads([101, 102, 103], "lost");

    expect(res).toEqual({ ok: false, done: 0, failed: 3 });
    expect(backendCalls).toHaveLength(0);
  });

  it("КОНТРОЛЬ: сосед bulkDeleteLeads тем же анонимом отбит isAdmin()", async () => {
    const { bulkDeleteLeads } = await import("@/lib/actions/bulk-leads");

    const res = await bulkDeleteLeads([101, 102, 103]);

    expect(res).toEqual({ ok: false, done: 0, failed: 3 });
    expect(backendCalls).toHaveLength(0);
  });

  // АТАКА 1b [HIGH]: тот же экшен без ограничения длины массива ids
  // | ОЖИДАЛОСЬ: потолок на размер батча | БЫЛО: сколько id прислали — столько
  // параллельных PATCH-ов в Neon; усилитель нагрузки на БД
  // | ИСПРАВЛЕНО 2026-08-31: MAX_BATCH = 100, батч сверх потолка отбивается целиком
  // | код: web/src/lib/actions/bulk-leads.ts:11,26-28
  it("батч сверх потолка отбивается целиком, ни одного PATCH", async () => {
    const { bulkMoveLeads } = await import("@/lib/actions/bulk-leads");

    const ids = Array.from({ length: 500 }, (_, i) => i + 1);
    const res = await bulkMoveLeads(ids, "won");

    expect(res.ok).toBe(false);
    expect(backendCalls).toHaveLength(0);
  });
});

describe("АТАКА 2 [HIGH]: runValuation — админский движок оценки без гейта", () => {
  // АТАКА 2 [HIGH]: анонимный вызов server action `runValuation` (он в клиентском
  // манифесте — импортирован из "use client"-компонентов admin/valuation-tool.tsx
  // и admin/inline-estimate.tsx) | ОЖИДАЕТСЯ: requireAdmin(), как у соседнего
  // explainValuationAction; наружу оценка отдаётся только через санитайзер
  // estimatePublic | ФАКТ: гейта нет — возвращается СЫРОЙ ValuationResult с
  // разбивкой по методам, компсами и множителями факторов (ровно то, что
  // public-estimate.ts объявляет закупочными данными и методикой)
  // | код: web/src/lib/actions/valuation.ts:121
  const RAW_RESULT = {
    ok: true,
    listValue: 12_000_000,
    fairValue: 10_800_000,
    low: 9_500_000,
    high: 13_000_000,
    confidence: "high",
    methods: [
      {
        key: "comparative",
        label: "Сравнительный",
        available: true,
        value: 12_000_000,
        weight: 0.6,
        n: 7,
        details: ["медиана эталона 4.1M/рай"],
        comps: [{ rwNumber: "RW-L0042", priceThb: 11_000_000 }],
      },
    ],
    adjustments: [
      { label: "Чанот", mult: 1.15 },
      { label: "Вид на море", mult: 1.22 },
    ],
    sensitivity: [{ label: "Дорога", deltaPct: -8, applied: true }],
    caveats: [],
  };

  beforeEach(() => {
    vi.doMock("@/lib/data/objects", () => ({
      getAllObjects: () => Promise.resolve([]),
    }));
    vi.doMock("@/lib/data/rental-market", () => ({
      getRentalMarket: () => ({ districts: [], asOf: null }),
    }));
    vi.doMock("@/lib/actions/zone-lookup", () => ({
      lookupZoneByLocation: () => Promise.resolve(null),
    }));
    vi.doMock("@/lib/valuation/llm-explain", () => ({
      explainValuation: () => Promise.resolve(null),
    }));
    vi.doMock("@/lib/valuation/engine", () => ({
      estimate: () => RAW_RESULT,
    }));
  });

  it("анониму отдаются только агрегаты — методика срезана", async () => {
    const { runValuation } = await import("@/lib/actions/valuation");

    const result = await runValuation({ type: "Land", areaRai: 2 } as never);

    // Цифры оценки видны (их и так показывает публичный фасад)...
    expect(result.ok).toBe(true);
    expect(result.fairValue).toBe(RAW_RESULT.fairValue);
    // ...а закупочные данные — нет: ни компсов, ни множителей, ни разбивки.
    expect(result.methods).toEqual([]);
    expect(result.adjustments).toEqual([]);
    expect(JSON.stringify(result)).not.toContain("RW-L0042");
    expect(JSON.stringify(result)).not.toContain("Вид на море");
  });

  // АТАКА 2b [MEDIUM]: каждый анонимный вызов пишет строку в журнал `valuations`
  // | ОЖИДАЛОСЬ: гейт и/или rateLimit(), как у публичных форм (inquiry 8/час)
  // | БЫЛО: ни того, ни другого — неаутентифицированный усилитель записи в Neon
  // (compute-квота уже выжигалась однажды)
  // | ИСПРАВЛЕНО 2026-08-31: каждый неадминский вызов проходит через rateLimit
  // ("valuation", 12/час на IP), а запись в журнал атрибутируется как "public"
  // | код: web/src/lib/actions/valuation.ts:150-152,184
  it("каждый анонимный вызов проходит rate-limit и пишется как public", async () => {
    const { runValuation } = await import("@/lib/actions/valuation");

    await runValuation({ type: "Land", areaRai: 2 } as never);
    await new Promise((r) => setTimeout(r, 0)); // журнал пишется best-effort, без await

    const throttle = backendCalls.filter((c) => c.path === "/ratelimit");
    expect(throttle).toHaveLength(1);
    expect(String(throttle[0].init.body)).toContain("valuation");

    const writes = backendCalls.filter((c) => c.path === "/valuations");
    expect(writes).toHaveLength(1);
    // Атрибуцию журнала задаёт только админ — аноним не может подписаться "admin".
    expect(String(writes[0].init.body)).toContain('"createdBy":"public"');
  });
});
