import type { Metadata } from "next";
import Link from "next/link";
import { getAllObjects, getPublicObjects } from "@/lib/data/objects";
import { AdminNav } from "@/components/admin/admin-nav";
import type { RealEstateObject, ObjectStatus } from "@/types/object";

export const metadata: Metadata = {
  title: "База объектов",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TYPE_TABS = ["All", "Land", "Villa", "House", "Apartment", "Project"] as const;
type TypeTab = (typeof TYPE_TABS)[number];

const STATUS_STYLE: Record<ObjectStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-700",
  Reserved: "bg-amber-500/10 text-amber-700",
  Hold: "bg-amber-500/10 text-amber-700",
  Sold: "bg-forest-900/10 text-forest-900/60",
  Withdrawn: "bg-forest-900/5 text-forest-900/40",
};

function nf(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
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
  searchParams: Promise<{ t?: string; q?: string }>;
}) {
  const { t, q } = await searchParams;
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
  const activeType: TypeTab = (TYPE_TABS as readonly string[]).includes(t ?? "")
    ? (t as TypeTab)
    : "All";
  const query = (q ?? "").trim().toLowerCase();

  // Newest first by RW number within type, parents before their units.
  const sorted = [...all].sort((a, b) => b.rwNumber.localeCompare(a.rwNumber));

  const rows = sorted.filter((o) => {
    if (activeType !== "All" && o.type !== activeType) return false;
    if (query) {
      const hay = `${o.rwNumber} ${o.titleEn ?? ""} ${o.district ?? ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const counts = {
    total: all.length,
    public: publicSet.size,
    units: all.filter((o) => isUnit(o.rwNumber)).length,
  };

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
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TYPE_TABS.map((tab) => {
          const n = tab === "All" ? all.length : all.filter((o) => o.type === tab).length;
          const on = tab === activeType;
          return (
            <Link
              key={tab}
              href={{ pathname: "/admin/objects", query: { ...(query ? { q: query } : {}), t: tab } }}
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
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="RW / название / район…"
            className="w-56 rounded-full border border-forest-900/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-brass-500"
          />
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-forest-900/10">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 bg-forest-900/[0.03] text-left text-xs uppercase tracking-wide text-forest-900/50">
              <th className="px-3 py-2 font-medium">RW</th>
              <th className="px-3 py-2 font-medium">Название</th>
              <th className="px-3 py-2 font-medium">Тип</th>
              <th className="px-3 py-2 font-medium">Статус</th>
              <th className="px-3 py-2 font-medium">Район</th>
              <th className="px-3 py-2 font-medium">Цена</th>
              <th className="px-3 py-2 font-medium">Площадь</th>
              <th className="px-3 py-2 text-center font-medium">Фото</th>
              <th className="px-3 py-2 text-center font-medium">Сайт</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-forest-900/40">
                  Ничего не найдено.
                </td>
              </tr>
            ) : (
              rows.map((o) => {
                const isPublic = publicSet.has(o.rwNumber);
                const photos = (o.gallery?.length ?? 0) + (o.coverImage ? 1 : 0);
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-forest-900/45">
        Показано {rows.length} из {all.length}. Редактирование — через бота{" "}
        <code className="rounded bg-forest-900/5 px-1">/edit RW-XXXX</code> или форму{" "}
        <Link href="/admin/new" className="text-brass-600 hover:underline">
          /admin/new
        </Link>
        . Скрытые объекты вернутся на сайт автоматически после заливки фото.
      </p>
    </section>
  );
}
