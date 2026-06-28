import type { Metadata } from "next";
import Link from "next/link";
import { getAllObjects, getPublicObjects } from "@/lib/data/objects";
import { getLeads } from "@/lib/data/leads";
import { getViewsByRw } from "@/lib/data/views";
import { getEngagementByRw } from "@/lib/data/events";
import { AdminNav } from "@/components/admin/admin-nav";
import { ObjectsTable, type AdminObjectRow } from "@/components/admin/objects-table";
import type { RealEstateObject } from "@/types/object";

export const metadata: Metadata = {
  title: "База объектов",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const TYPE_TABS = ["All", "Land", "Villa", "House", "Apartment", "Project"] as const;
type TypeTab = (typeof TYPE_TABS)[number];

const STATUS_TABS = ["All", "Active", "Reserved", "Hold", "Sold", "Withdrawn"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const VIS_TABS = [
  { key: "all", label: "Все" },
  { key: "site", label: "На сайте" },
  { key: "hidden", label: "Скрытые" },
  { key: "nophoto", label: "Без фото" },
] as const;
type VisTab = (typeof VIS_TABS)[number]["key"];

const SORT_KEYS = ["rw", "type", "status", "price", "area", "photos", "site", "views", "interest"] as const;
type SortKey = (typeof SORT_KEYS)[number];

function nf(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}
function priceValue(o: RealEstateObject): number {
  return o.priceThb ?? o.pricePerRai ?? o.rentPerMonth ?? o.rentPerRaiMonth ?? 0;
}
function areaValue(o: RealEstateObject): number {
  return o.areaSqm ?? (o.areaRai ? o.areaRai * 1600 : 0);
}
function photoCount(o: RealEstateObject): number {
  return (o.gallery?.length ?? 0) + (o.coverImage ? 1 : 0);
}
function fmtPrice(o: RealEstateObject): string {
  if (o.priceThb) return `฿${nf(o.priceThb)}`;
  if (o.pricePerRai) return `฿${nf(o.pricePerRai)}/rai`;
  if (o.rentPerMonth) return `฿${nf(o.rentPerMonth)}/mo`;
  if (o.rentPerRaiMonth) return `฿${nf(o.rentPerRaiMonth)}/rai·mo`;
  return "—";
}
function fmtArea(o: RealEstateObject): string {
  if (o.areaRai) return `${o.areaRai} rai`;
  if (o.areaSqm) return `${nf(o.areaSqm)} m²`;
  return "—";
}
/** Off-plan unit sub-cards look like RW-P0001-3 (parent + "-N"). */
function isUnit(rw: string): boolean {
  return /^RW-P\d+-\d+$/i.test(rw);
}

/** Короткий ярлык основного контакта (имя · телефон/канал) для тултипа в таблице. */
function primaryContactLabel(o: RealEstateObject): string | null {
  const list = o.contacts ?? [];
  if (list.length === 0) return null;
  const c = list.find((x) => x.isPrimary) ?? list[0];
  const channel = c.phone || c.line || c.whatsapp || c.telegram;
  return [c.name, channel].filter(Boolean).join(" · ") || "Контакт без имени";
}

export default async function ObjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    t?: string;
    q?: string;
    s?: string;
    v?: string;
    sort?: string;
    dir?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const [all, publicObjs, leads, viewsByRw, engagementByRw] = await Promise.all([
    getAllObjects(),
    getPublicObjects(),
    getLeads(),
    getViewsByRw(),
    getEngagementByRw(),
  ]);

  // How many leads reference each object (by RW) — object→leads link.
  const leadsByRw = new Map<string, number>();
  for (const l of leads) {
    if (l.rwNumber) leadsByRw.set(l.rwNumber, (leadsByRw.get(l.rwNumber) ?? 0) + 1);
  }

  if (all.length === 0) {
    return (
      <section className="px-4 py-8 md:px-8">
        <AdminNav active="objects" />
        <h1 className="text-2xl font-semibold text-forest-900">База объектов</h1>
        <p className="mt-3 max-w-xl text-sm text-forest-900/70">
          Источник объектов не отвечает. Проверьте{" "}
          <code className="rounded bg-forest-900/5 px-1">OBJECTS_API_URL</code> на backend-API.
        </p>
      </section>
    );
  }

  const publicSet = new Set(publicObjs.map((o) => o.rwNumber));
  const activeType: TypeTab = (TYPE_TABS as readonly string[]).includes(sp.t ?? "")
    ? (sp.t as TypeTab)
    : "All";
  const activeStatus: StatusTab = (STATUS_TABS as readonly string[]).includes(sp.s ?? "")
    ? (sp.s as StatusTab)
    : "All";
  const activeVis: VisTab = VIS_TABS.some((v) => v.key === sp.v) ? (sp.v as VisTab) : "all";
  const query = (sp.q ?? "").trim().toLowerCase();
  const sortKey: SortKey = (SORT_KEYS as readonly string[]).includes(sp.sort ?? "")
    ? (sp.sort as SortKey)
    : "rw";
  const dir: "asc" | "desc" = sp.dir === "asc" ? "asc" : "desc";

  // Filters that survive across tab/sort/pagination links (page reset on change).
  const filterQuery: Record<string, string> = {
    ...(query ? { q: query } : {}),
    ...(activeType !== "All" ? { t: activeType } : {}),
    ...(activeStatus !== "All" ? { s: activeStatus } : {}),
    ...(activeVis !== "all" ? { v: activeVis } : {}),
    ...(sortKey !== "rw" ? { sort: sortKey } : {}),
    ...(dir !== "desc" ? { dir } : {}),
  };

  // Base = type + status + search (visibility tab counts are relative to this).
  const base = all.filter((o) => {
    if (activeType !== "All" && o.type !== activeType) return false;
    if (activeStatus !== "All" && o.status !== activeStatus) return false;
    if (query) {
      const hay = `${o.rwNumber} ${o.titleEn ?? ""} ${o.district ?? ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const visMatch = (o: RealEstateObject): boolean => {
    const pub = publicSet.has(o.rwNumber);
    switch (activeVis) {
      case "site":
        return pub;
      case "hidden":
        return !pub;
      case "nophoto":
        return photoCount(o) === 0;
      default:
        return true;
    }
  };
  const visCounts = {
    all: base.length,
    site: base.filter((o) => publicSet.has(o.rwNumber)).length,
    hidden: base.filter((o) => !publicSet.has(o.rwNumber)).length,
    nophoto: base.filter((o) => photoCount(o) === 0).length,
  };

  const filtered = base.filter(visMatch).sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "type":
        cmp = a.type.localeCompare(b.type);
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "price":
        cmp = priceValue(a) - priceValue(b);
        break;
      case "area":
        cmp = areaValue(a) - areaValue(b);
        break;
      case "photos":
        cmp = photoCount(a) - photoCount(b);
        break;
      case "site":
        cmp = Number(publicSet.has(a.rwNumber)) - Number(publicSet.has(b.rwNumber));
        break;
      case "views":
        cmp =
          (viewsByRw.get(a.rwNumber)?.d30 ?? 0) - (viewsByRw.get(b.rwNumber)?.d30 ?? 0);
        break;
      case "interest":
        cmp =
          (engagementByRw.get(a.rwNumber)?.score ?? 0) - (engagementByRw.get(b.rwNumber)?.score ?? 0);
        break;
      default:
        cmp = a.rwNumber.localeCompare(b.rwNumber);
    }
    if (cmp === 0) cmp = a.rwNumber.localeCompare(b.rwNumber);
    return dir === "asc" ? cmp : -cmp;
  });

  // Pagination.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), totalPages);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const rows: AdminObjectRow[] = pageRows.map((o) => ({
    rwNumber: o.rwNumber,
    type: o.type,
    status: o.status,
    titleEn: o.titleEn,
    district: o.district,
    priceText: fmtPrice(o),
    areaText: fmtArea(o),
    photos: photoCount(o),
    isPublic: publicSet.has(o.rwNumber),
    isUnit: isUnit(o.rwNumber),
    contactCount: o.contacts?.length ?? 0,
    contactLabel: primaryContactLabel(o),
    leadCount: leadsByRw.get(o.rwNumber) ?? 0,
    views7: viewsByRw.get(o.rwNumber)?.d7 ?? 0,
    views30: viewsByRw.get(o.rwNumber)?.d30 ?? 0,
    uniques30: viewsByRw.get(o.rwNumber)?.uniques30 ?? 0,
    engagement: engagementByRw.get(o.rwNumber)?.score ?? 0,
    clicks30: engagementByRw.get(o.rwNumber)?.clicks ?? 0,
    priceThb: o.priceThb,
    pricePerRai: o.pricePerRai,
    rentPerRaiMonth: o.rentPerRaiMonth,
    rentPerMonth: o.rentPerMonth,
    leaseTermYears: o.leaseTermYears,
    unitsAvailable: o.unitsAvailable,
    locationUrl: o.locationUrl,
    plotPolygon: o.plotPolygon,
    descriptionManualEn: o.descriptionManualEn,
    descriptionManualRu: o.descriptionManualRu,
  }));

  const counts = {
    total: all.length,
    public: publicSet.size,
    units: all.filter((o) => isUnit(o.rwNumber)).length,
  };

  // Триаж «требуют внимания» — из уже загруженных счётчиков (без доп. запросов).
  //  • Смотрят, но не реагируют: заметные просмотры за 30д, ноль engagement и
  //    ни одного лида → сигнал цены/презентации.
  //  • На сайте, но не смотрят: публичный Active с нулём просмотров за 30д →
  //    сигнал видимости/обложки/SEO. Рендерим, только если что-то нашлось.
  const VIEWS_HI = 10; // порог «заметных» просмотров за 30д (низкий трафик старта)
  const activeObjs = all.filter((o) => o.status === "Active" && !isUnit(o.rwNumber));
  const attentionNoAction = activeObjs
    .filter(
      (o) =>
        (viewsByRw.get(o.rwNumber)?.d30 ?? 0) >= VIEWS_HI &&
        (engagementByRw.get(o.rwNumber)?.score ?? 0) === 0 &&
        (leadsByRw.get(o.rwNumber) ?? 0) === 0,
    )
    .sort((a, b) => (viewsByRw.get(b.rwNumber)?.d30 ?? 0) - (viewsByRw.get(a.rwNumber)?.d30 ?? 0))
    .slice(0, 8);
  const onSiteNoViews = activeObjs
    .filter((o) => publicSet.has(o.rwNumber) && (viewsByRw.get(o.rwNumber)?.d30 ?? 0) === 0)
    .sort((a, b) => a.rwNumber.localeCompare(b.rwNumber))
    .slice(0, 8);

  // Sortable header cell — links toggle direction; changing sort resets page.
  function SortTh({ label, k, center }: { label: string; k: SortKey; center?: boolean }) {
    const on = sortKey === k;
    const nextDir = on && dir === "desc" ? "asc" : "desc";
    const q: Record<string, string> = { ...filterQuery, sort: k, dir: nextDir };
    if (k === "rw") delete q.sort;
    return (
      <th className={"px-3 py-2 font-medium " + (center ? "text-center" : "")}>
        <Link
          href={{ pathname: "/admin/objects", query: q }}
          className="inline-flex items-center gap-1 hover:text-forest-900"
        >
          {label}
          <span className={on ? "text-brass-600" : "text-forest-900/20"}>
            {on ? (dir === "asc" ? "▲" : "▼") : "↕"}
          </span>
        </Link>
      </th>
    );
  }

  const headerCells = (
    <>
      <SortTh label="RW" k="rw" />
      <th className="px-3 py-2 font-medium">Название</th>
      <SortTh label="Тип" k="type" />
      <SortTh label="Статус" k="status" />
      <th className="px-3 py-2 font-medium">Район</th>
      <SortTh label="Цена" k="price" />
      <SortTh label="Площадь" k="area" />
      <SortTh label="Фото" k="photos" center />
      <SortTh label="Сайт" k="site" center />
      <SortTh label="👁 7д/30д" k="views" center />
      <SortTh label="★ Интерес" k="interest" center />
    </>
  );

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="objects" />

      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">Admin · База</p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Объекты</h1>
        <p className="mt-1 text-sm text-forest-900/60">
          {counts.total} в базе · {counts.public} публичных (Active + фото) · {counts.units} off-plan
          юнитов. Источник — своя БД (Neon). Зелёная точка = виден на сайте.
        </p>
      </div>

      {/* Триаж: объекты, требующие внимания (из счётчиков сайта за 30д) */}
      {(attentionNoAction.length > 0 || onSiteNoViews.length > 0) && (
        <div className="mb-6 rounded-2xl border border-brass-500/30 bg-brass-500/[0.06] p-5">
          <h2 className="text-lg font-semibold text-forest-900">🔧 Требуют внимания</h2>
          <p className="mb-3 text-xs text-forest-900/55">
            Слабые места каталога по данным сайта за 30 дней — не алерт, а повод заглянуть. Ссылка
            открывает страницу так, как её видит клиент.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {attentionNoAction.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-forest-900/80">
                  Смотрят, но не реагируют → цена / фото
                </h3>
                <div className="space-y-1.5">
                  {attentionNoAction.map((o) => (
                    <a
                      key={o.rwNumber}
                      href={`/object/${o.rwNumber}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-forest-900/10 bg-cream-50 px-3 py-1.5 text-sm hover:border-brass-500/40"
                    >
                      <span className="min-w-0 truncate">
                        <span className="font-medium text-forest-900">{o.rwNumber}</span>
                        {o.district ? <span className="ml-2 text-xs text-forest-900/50">{o.district}</span> : null}
                      </span>
                      <span className="shrink-0 text-xs text-forest-900/55">
                        {viewsByRw.get(o.rwNumber)?.d30 ?? 0} 👁 · 0 реакций
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {onSiteNoViews.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-forest-900/80">
                  На сайте, но не смотрят → видимость / обложка
                </h3>
                <div className="space-y-1.5">
                  {onSiteNoViews.map((o) => (
                    <a
                      key={o.rwNumber}
                      href={`/object/${o.rwNumber}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-forest-900/10 bg-cream-50 px-3 py-1.5 text-sm hover:border-brass-500/40"
                    >
                      <span className="min-w-0 truncate">
                        <span className="font-medium text-forest-900">{o.rwNumber}</span>
                        {o.district ? <span className="ml-2 text-xs text-forest-900/50">{o.district}</span> : null}
                      </span>
                      <span className="shrink-0 text-xs text-forest-900/45">0 👁 за 30д</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Type tabs + search */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {TYPE_TABS.map((tab) => {
          const n = tab === "All" ? all.length : all.filter((o) => o.type === tab).length;
          const on = tab === activeType;
          const q: Record<string, string> = { ...filterQuery, t: tab };
          if (tab === "All") delete q.t;
          return (
            <Link
              key={tab}
              href={{ pathname: "/admin/objects", query: q }}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                (on
                  ? "bg-panel text-panel-fg"
                  : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
              }
            >
              {tab} <span className="opacity-60">({n})</span>
            </Link>
          );
        })}
        <form action="/admin/objects" className="ml-auto flex items-center gap-2">
          {activeType !== "All" && <input type="hidden" name="t" value={activeType} />}
          {activeStatus !== "All" && <input type="hidden" name="s" value={activeStatus} />}
          {activeVis !== "all" && <input type="hidden" name="v" value={activeVis} />}
          {sortKey !== "rw" && <input type="hidden" name="sort" value={sortKey} />}
          {dir !== "desc" && <input type="hidden" name="dir" value={dir} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="RW / название / район…"
            className="w-56 rounded-full border border-forest-900/15 bg-cream-50 px-3 py-1.5 text-sm outline-none focus:border-brass-500"
          />
        </form>
      </div>

      {/* Status + visibility filters */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs uppercase tracking-wide text-forest-900/40">Статус:</span>
          {STATUS_TABS.map((st) => {
            const n = st === "All" ? all.length : all.filter((o) => o.status === st).length;
            const on = st === activeStatus;
            const q: Record<string, string> = { ...filterQuery, s: st };
            if (st === "All") delete q.s;
            return (
              <Link
                key={st}
                href={{ pathname: "/admin/objects", query: q }}
                className={
                  "rounded-full px-2.5 py-1 text-xs font-medium transition " +
                  (on
                    ? "bg-brass-500 text-panel-fg"
                    : "bg-forest-900/5 text-forest-900/60 hover:bg-forest-900/10")
                }
              >
                {st} <span className="opacity-60">({n})</span>
              </Link>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs uppercase tracking-wide text-forest-900/40">Видимость:</span>
          {VIS_TABS.map((vt) => {
            const on = vt.key === activeVis;
            const q: Record<string, string> = { ...filterQuery, v: vt.key };
            if (vt.key === "all") delete q.v;
            return (
              <Link
                key={vt.key}
                href={{ pathname: "/admin/objects", query: q }}
                className={
                  "rounded-full px-2.5 py-1 text-xs font-medium transition " +
                  (on
                    ? "bg-panel text-panel-fg"
                    : "bg-forest-900/5 text-forest-900/60 hover:bg-forest-900/10")
                }
              >
                {vt.label} <span className="opacity-60">({visCounts[vt.key]})</span>
              </Link>
            );
          })}
        </div>
      </div>

      <ObjectsTable rows={rows} headerCells={headerCells} />

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-xs text-forest-900/55">
        <span>
          Показано {pageRows.length} из {filtered.length}
          {filtered.length !== all.length ? ` (всего ${all.length})` : ""}.
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {page > 1 && (
              <Link
                href={{ pathname: "/admin/objects", query: { ...filterQuery, page: String(page - 1) } }}
                className="rounded-md border border-forest-900/15 px-2.5 py-1 hover:bg-forest-900/5"
              >
                ← Назад
              </Link>
            )}
            <span className="px-1">
              Стр. {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={{ pathname: "/admin/objects", query: { ...filterQuery, page: String(page + 1) } }}
                className="rounded-md border border-forest-900/15 px-2.5 py-1 hover:bg-forest-900/5"
              >
                Вперёд →
              </Link>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-forest-900/45">
        Правка прямо в таблице (✎), выделение строк для массовой смены статуса, либо бот{" "}
        <code className="rounded bg-forest-900/5 px-1">/edit RW-XXXX</code>. Скрытые объекты
        вернутся на сайт автоматически после заливки фото.
      </p>
    </section>
  );
}
