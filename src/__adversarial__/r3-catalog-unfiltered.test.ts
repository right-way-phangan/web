// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RealEstateObject } from "@/types/object";

/**
 * RED-TEAM, РАУНД 3 — атака на фикс 78bdb51 в `lib/data/objects.ts` +
 * `lib/data/projects.ts`: гейт вынесен в `isPubliclyListable`, применяется
 * только к спискам, а резолв лендинга проекта переведён на
 * `getPublicObjectsUnfiltered()`.
 *
 * Раунд 2 проверял, что лендинг перестал отдавать 404. Раунд 3 смотрит на
 * обратную сторону сделки: что этот негейтованный путь теперь ПУСКАЕТ.
 * Тесты характеризующие — фиксируют факт, не утверждают, что он правильный.
 */

let apiObjects: RealEstateObject[] = [];

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...a: unknown[]) => unknown) => fn,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/api/backend", () => ({
  BACKEND_URL: "https://backend.test",
  backendFetch: vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify(apiObjects), { status: 200 })),
  ),
}));

vi.mock("@/lib/data/fx", () => ({ getUsdPerThb: () => Promise.resolve(null) }));

vi.mock("@/lib/storage/r2-public", () => ({
  proxyR2Url: (u: string) => u,
  proxyR2VideoUrl: (u: string) => u,
}));

// Ветка без OBJECTS_API_URL (АТАКА 48) ходит в amoCRM — подменяем источник.
let amoElements: RealEstateObject[] = [];
vi.mock("@/lib/amocrm/client", () => ({
  listCatalogElements: () => Promise.resolve(amoElements),
  AmoApiError: class AmoApiError extends Error {
    status = 500;
    body = "";
  },
}));
vi.mock("@/lib/amocrm/mapper", () => ({
  mapElementToObject: (e: RealEstateObject) => e,
}));

const o = (p: Partial<RealEstateObject>): RealEstateObject => p as RealEstateObject;

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("OBJECTS_API_URL", "https://backend.test");
  apiObjects = [];
  amoElements = [];
});

// АТАКА 45 [HIGH, публикация]: снятый с публикации проект открывается полным
// публичным лендингом | ОЖИДАЕТСЯ: статус Withdrawn — это «убрать с сайта»
// (`getProjectUnits` прямым текстом считает Withdrawn «не инвентарём», а
// /object/[rw] отдаёт по нему graceful-заглушку, не карточку) | ФАКТ: резолв
// проекта идёт по негейтованному набору, статус не проверяется вовсе —
// `/projects/<slug>` и `/ru/projects/<slug>` рендерят лендинг целиком (цена,
// юниты, экономика, generateMetadata с title/description и canonical), причём
// именно у Withdrawn-проекта, которого нет ни в /projects, ни в sitemap.
// Раньше гейт стоял в `getPublicObjects` и снимал такую страницу вместе со
// списками; фикс убрал гейт с резолва целиком, а не только по обложке.
// код: src/lib/data/projects.ts:69 → src/lib/data/objects.ts:231-234
describe("АТАКА 45 — Withdrawn-проект скрыт из списков, но лендинг публично рендерится", () => {
  const withdrawn = o({
    id: 1,
    rwNumber: "RW-P0040",
    type: "Project",
    status: "Withdrawn",
    titleEn: "Halted Bay Residences",
    coverImage: "https://r2/cover.jpg",
    priceThb: 12_000_000,
  });

  it("из публичного каталога и из /projects он исчез", async () => {
    apiObjects = [withdrawn];
    const { getPublicObjects, isPubliclyListable } = await import("@/lib/data/objects");
    const { getPublicProjects } = await import("@/lib/data/projects");
    expect(isPubliclyListable(withdrawn)).toBe(false);
    expect(await getPublicObjects()).toEqual([]);
    expect(await getPublicProjects()).toEqual([]);
  });

  // ИСПРАВЛЕНО 2026-09-01: снятие гейта с резолва было слишком широким — вернули
  // статусный гейт (LANDING_STATUSES = Active + Reserved), сняв только
  // требование обложки, ради которого фикс и делался.
  it("Withdrawn-проект по слагу не резолвится — публичной страницы нет", async () => {
    apiObjects = [withdrawn];
    const { getProjectBySlug } = await import("@/lib/data/projects");
    expect(await getProjectBySlug("halted-bay-residences")).toBeNull();
  });

  it("то же и для Sold — «продано» снимает публичную страницу проекта", async () => {
    apiObjects = [o({ ...withdrawn, status: "Sold" })];
    const { getProjectBySlug } = await import("@/lib/data/projects");
    expect(await getProjectBySlug("halted-bay-residences")).toBeNull();
  });

  it("КОНТРОЛЬ: Reserved остаётся живым, а безобложечный Active — тем более", async () => {
    apiObjects = [o({ ...withdrawn, status: "Reserved" })];
    const { getProjectBySlug } = await import("@/lib/data/projects");
    expect((await getProjectBySlug("halted-bay-residences"))?.project.status).toBe("Reserved");

    apiObjects = [o({ ...withdrawn, status: "Active", coverImage: undefined })];
    const { getProjectBySlug: resolve2 } = await import("@/lib/data/projects");
    expect((await resolve2("halted-bay-residences"))?.project.status).toBe("Active");
  });
});

