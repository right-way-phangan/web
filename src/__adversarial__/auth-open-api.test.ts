import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";

/**
 * Red-team: открытые роуты /api/*. Матчер middleware — только `/admin/:path*`
 * (web/src/middleware.ts:65), так что всё в /api живёт со своей защитой или без неё.
 */

const backendCalls: Array<{ path: string; init: RequestInit }> = [];

vi.mock("@/lib/api/backend", () => ({
  BACKEND_URL: "https://backend.test",
  backendFetch: vi.fn((path: string, init: RequestInit = {}) => {
    backendCalls.push({ path, init });
    return Promise.resolve(new Response("{}", { status: 200 }));
  }),
}));

// Без request-scope у next/headers rateLimit падает в fallback раньше, чем
// доходит до счётчика, и throttle нельзя проверить честно.
vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(new Headers({ "x-forwarded-for": "203.0.113.9" })),
}));

beforeEach(() => {
  backendCalls.length = 0;
  vi.resetModules();
  vi.unstubAllEnvs();
});

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("https://rightwaygroup.co/api/x", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

describe("АТАКА 5 [MEDIUM]: track-* — неаутентифицированная запись в БД", () => {
  // АТАКА 5 [MEDIUM]: скрипт в цикле шлёт POST /api/track-view с валидным RW
  // | ОЖИДАЛОСЬ: rateLimit() и/или проверка Origin, чтобы счётчик нельзя было
  // накрутить и нельзя было раскачать Neon | БЫЛО: ни throttle, ни Origin, ни
  // дедупликации — каждый запрос = запись в Postgres серверным bearer-токеном
  // (compute-квота Neon уже выжигалась однажды)
  // | ИСПРАВЛЕНО 2026-08-31: обязателен same-origin + потолок 120/10 мин на IP
  // | код: web/src/app/api/track-view/route.ts:19-27,36-39
  it("200 запросов без Origin не дают ни одной записи в backend", async () => {
    const { POST } = await import("@/app/api/track-view/route");

    for (let i = 0; i < 200; i++) {
      const res = await POST(post({ rw: "RW-V0012" }));
      expect(res.status).toBe(204); // счётчик по-прежнему молчит наружу
    }

    expect(backendCalls.filter((c) => c.path === "/track/view")).toHaveLength(0);
  });

  it("чужой Origin тоже отбивается", async () => {
    const { POST } = await import("@/app/api/track-view/route");

    await POST(post({ rw: "RW-V0012" }, { origin: "https://evil.example" }));

    expect(backendCalls.filter((c) => c.path === "/track/view")).toHaveLength(0);
  });

  it("свой Origin проходит — и только через счётчик rateLimit", async () => {
    const { POST } = await import("@/app/api/track-view/route");

    await POST(
      post({ rw: "RW-V0012" }, { origin: "https://rightwaygroup.co", host: "rightwaygroup.co" }),
    );

    expect(backendCalls.filter((c) => c.path === "/ratelimit")).toHaveLength(1);
    expect(backendCalls.filter((c) => c.path === "/track/view")).toHaveLength(1);
  });

  // АТАКА 5b [MEDIUM]: отравление аналитики спроса произвольными «районами»
  // | ОЖИДАЛОСЬ: districts фильтруется по справочнику районов, как types/tenure/features
  // | БЫЛО: strArr(b.districts) вызывался БЕЗ allow-set → в /admin/demand попадало
  // до 12 произвольных строк по 60 символов за запрос; отчёт о спросе, на который
  // опирается закупка объектов, управлялся анонимом снаружи
  // | ИСПРАВЛЕНО 2026-08-31: allow-set по справочнику DISTRICTS
  // | код: web/src/app/api/track-search/route.ts:12-14,34
  it("track-search выбрасывает районы вне справочника", async () => {
    const { POST } = await import("@/app/api/track-search/route");

    const junk = [
      "<img src=x onerror=alert(1)>",
      "Beachfront Thong Sala — ATTACKER",
      "'; DROP TABLE demand;--",
    ];
    await POST(post({ districts: [...junk, "Haad Yao"], types: ["NotAType"] }));

    const sent = JSON.parse(String(backendCalls[0].init.body)) as {
      districts: string[];
      types: string[];
    };
    expect(sent.districts).toEqual(["Haad Yao"]); // мусор отфильтрован, реальный район прошёл
    expect(sent.types).toEqual([]);
  });
});


describe("АТАКА 6 [MEDIUM]: tasks-state — initData без срока годности", () => {
  const BOT_TOKEN = "123456:adversarial-test-bot-token";
  const ALLOWED = "555000111";

  /** Собирает валидно подписанный Telegram initData с произвольным auth_date. */
  function initData(authDate: number): string {
    const params = new URLSearchParams({
      auth_date: String(authDate),
      query_id: "AAH0000",
      user: JSON.stringify({ id: Number(ALLOWED), first_name: "V" }),
    });
    const pairs = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const secret = createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
    params.set("hash", createHmac("sha256", secret).update(pairs).digest("hex"));
    return params.toString();
  }

  // АТАКА 6 [MEDIUM]: перехваченная/сохранённая строка initData (она уезжает в
  // заголовке каждого запроса Mini App, оседает в логах, в history, в отладке)
  // переигрывается через годы | ОЖИДАЛОСЬ: проверка auth_date на свежесть
  // (Telegram рекомендует окно ~1 сутки) + timingSafeEqual на сравнении хеша
  // | БЫЛО: auth_date не читался вовсе — подпись 2020 года открывает GET (лиды с
  // телефонами за 48 ч), POST/PATCH/DELETE задач в CRM
  // | код: web/src/app/api/tasks-state/route.ts:28-49 (auth_date не упоминается), :41
  it("подпись 2020 года больше не открывает ни лиды, ни мутации задач", async () => {
    vi.stubEnv("TELEGRAM_ASSISTANT_BOT_TOKEN", BOT_TOKEN);
    vi.stubEnv("OBJECTS_API_URL", "https://backend.test");
    vi.stubEnv("OBJECTS_API_TOKEN", "backend-token");
    vi.stubEnv("TELEGRAM_ALLOWED_USER_IDS", ALLOWED);

    const fetchMock = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            { id: 1, contactName: "Buyer", phone: "+66840000000", createdAt: new Date().toISOString() },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { GET, DELETE } = await import("@/app/api/tasks-state/route");
    const stale = initData(1_600_000_000); // 2020-09-13

    const req = (url: string) =>
      new Request(url, { headers: { "x-telegram-initdata": stale } });

    const res = await GET(req("https://rightwaygroup.co/api/tasks-state"));
    expect(res.status).toBe(401);
    expect(await res.text()).not.toContain("+66840000000");

    const del = await DELETE(
      new Request("https://rightwaygroup.co/api/tasks-state?id=1", {
        method: "DELETE",
        headers: { "x-telegram-initdata": stale },
      }),
    );
    expect(del.status).toBe(401);

    // ...а свежая подпись работает как прежде.
    const okRes = await GET(
      new Request("https://rightwaygroup.co/api/tasks-state", {
        headers: { "x-telegram-initdata": initData(Math.floor(Date.now() / 1000)) },
      }),
    );
    expect(okRes.status).toBe(200);

    vi.unstubAllGlobals();
  });
});
