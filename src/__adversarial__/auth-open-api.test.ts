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
  // | ОЖИДАЕТСЯ: rateLimit() (как у публичных форм: inquiry 8/час) и/или проверка
  // Origin, чтобы счётчик нельзя было накрутить и нельзя было раскачать Neon
  // | ФАКТ: ни throttle, ни Origin, ни дедупликации — каждый запрос = одна запись
  // в Postgres серверным bearer-токеном; compute-квота Neon уже выжигалась однажды
  // | код: web/src/app/api/track-view/route.ts:12-25
  it("каждый анонимный запрос уходит в backend — накрутка просмотров и нагрузка", async () => {
    const { POST } = await import("@/app/api/track-view/route");

    for (let i = 0; i < 200; i++) {
      const res = await POST(post({ rw: "RW-V0012" }));
      expect(res.status).toBe(204);
    }

    expect(backendCalls.filter((c) => c.path === "/track/view")).toHaveLength(200);
  });

  // АТАКА 5b [MEDIUM]: отравление аналитики спроса произвольными «районами»
  // | ОЖИДАЕТСЯ: districts фильтруется по справочнику районов, как types/tenure/features
  // | ФАКТ: strArr(b.districts) вызывается БЕЗ allow-set → в /admin/demand попадает
  // до 12 произвольных строк по 60 символов за запрос; отчёт о спросе, на который
  // опирается закупка объектов, управляется анонимом снаружи
  // | код: web/src/app/api/track-search/route.ts:28 (ср. строки 27, 29, 30 — там allow-set есть)
  it("track-search принимает произвольные districts и шлёт их дальше", async () => {
    const { POST } = await import("@/app/api/track-search/route");

    const junk = [
      "<img src=x onerror=alert(1)>",
      "Beachfront Thong Sala — ATTACKER",
      "'; DROP TABLE demand;--",
    ];
    await POST(post({ districts: junk, types: ["NotAType"] }));

    const sent = JSON.parse(String(backendCalls[0].init.body)) as {
      districts: string[];
      types: string[];
    };
    expect(sent.districts).toEqual(junk); // не отфильтровано
    expect(sent.types).toEqual([]); // а тут allow-set сработал
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
  // переигрывается через годы | ОЖИДАЕТСЯ: проверка auth_date на свежесть
  // (Telegram рекомендует окно ~1 сутки) + timingSafeEqual на сравнении хеша
  // | ФАКТ: auth_date не читается вовсе — подпись 2020 года открывает GET (лиды с
  // телефонами за 48 ч), POST/PATCH/DELETE задач в CRM
  // | код: web/src/app/api/tasks-state/route.ts:28-49 (auth_date не упоминается), :41
  it("подпись 2020 года открывает лиды и мутации задач в 2026-м", async () => {
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
    expect(res.status).toBe(200);
    const body = (await res.json()) as { leads: Array<{ phone: string }> };
    expect(body.leads[0].phone).toBe("+66840000000");

    const del = await DELETE(
      new Request("https://rightwaygroup.co/api/tasks-state?id=1", {
        method: "DELETE",
        headers: { "x-telegram-initdata": stale },
      }),
    );
    expect(del.status).toBe(200);

    vi.unstubAllGlobals();
  });
});