// АТАКА 46 [HIGH, SEO]: развилка вычисления слага | ОЖИДАЕТСЯ: ссылка, которую
// сайт сам печатает в /projects, в sitemap.xml и в редиректе с /object/[rw],
// открывается | ФАКТ: генераторы ссылок считают слаг по ГЕЙТОВАННОМУ набору
// (`getPublicProjects`), а резолвер — по НЕГЕЙТОВАННОМУ. `projectSlug()`
// разводит одноимённые проекты суффиксом RW-номера, глядя на переданный
// список, — поэтому наборы разной ширины дают РАЗНЫЕ слаги. Достаточно одного
// непубличного проекта-тёзки (Sold / снятая обложка), чтобы каждая ссылка на
// живой проект-тёзку стала жёстким 404: sitemap зовёт робота на URL, который
// приложение не резолвит. До фикса обе стороны считали слаг по одному набору.
// код: src/lib/data/projects.ts:71 против src/app/sitemap.ts:209 и
//      src/app/projects/[slug]/page.tsx:18
describe("АТАКА 46 — sitemap печатает слаг, который резолвер не находит", () => {
  const live = o({
    id: 1,
    rwNumber: "RW-P0050",
    type: "Project",
    status: "Active",
    titleEn: "Paradise Villas",
    coverImage: "https://r2/a.jpg",
  });
  /** Тёзка, снятый с публикации: в списки не попадает, в резолв — попадает. */
  const twin = o({
    id: 2,
    rwNumber: "RW-P0051",
    type: "Project",
    status: "Sold",
    titleEn: "Paradise Villas",
    coverImage: "https://r2/b.jpg",
  });

  it("sitemap/индекс дают слаг без суффикса", async () => {
    apiObjects = [live, twin];
    const { getPublicProjects, projectSlug } = await import("@/lib/data/projects");
    const listed = await getPublicProjects();
    expect(listed.map((p) => p.rwNumber)).toEqual(["RW-P0050"]);
    expect(projectSlug(listed[0], listed)).toBe("paradise-villas");
  });

  // ИСПРАВЛЕНО 2026-09-01: резолвер принимает и базовый слаг, если он однозначен
  // среди резолвимых проектов — ссылка, которую сайт печатает сам, открывается.
  it("резолвер находит проект по слагу из собственной ссылки сайта", async () => {
    apiObjects = [live, twin];
    const { getProjectBySlug } = await import("@/lib/data/projects");
    expect((await getProjectBySlug("paradise-villas"))?.project.rwNumber).toBe("RW-P0050");
  });

  it("и суффиксный вариант тоже продолжает работать", async () => {
    apiObjects = [live, twin];
    const { getProjectBySlug } = await import("@/lib/data/projects");
    expect((await getProjectBySlug("paradise-villas-p0050"))?.project.rwNumber).toBe("RW-P0050");
  });

  it("контроль: без непубличного тёзки слаги совпадают и ссылка живёт", async () => {
    apiObjects = [live];
    const { getPublicProjects, getProjectBySlug, projectSlug } = await import("@/lib/data/projects");
    const listed = await getPublicProjects();
    expect(projectSlug(listed[0], listed)).toBe("paradise-villas");
    expect((await getProjectBySlug("paradise-villas"))?.project.rwNumber).toBe("RW-P0050");
  });
});

