import type { Metadata } from "next";
import { getPublicObjects, slimObjectForList } from "@/lib/data/objects";
import { ItemListJsonLd } from "@/components/seo/item-list-json-ld";
import { isProjectUnit } from "@/lib/data/projects";
import { ListingsFilterBar } from "@/components/objects/listings-filter-bar";
import { ListingsEmpty } from "@/components/objects/listings-empty";
import { ListingsSplit } from "@/components/objects/listings-split";
import { NlSearch } from "@/components/objects/nl-search";
import { RecentlyViewed } from "@/components/objects/recently-viewed";
import { getListingsDict } from "@/lib/i18n/dictionaries";
import {
  parseListingsSearchParams,
  makeFilterPredicate,
  applySort,
  deriveFilterOptions,
  isFiltered,
  summarizeForBrief,
} from "@/lib/filters/listings";

export const metadata: Metadata = {
  title: "Объекты",
  description:
    "Все активные объекты на Ко Пангане: земля, виллы и дома. Фильтр по району, типу и ключевым характеристикам.",
  alternates: { canonical: "/ru/listings", languages: { en: "/listings", ru: "/ru/listings", "x-default": "/listings" } },
};

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RussianListingsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter = parseListingsSearchParams(sp);
  const t = getListingsDict("ru");

  // Проекты застройщиков (off-plan, RW-P) и их юниты (RW-P####-N) живут в
  // отдельном разделе /projects — в общую сетку объектов их не включаем.
  // Slim once at the source so sorted/filtered share the same instances —
  // mapping per-prop would break reference sharing and double the RSC payload.
  const all = (await getPublicObjects())
    .filter((o) => o.type !== "Project" && !isProjectUnit(o.rwNumber))
    .map(slimObjectForList);
  const options = deriveFilterOptions(all);
  const filtered = all.filter(makeFilterPredicate(filter));
  const sorted = applySort(filtered, filter.sort);
  const isAnyFilter = isFiltered(filter);
  const qRaw = sp.q;
  const q = (Array.isArray(qRaw) ? qRaw[0] : qRaw) ?? "";

  return (
    <section className="container-prose py-10 md:py-14">
      <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://b.basemaps.cartocdn.com" />
      <ItemListJsonLd name="Объекты недвижимости на Пангане — Right Way" objects={sorted} />
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">{t.eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-balance scroll-mt-24">{t.title}</h1>
      <p className="mt-3 max-w-xl text-base text-forest-500/70">
        {isAnyFilter ? t.matches(sorted.length, all.length) : t.ready(all.length)}
      </p>

      <div className="mt-5">
        <NlSearch initialQuery={q} />
      </div>

      <ListingsFilterBar current={filter} options={options} totalCount={sorted.length} />

      {sorted.length === 0 ? (
        <ListingsEmpty
          filtered={isAnyFilter}
          clearHref="/ru/listings"
          briefMessage={summarizeForBrief(filter, q)}
        />
      ) : (
        <ListingsSplit objects={sorted} />
      )}

      <RecentlyViewed catalog={all} />
    </section>
  );
}
