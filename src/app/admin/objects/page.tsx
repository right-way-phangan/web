import type { Metadata } from "next";
import Link from "next/link";
import { getAllObjects, getPublicObjects } from "@/lib/data/objects";
import { AdminNav } from "@/components/admin/admin-nav";
import { ObjectEditButton } from "@/components/admin/object-edit";
import type { RealEstateObject, ObjectStatus } from "@/types/object";

export const metadata: Metadata = {
  title: "База объектов",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TYPE_TABS = ["All", "Land", "Villa", "House", "Apartment", "Project"] as const;
type TypeTab = (typeof TYPE_TABS)[number];

const STATUS_TABS = ["All", "Active", "Reserved", "Hold", "Sold", "Withdrawn"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_STYLE: Record<ObjectStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-700",
  Reserved: "bg-amber-500/10 text-amber-700",
  Hold: "bg-amber-500/10 text-amber-700",
  Sold: "bg-forest-900/10 text-forest-900/60",
  Withdrawn: "bg-forest-900/5 text-forest-900/40",
};

const SORT_KEYS = ["rw", "type", "status", "price", "area", "photos", "site"] as const;
type SortKey = (typeof SORT_KEYS)[number];

function nf(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function priceValue(o: RealEstateObject): number {
  return o.priceThb ?? o.pricePerRai ?? o.rentPerRaiMonth ?? 0;
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

export default async function ObjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; q?: string; s?: string; sort?: string; dir?: string }>;
}) {
  const sp = await searchParams;
  const [all, publicObjs] = await Promise.all([getAllObjects(), getPublicObjects()]);

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
  const query = (sp.q ?? "").trim().toLowerCase();
  const sortKey: SortKey = (SORT_KEYS as readonly string[]).includes(sp.sort ?? "")
    ? (sp.sort as SortKey)
    : "rw";
  const dir: "asc" | "desc" = sp.dir === "asc" ? "asc" : "desc";

  // Carry current filters into every link; the caller overrides what it changes.
  const baseQuery: Record<string, string> = {
    ...(query ? { q: query } : {}),
    ...(activeType !== "All" ? { t: activeType } : {}),
    ...(activeStatus !== "All" ? { s: activeStatus } : {}),
    ...(sortKey !== "rw" ? { sort: sortKey } : {}),
    ...(dir !== "desc" ? { dir } : {}),
  };

  const rows = all
    .filter((o) => {
      if (activeType !== "All" && o.type !== activeType) return false;
      if (activeStatus !== "All" && o.status !== activeStatus) return false;
      if (query) {
        const hay = `${o.rwNumber} ${o.titleEn ?? ""} ${o.district ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => {
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
        default:
          cmp = a.rwNumber.localeCompare(b.rwNumber);
      }
      if (cmp === 0) cmp = a.rwNumber.localeCompare(b.rwNumber);
      return dir === "asc" ? cmp : -cmp;
    });

  const counts = {
    total: all.length,
    public: publicSet.size,
    units: all.filter((o) => isUnit(o.rwNumber)).length,
  };

  // Header cell that links to sort by `key`, toggling direction when already active.
  function SortTh({ label, k, center }: { label: string; k: SortKey; center?: boolean }) {
    const on = sortKey === k;
    const nextDir = on && dir === "desc" ? "asc" : "desc";
    const q = { ...baseQuery, sort: k, dir: nextDir };
    if (k === "rw") delete (q as Record<string, string>).sort;
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

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="objects" />

      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · База
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Объекты</h1>
        <p className="mt-1 text-sm text-forest-900/60">
          {counts.total} в базе · {counts.public} публичных (Active + фото) · {counts.units} off-plan
          юнитов. Источник — своя БД (Neon). Зелёная точка = виден на сайте.
        </p>
      </div>

      {/* Type tabs + search */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {TYPE_TABS.map((tab) => {
          const n = tab === "All" ? all.length : all.filter((o) => o.type === tab).length;
          const on = tab === activeType;
          const q = { ...baseQuery, t: tab };
          if (tab === "All") delete (q as Record<string, string>).t;
          return (
            <Link
              key={tab}
              href={{ pathname: "/admin/objects", query: q }}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                (on
                  ? "bg-forest-900 text-white"
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
          {sortKey !== "rw" && <input type="hidden" name="sort" value={sortKey} />}
          {dir !== "desc" && <input type="hidden" name="dir" value={dir} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="RW / название / район…"
            className="w-56 rounded-full border border-forest-900/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-brass-500"
          />
        </form>
      </div>

      {/* Status filter */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs uppercase tracking-wide text-forest-900/40">Статус:</span>
        {STATUS_TABS.map((st) => {
          const n =
            st === "All" ? all.length : all.filter((o) => o.status === st).length;
          const on = st === activeStatus;
          const q = { ...baseQuery, s: st };
          if (st === "All") delete (q as Record<string, string>).s;
          return (
            <Link
              key={st}
              href={{ pathname: "/admin/objects", query: q }}
              className={
                "rounded-full px-2.5 py-1 text-xs font-medium transition " +
                (on
                  ? "bg-brass-500 text-white"
                  : "bg-forest-900/5 text-forest-900/60 hover:bg-forest-900/10")
              }
            >
              {st} <span className="opacity-60">({n})</span>
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-forest-900/10">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 bg-forest-900/[0.03] text-left text-xs uppercase tracking-wide text-forest-900/50">
              <SortTh label="RW" k="rw" />
              <th className="px-3 py-2 font-medium">Название</th>
              <SortTh label="Тип" k="type" />
              <SortTh label="Статус" k="status" />
              <th className="px-3 py-2 font-medium">Район</th>
              <SortTh label="Цена" k="price" />
              <SortTh label="Площадь" k="area" />
              <SortTh label="Фото" k="photos" center />
              <SortTh label="Сайт" k="site" center />
              <th className="px-3 py-2 text-center font-medium">Правка</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-sm text-forest-900/40">
                  Ничего не найдено.
                </td>
              </tr>
            ) : (
              rows.map((o) => {
                const isPublic = publicSet.has(o.rwNumber);
                const photos = photoCount(o);
                return (
                  <tr
                    key={o.rwNumber}
                    className={
                      "border-b border-forest-900/5 hover:bg-brass-500/[0.04] " +
                      (isUnit(o.rwNumber) ? "bg-forest-900/[0.015]" : "")
                    }
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-medium text-forest-900">
                      {isPublic ? (
                        <Link
                          href={`/object/${o.rwNumber}`}
                          className="text-brass-600 hover:underline"
                        >
                          {o.rwNumber}
                        </Link>
                      ) : (
                        o.rwNumber
                      )}
                    </td>
                    <td className="max-w-[280px] px-3 py-2">
                      <span className="line-clamp-1 text-forest-900/85">{o.titleEn || "—"}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-forest-900/70">{o.type}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={
                          "rounded px-1.5 py-0.5 text-[11px] font-medium " +
                          (STATUS_STYLE[o.status] ?? "bg-forest-900/5 text-forest-900/50")
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-forest-900/65">
                      {o.district || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-forest-900/80">{fmtPrice(o)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-forest-900/65">{fmtArea(o)}</td>
                    <td className="px-3 py-2 text-center text-forest-900/60">{photos || "—"}</td>
                    <td className="px-3 py-2 text-center">
                      {isPublic ? (
                        <span
                          title="Виден на сайте"
                          className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
                        />
                      ) : (
                        <span
                          title="Скрыт (не Active или без фото)"
                          className="inline-block h-2.5 w-2.5 rounded-full bg-forest-900/15"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <ObjectEditButton
                        object={{
                          rwNumber: o.rwNumber,
                          type: o.type,
                          status: o.status,
                          titleEn: o.titleEn,
                          district: o.district,
                          priceThb: o.priceThb,
                          pricePerRai: o.pricePerRai,
                          rentPerRaiMonth: o.rentPerRaiMonth,
                          leaseTermYears: o.leaseTermYears,
                          unitsAvailable: o.unitsAvailable,
                          locationUrl: o.locationUrl,
                        }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-forest-900/45">
        Показано {rows.length} из {all.length}. Правка прямо в таблице (кнопка ✎) или через бота{" "}
        <code className="rounded bg-forest-900/5 px-1">/edit RW-XXXX</code>. Скрытые объекты
        вернутся на сайт автоматически после заливки фото.
      </p>
    </section>
  );
}