// АТАКА 47 [HIGH, утечка]: негейтованный каталог уезжает В ПРОП публичной
// страницы | ОЖИДАЕТСЯ: на публичный лендинг попадает только то, что открыто на
// сайте | ФАКТ: `getProjectBySlug` возвращает `catalog` = весь негейтованный
// набор, а `/projects/[slug]/page.tsx:57` отдаёт его как
// `<ProjectLanding catalog={found.catalog}>`, откуда он уходит пропом
// `<RoiCalculator catalog>` (project-landing.tsx:402) и дальше в
// `SimilarObjects`, который фильтрует ТОЛЬКО по цене ±15% и `excludeRw` —
// ни статуса, ни обложки. Скрытый объект (снятая обложка / Reserved) печатается
// карточкой «объекты в вашем бюджете» со ссылкой на свою страницу и целиком
// лежит в RSC-payload лендинга. До фикса сюда приходил гейтованный набор.
// код: src/lib/data/projects.ts:69,72 (page.tsx:57) → src/components/calculator/roi-panels.tsx:333-336
describe("АТАКА 47 — скрытые объекты попадают в публичный payload лендинга проекта", () => {
  const project = o({
    id: 1,
    rwNumber: "RW-P0060",
    type: "Project",
    status: "Active",
    titleEn: "Atmos Villas",
    coverImage: "https://r2/cover.jpg",
    priceThb: 10_000_000,
  });
  /** Обложку сняли по правилу медиа — объект обязан быть невидим на сайте. */
  const hidden = o({
    id: 2,
    rwNumber: "RW-V0777",
    type: "Villa",
    status: "Active",
    titleEn: "Villa Off-Market",
    coverImage: undefined,
    priceThb: 10_500_000,
  });
  const reserved = o({
    id: 3,
    rwNumber: "RW-V0778",
    type: "Villa",
    status: "Reserved",
    titleEn: "Villa Reserved",
    coverImage: "https://r2/c.jpg",
    priceThb: 9_800_000,
  });

  it("оба скрытых объекта не проходят каталожный гейт", async () => {
    const { isPubliclyListable } = await import("@/lib/data/objects");
    expect(isPubliclyListable(hidden)).toBe(false);
    expect(isPubliclyListable(reserved)).toBe(false);
  });

  it("но оба лежат в `catalog`, который страница отдаёт пропом в клиент", async () => {
    apiObjects = [project, hidden, reserved];
    const { getProjectBySlug } = await import("@/lib/data/projects");
    const found = await getProjectBySlug("atmos-villas");
    expect(found!.catalog.map((x) => x.rwNumber)).toEqual([
      "RW-P0060",
      "RW-V0777",
      "RW-V0778",
    ]);
  });

  it("и оба проходят отбор SimilarObjects — карточка + ссылка на скрытый объект", async () => {
    apiObjects = [project, hidden, reserved];
    const { getProjectBySlug } = await import("@/lib/data/projects");
    const { catalog } = (await getProjectBySlug("atmos-villas"))!;

    // Ровно предикат из roi-panels.tsx:333-336 на тех же данных.
    const price = project.priceThb!;
    const lo = price * 0.85;
    const hi = price * 1.15;
    const matches = catalog
      .filter((x) => x.rwNumber !== project.rwNumber && x.priceThb && x.priceThb >= lo && x.priceThb <= hi)
      .map((x) => x.rwNumber);

    expect(matches).toEqual(["RW-V0777", "RW-V0778"]);
  });
});

// АТАКА 48 [MEDIUM, ловушка]: `getPublicObjectsUnfiltered()` врёт именем в
// amoCRM-ветке | ОЖИДАЕТСЯ: функция с таким именем возвращает набор БЕЗ гейта в
// любом режиме | ФАКТ: она читает модульный кэш `lastGoodPublic`, а тот в
// ветке без OBJECTS_API_URL заполняется УЖЕ отфильтрованным списком
// (objects.ts:255-263) — «unfiltered» отдаёт гейтованное, и починенный резолв
// лендинга в этом режиме снова отдаёт 404. Прод сейчас на своей БД, поэтому
// расхождение не видно; переключение обратно (или локальный dev на amoCRM)
// молча возвращает АТАКУ 42 второго раунда.
// код: src/lib/data/objects.ts:231-234 против :250-258
describe("АТАКА 48 — «Unfiltered» в amoCRM-ветке отдаёт гейтованный набор", () => {
  const coverStripped = o({
    id: 1,
    rwNumber: "RW-P0070",
    type: "Project",
    status: "Active",
    titleEn: "Legacy Bay",
    coverImage: undefined,
  });

  it("на своей БД негейтованный набор содержит проект без обложки", async () => {
    apiObjects = [coverStripped];
    const { getPublicObjectsUnfiltered } = await import("@/lib/data/objects");
    expect((await getPublicObjectsUnfiltered()).map((x) => x.rwNumber)).toEqual(["RW-P0070"]);
  });

  it("в amoCRM-ветке тот же вызов отдаёт пустоту — и лендинг снова 404", async () => {
    vi.stubEnv("OBJECTS_API_URL", "");
    amoElements = [coverStripped];
    const { getPublicObjectsUnfiltered } = await import("@/lib/data/objects");
    expect(await getPublicObjectsUnfiltered()).toEqual([]);

    const { getProjectBySlug } = await import("@/lib/data/projects");
    expect(await getProjectBySlug("legacy-bay")).toBeNull();
  });
});
