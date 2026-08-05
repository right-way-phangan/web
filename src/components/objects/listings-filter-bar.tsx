"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Route } from "next";
import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { Check, X, ChevronDown, BellPlus, BellRing, SlidersHorizontal } from "lucide-react";
import type { ObjectType, TenureType } from "@/types/object";
import type { ListingsFilter, SortOption, ViewMode } from "@/lib/filters/listings";
import { describeFilter } from "@/lib/filters/listings";
import { useSavedSearches } from "@/lib/saved/saved-searches";
import { useLocale } from "@/lib/i18n/use-locale";
import { getListingsDict } from "@/lib/i18n/dictionaries";
import { CurrencyToggle } from "@/components/ui/currency";
import { cn } from "@/lib/utils/cn";

interface Props {
  current: ListingsFilter;
  options: {
    districts: string[];
    types: ObjectType[];
    hasRentals: boolean;
  };
  totalCount: number;
}

// useLayoutEffect предупреждает при рендере на сервере — там подменяем его
// на useEffect (эффекты в SSR всё равно не выполняются).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const TENURE_OPTIONS: TenureType[] = ["Freehold", "Leasehold"];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

// Price stops in millions of THB (URL params ?pmin / ?pmax are in millions).
const PRICE_STOPS = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
const priceLabel = (m: number) => `฿${m}M`;

// Rent stops in thousands of THB / month (URL params ?rmin / ?rmax are in
// thousands). Land lease is quoted per rai per month — tune as inventory lands.
const RENT_STOPS = [5, 10, 15, 20, 30, 50, 75, 100];

export function ListingsFilterBar({ current, options, totalCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const { has: hasSearch, save: saveSearch, ready: searchesReady } = useSavedSearches();
  const locale = useLocale();
  const dict = getListingsDict(locale);
  const SORT_LABELS: Record<SortOption, string> = {
    featured: dict.sortFeatured,
    newest: dict.sortNewest,
    "price-asc": dict.sortPriceAsc,
    "price-desc": dict.sortPriceDesc,
  };
  // Secondary filters (tenure, views, beds) collapse on mobile to keep the bar
  // short; desktop always shows them via `lg:flex`.
  const [showMore, setShowMore] = useState(false);
  // При прокрутке каталога бар сворачивается в тонкую строку — иначе чипы
  // враппятся в 3-4 ряда и липкая плита закрывает пол-вьюпорта (замер на
  // мобильном: 318px из 844 плюс хедер). Разворот кнопкой «фильтры»
  // прикалывает бар до возврата к верху страницы.
  const [collapsed, setCollapsed] = useState(false);
  // Свёрнутая плита ниже развёрнутой; разницу держит распорка сразу под
  // баром, иначе в момент схлопывания список подпрыгнул бы на эту разницу.
  const [reserve, setReserve] = useState(0);
  const pinnedRef = useRef(false);
  const barRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef(0);
  const flowTopRef = useRef(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const onScroll = () => {
      const stickyTop = parseFloat(getComputedStyle(el).top) || 0;
      const y = window.scrollY;
      const rectTop = el.getBoundingClientRect().top;
      // Пока бар не прилип — запоминаем его место в потоке. Считать через
      // `offsetTop` нельзя: у sticky-элемента он растёт вместе с прокруткой
      // (замер: 358 наверху страницы, 1399 при скролле 1400), из-за чего
      // порог убегал вперёд и бар не сворачивался вовсе.
      if (rectTop > stickyTop + 1) {
        flowTopRef.current = rectTop + y;
        pinnedRef.current = false;
        setCollapsed(false);
        return;
      }
      if (pinnedRef.current) return;
      // Сворачиваем, только когда место бара в потоке целиком ушло за верх
      // экрана: тогда подмена «полный бар → полоса + распорка» происходит вне
      // поля зрения и каталог не дёргается. Заодно это гистерезис.
      if (y > flowTopRef.current - stickyTop + expandedRef.current) setCollapsed(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Замер высот: развёрнутую запоминаем, свёрнутую вычитаем — разница уходит
  // в распорку. Layout-эффект, чтобы подмена случилась до отрисовки кадра.
  useIsoLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    if (collapsed) {
      setReserve(Math.max(0, expandedRef.current - el.offsetHeight));
    } else {
      expandedRef.current = el.offsetHeight;
      setReserve(0);
    }
  });

  // Карта в сплите тоже липкая — без этого её контролы слоёв (Map/Satellite/
  // Terrain, Parcels, Zoning) прилипают на 96px и уезжают под бар. Публикуем
  // фактический низ бара (sticky-top + высота, оба меняются: брейкпоинт,
  // свёрнут/развёрнут, ряд активных чипов), карта прилипает ровно под ним.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const publish = () => {
      const stickyTop = parseFloat(getComputedStyle(el).top) || 0;
      document.documentElement.style.setProperty(
        "--rw-filters-bottom",
        `${Math.round(stickyTop + el.offsetHeight)}px`,
      );
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--rw-filters-bottom");
    };
  }, []);

  function update(mutator: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutator(next);
    const qs = next.toString();
    startTransition(() => {
      const href = (qs ? `${pathname}?${qs}` : pathname) as Route;
      router.replace(href, { scroll: false });
    });
  }

  function toggleMulti(key: string, value: string, currentList: string[]) {
    const set = new Set(currentList);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    update((p) => {
      if (set.size === 0) p.delete(key);
      else p.set(key, [...set].join(","));
    });
  }

  function setSingle(key: string, value: string | undefined) {
    update((p) => {
      if (!value) p.delete(key);
      else p.set(key, value);
    });
  }

  // Buy/Rent switch. Mode is preserved by "Clear all" (it's a view, not a
  // filter), but the *other* mode's price range is dropped on switch so a stale
  // ฿M range never leaks into a ฿/mo view (different orders of magnitude).
  const isRent = current.mode === "rent";
  function setMode(next: ViewMode) {
    update((p) => {
      if (next === "rent") {
        p.set("mode", "rent");
        p.delete("pmin");
        p.delete("pmax");
      } else {
        p.delete("mode");
        p.delete("rmin");
        p.delete("rmax");
      }
    });
  }

  function clearAll() {
    update((p) => {
      [...p.keys()].forEach((k) => p.delete(k));
      // Keep the visitor on the Buy/Rent tab they're viewing.
      if (isRent) p.set("mode", "rent");
    });
  }

  const filtered =
    current.type.length > 0 ||
    current.district.length > 0 ||
    current.tenure.length > 0 ||
    current.bedroomsMin !== undefined ||
    current.priceMinThb !== undefined ||
    current.priceMaxThb !== undefined ||
    current.rentMinThb !== undefined ||
    current.rentMaxThb !== undefined ||
    current.beachfront ||
    current.seaView ||
    current.mountainView ||
    current.sort !== "featured";

  const priceMinM = current.priceMinThb ? current.priceMinThb / 1_000_000 : undefined;
  const priceMaxM = current.priceMaxThb ? current.priceMaxThb / 1_000_000 : undefined;
  const rentMinK = current.rentMinThb ? current.rentMinThb / 1_000 : undefined;
  const rentMaxK = current.rentMaxThb ? current.rentMaxThb / 1_000 : undefined;

  // Demand signal: once a filter selection settles (2.5s after the last change),
  // beacon the snapshot to /api/track-search. Debounced + deduped so dragging
  // through several toggles logs one intent, not every intermediate state. Sort
  // alone isn't demand, so it's excluded from the signature.
  const demandSig = [
    current.mode,
    current.type.join(","),
    current.district.join(","),
    current.tenure.join(","),
    current.bedroomsMin ?? "",
    priceMinM ?? "",
    priceMaxM ?? "",
    rentMinK ?? "",
    rentMaxK ?? "",
    current.beachfront ? "b" : "",
    current.seaView ? "s" : "",
    current.mountainView ? "m" : "",
  ].join("|");
  const hasDemand =
    current.type.length > 0 ||
    current.district.length > 0 ||
    current.tenure.length > 0 ||
    current.bedroomsMin !== undefined ||
    current.priceMinThb !== undefined ||
    current.priceMaxThb !== undefined ||
    current.rentMinThb !== undefined ||
    current.rentMaxThb !== undefined ||
    current.beachfront ||
    current.seaView ||
    current.mountainView;
  const lastSentSig = useRef<string>("");
  useEffect(() => {
    if (!hasDemand || demandSig === lastSentSig.current) return;
    const id = setTimeout(() => {
      lastSentSig.current = demandSig;
      const features: string[] = [];
      if (current.beachfront) features.push("beachfront");
      if (current.seaView) features.push("seaView");
      if (current.mountainView) features.push("mountainView");
      const body = JSON.stringify({
        mode: current.mode,
        types: current.type,
        districts: current.district,
        tenure: current.tenure,
        features,
        priceMinM: priceMinM ?? null,
        priceMaxM: priceMaxM ?? null,
        rentMinK: rentMinK ?? null,
        rentMaxK: rentMaxK ?? null,
        bedroomsMin: current.bedroomsMin ?? null,
        resultCount: totalCount,
        locale,
      });
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/track-search", blob)) {
        fetch("/api/track-search", { method: "POST", body: blob, keepalive: true }).catch(() => {});
      }
    }, 2500);
    return () => clearTimeout(id);
  }, [demandSig, hasDemand, totalCount, locale, current, priceMinM, priceMaxM, rentMinK, rentMaxK]);

  // Saved-search identity ignores sort order (not part of intent), so featured
  // vs price-sorted views of the same filters don't become two saved searches.
  const queryParam = params.get("q") ?? undefined;
  const savedQuery = (() => {
    const p = new URLSearchParams(params.toString());
    p.delete("sort");
    return p.toString();
  })();
  const canSaveSearch = (filtered || Boolean(queryParam)) && savedQuery.length > 0;
  const alreadySaved = searchesReady && hasSearch(savedQuery);

  // How many of the collapsible (secondary) filters are active — shown on the
  // mobile "More filters" toggle so a closed panel still signals active filters.
  const secondaryActiveCount =
    current.tenure.length +
    (current.beachfront ? 1 : 0) +
    (current.seaView ? 1 : 0) +
    (current.mountainView ? 1 : 0) +
    (current.bedroomsMin ? 1 : 0);

  const showBedrooms =
    current.type.length === 0 ||
    current.type.some((t) => ["Villa", "House", "Apartment"].includes(t));

  // Flat list of active filters, each removable on its own (handy for the
  // select-based ones — district, price, beds, sort — that have no quick off).
  const activeFilters: Array<{ key: string; label: string; remove: () => void }> = [
    ...current.type.map((ty) => ({
      key: `type-${ty}`,
      label: dict.types[ty],
      remove: () => toggleMulti("type", ty, current.type),
    })),
    ...current.district.map((d) => ({
      key: `district-${d}`,
      label: d,
      remove: () => toggleMulti("district", d, current.district),
    })),
    ...current.tenure.map((tn) => ({
      key: `tenure-${tn}`,
      label: tn === "Freehold" ? dict.freehold : dict.leasehold,
      remove: () => toggleMulti("tenure", tn, current.tenure),
    })),
    ...(!isRent && priceMinM ? [{ key: "pmin", label: `≥ ฿${priceMinM}M`, remove: () => setSingle("pmin", undefined) }] : []),
    ...(!isRent && priceMaxM ? [{ key: "pmax", label: `≤ ฿${priceMaxM}M`, remove: () => setSingle("pmax", undefined) }] : []),
    ...(isRent && rentMinK ? [{ key: "rmin", label: `≥ ฿${rentMinK}K${dict.perMonthShort}`, remove: () => setSingle("rmin", undefined) }] : []),
    ...(isRent && rentMaxK ? [{ key: "rmax", label: `≤ ฿${rentMaxK}K${dict.perMonthShort}`, remove: () => setSingle("rmax", undefined) }] : []),
    ...(current.bedroomsMin ? [{ key: "beds", label: `${current.bedroomsMin}+ ${dict.bed}`, remove: () => setSingle("bedrooms", undefined) }] : []),
    ...(current.beachfront ? [{ key: "beachfront", label: dict.beachfront, remove: () => setSingle("beachfront", undefined) }] : []),
    ...(current.seaView ? [{ key: "seaview", label: dict.seaView, remove: () => setSingle("seaview", undefined) }] : []),
    ...(current.mountainView ? [{ key: "mountainview", label: dict.mountainView, remove: () => setSingle("mountainview", undefined) }] : []),
    ...(current.sort !== "featured" ? [{ key: "sort", label: `${dict.sort}: ${SORT_LABELS[current.sort]}`, remove: () => setSingle("sort", undefined) }] : []),
  ];

  return (
    <>
    <div
      ref={barRef}
      className={cn(
        "sticky top-16 z-30 -mx-6 mt-8 border-y border-forest-500/10 bg-cream-100/90 px-6 py-4 backdrop-blur-md md:top-20 md:-mx-8 md:px-8",
        collapsed && "py-2 lg:py-2.5",
        pending && "opacity-90",
      )}
    >
      {collapsed ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              pinnedRef.current = true;
              setCollapsed(false);
            }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-1.5 text-xs font-medium text-forest-500 transition-colors hover:border-brass-500/50 hover:text-brass-700 lg:min-h-0"
          >
            <SlidersHorizontal className="h-3 w-3" />
            {dict.filters}
            {activeFilters.length > 0 ? (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-panel px-1 text-[10px] text-panel-fg">
                {activeFilters.length}
              </span>
            ) : null}
            <ChevronDown className="h-3 w-3" />
          </button>
          {/* Свёрнутая полоса — единственное, что видно при прокрутке, поэтому
              счёт результатов переезжает сюда из строки под баром. */}
          <span className="truncate text-xs text-forest-500/60">
            {pending ? dict.updating : dict.matchesCount(totalCount)}
          </span>
        </div>
      ) : null}

      <div className={cn("flex flex-wrap items-center gap-2", collapsed && "hidden")}>
        {/* Buy / Rent — primary mode switch (the market is pivoting to leasehold).
            Hidden when the catalog has no rentals: leaseholds browse under Buy,
            so a lone Rent tab would only ever open a dead empty state. */}
        {options.hasRentals ? (
          <>
            <div
              role="tablist"
              aria-label={dict.viewMode}
              className="inline-flex overflow-hidden rounded-sm border border-forest-500/20 bg-cream-50"
            >
              <ModeTab active={!isRent} onClick={() => setMode("buy")}>
                {dict.buy}
              </ModeTab>
              <ModeTab active={isRent} onClick={() => setMode("rent")}>
                {dict.rent}
              </ModeTab>
            </div>

            <Divider />
          </>
        ) : null}

        {/* Type chips */}
        {options.types.map((ty) => {
          const active = current.type.includes(ty);
          return (
            <Chip
              key={ty}
              active={active}
              onClick={() => toggleMulti("type", ty, current.type)}
            >
              {dict.types[ty]}
            </Chip>
          );
        })}

        <Divider />

        {/* District multi-select */}
        <MultiSelect
          label="District"
          placeholder={dict.anyDistrict}
          districtsNLabel={dict.districtsN}
          clearLabel={dict.clearDistricts}
          selected={current.district}
          options={options.districts}
          onToggle={(d) => toggleMulti("district", d, current.district)}
          onClear={() => setSingle("district", undefined)}
        />

        {/* Price range — sale price (฿M) in Buy mode, monthly rent (฿K/mo) in Rent mode */}
        {isRent ? (
          <>
            <Select
              label={dict.minRent}
              placeholder={dict.minRent}
              value={rentMinK?.toString() ?? ""}
              options={RENT_STOPS.filter((k) => !rentMaxK || k < rentMaxK).map((k) => ({
                value: String(k),
                label: `฿${k}K${dict.perMonthShort}`,
              }))}
              onChange={(v) => setSingle("rmin", v || undefined)}
            />
            <Select
              label={dict.maxRent}
              placeholder={dict.maxRent}
              value={rentMaxK?.toString() ?? ""}
              options={RENT_STOPS.filter((k) => !rentMinK || k > rentMinK).map((k) => ({
                value: String(k),
                label: `฿${k}K${dict.perMonthShort}`,
              }))}
              onChange={(v) => setSingle("rmax", v || undefined)}
            />
          </>
        ) : (
          <>
            <Select
              label={dict.minPrice}
              placeholder={dict.minPrice}
              value={priceMinM?.toString() ?? ""}
              options={PRICE_STOPS.filter((m) => !priceMaxM || m < priceMaxM).map((m) => ({
                value: String(m),
                label: priceLabel(m),
              }))}
              onChange={(v) => setSingle("pmin", v || undefined)}
            />
            <Select
              label={dict.maxPrice}
              placeholder={dict.maxPrice}
              value={priceMaxM?.toString() ?? ""}
              options={PRICE_STOPS.filter((m) => !priceMinM || m > priceMinM).map((m) => ({
                value: String(m),
                label: priceLabel(m),
              }))}
              onChange={(v) => setSingle("pmax", v || undefined)}
            />
          </>
        )}

        {/* Mobile-only toggle for the secondary filters below */}
        <button
          type="button"
          onClick={() => setShowMore((s) => !s)}
          aria-expanded={showMore}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-1.5 text-xs font-medium text-forest-500 lg:hidden"
        >
          <SlidersHorizontal className="h-3 w-3" />
          {dict.more}
          {secondaryActiveCount > 0 ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-panel px-1 text-[10px] text-panel-fg">
              {secondaryActiveCount}
            </span>
          ) : null}
          <ChevronDown className={cn("h-3 w-3 transition-transform", showMore && "rotate-180")} />
        </button>

        {/* Secondary filters — collapsed on mobile, always inline on desktop */}
        <div
          className={cn(
            "w-full flex-wrap items-center gap-2 lg:w-auto lg:flex",
            showMore ? "flex" : "hidden",
          )}
        >
          <Divider />

          {/* Tenure chips */}
          {TENURE_OPTIONS.map((tn) => {
            const active = current.tenure.includes(tn);
            return (
              <Chip
                key={tn}
                active={active}
                onClick={() => toggleMulti("tenure", tn, current.tenure)}
              >
                {tn === "Freehold" ? dict.freehold : dict.leasehold}
              </Chip>
            );
          })}

          <Divider />

          {/* Feature toggles */}
          <Chip
            active={current.beachfront}
            onClick={() => setSingle("beachfront", current.beachfront ? undefined : "1")}
          >
            {dict.beachfront}
          </Chip>
          <Chip
            active={current.seaView}
            onClick={() => setSingle("seaview", current.seaView ? undefined : "1")}
          >
            {dict.seaView}
          </Chip>
          <Chip
            active={current.mountainView}
            onClick={() =>
              setSingle("mountainview", current.mountainView ? undefined : "1")
            }
          >
            {dict.mountainView}
          </Chip>

          {/* Bedrooms (conditional) */}
          {showBedrooms ? (
            <>
              <Divider />
              <Select
                label={dict.anyBeds}
                placeholder={dict.anyBeds}
                value={current.bedroomsMin?.toString() ?? ""}
                options={BEDROOM_OPTIONS.map((n) => ({
                  value: String(n),
                  label: dict.bedsN(n),
                }))}
                onChange={(v) => setSingle("bedrooms", v || undefined)}
              />
            </>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Currency — display only; prices stay THB underneath. Persists
              site-wide (shared rw-currency key with estates/projects). */}
          <CurrencyToggle />

          {/* Sort */}
          <Select
            label={dict.sort}
            title={dict.sortTooltip}
            value={current.sort}
            options={(Object.keys(SORT_LABELS) as SortOption[]).map((s) => ({
              value: s,
              label: SORT_LABELS[s],
            }))}
            onChange={(v) => setSingle("sort", v === "featured" ? undefined : v)}
          />

          {/* Save this search */}
          {canSaveSearch ? (
            <button
              type="button"
              onClick={() =>
                saveSearch(describeFilter(current, queryParam), savedQuery)
              }
              disabled={alreadySaved}
              title={
                alreadySaved
                  ? "Saved — manage it on your Saved page"
                  : "Save this search to revisit it later"
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs transition-colors",
                alreadySaved
                  ? "text-brass-500"
                  : "text-forest-500/70 hover:bg-forest-500/5 hover:text-forest-500",
              )}
            >
              {alreadySaved ? (
                <>
                  <BellRing className="h-3 w-3" />
                  {dict.saved}
                </>
              ) : (
                <>
                  <BellPlus className="h-3 w-3" />
                  {dict.saveSearch}
                </>
              )}
            </button>
          ) : null}

          {/* Clear */}
          {filtered ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs text-forest-500/70 hover:text-forest-500 hover:bg-forest-500/5 transition-colors"
            >
              <X className="h-3 w-3" />
              {dict.clear}
            </button>
          ) : null}
        </div>
      </div>

      {activeFilters.length > 0 && !collapsed ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={f.remove}
              className="inline-flex min-h-11 items-center gap-1 rounded-full bg-forest-500/10 px-3 py-1 text-xs text-forest-500 transition-colors hover:bg-forest-500/20 lg:min-h-0"
              aria-label={`Remove ${f.label}`}
            >
              {f.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}

      {/* The hero subtitle already states the unfiltered total, so only surface
          this line once it carries new information (a filter/sort is active or
          a transition is in flight). */}
      {(filtered || pending) && !collapsed ? (
        <p className="mt-3 text-xs text-forest-500/50">
          {pending
            ? dict.updating
            : `${dict.matchesCount(totalCount)} · ${dict.sortedBy(SORT_LABELS[current.sort])}`}
        </p>
      ) : null}
    </div>
    {/* Распорка на высоту схлопывания — держит поток неподвижным. */}
    {reserve > 0 ? <div aria-hidden style={{ height: reserve }} /> : null}
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors lg:min-h-0",
        active
          ? "border-forest-500 bg-panel text-panel-fg"
          : "border-forest-500/20 bg-cream-50 text-forest-500 hover:border-forest-500/50",
      )}
    >
      {active ? <Check className="h-3 w-3" /> : null}
      {children}
    </button>
  );
}

function Divider() {
  return <span className="hidden h-5 w-px bg-forest-500/10 md:inline-block" />;
}

/** One half of the Buy/Rent segmented control. */
function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500 lg:min-h-0",
        active
          ? "bg-forest-500 text-cream-100"
          : "text-forest-500/70 hover:bg-forest-500/5 hover:text-forest-500",
      )}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  placeholder,
  title,
  value,
  activeCount,
  options,
  onChange,
}: {
  label: string;
  placeholder?: string;
  title?: string;
  value: string;
  activeCount?: number;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative inline-flex items-center" title={title}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 lg:h-8 cursor-pointer appearance-none rounded-sm border border-forest-500/20 bg-cream-50 pl-3 pr-7 text-xs font-medium text-forest-500 hover:border-forest-500/50 focus:outline-none focus:ring-2 focus:ring-forest-500/30",
          (value || (activeCount && activeCount > 0)) && "border-forest-500 bg-forest-500/5",
        )}
      >
        <option value="">{placeholder ?? label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-forest-500/50" />
    </label>
  );
}

/**
 * Checkbox dropdown for multi-value filters (currently District). The URL layer
 * and the filter predicate already support several comma-joined values — this is
 * the control that finally lets a visitor pick more than one.
 */
function MultiSelect({
  label,
  placeholder,
  districtsNLabel,
  clearLabel,
  selected,
  options,
  onToggle,
  onClear,
}: {
  label: string;
  placeholder: string;
  districtsNLabel: (n: number) => string;
  clearLabel: string;
  selected: string[];
  options: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const count = selected.length;
  const buttonLabel =
    count === 0 ? placeholder : count === 1 ? selected[0] : districtsNLabel(count);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-11 lg:h-8 items-center gap-1.5 rounded-sm border bg-cream-50 pl-3 pr-2 text-xs font-medium text-forest-500 hover:border-forest-500/50 focus:outline-none focus:ring-2 focus:ring-forest-500/30",
          count > 0 ? "border-forest-500 bg-forest-500/5" : "border-forest-500/20",
        )}
      >
        {buttonLabel}
        <ChevronDown className="h-3 w-3 text-forest-500/50" />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={label}
          aria-multiselectable
          className="absolute left-0 top-9 z-40 max-h-72 w-56 max-w-[calc(100vw-3rem)] overflow-auto rounded-sm border border-forest-500/20 bg-cream-50 p-1 shadow-lg"
        >
          {count > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="mb-1 flex w-full items-center gap-1 rounded-sm px-2 py-1.5 text-xs text-forest-500/70 hover:bg-forest-500/5 hover:text-forest-500"
            >
              <X className="h-3 w-3" />
              {clearLabel}
            </button>
          ) : null}
          {options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onToggle(opt)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs text-forest-500 hover:bg-forest-500/5"
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border",
                    active
                      ? "border-forest-500 bg-panel text-panel-fg"
                      : "border-forest-500/30",
                  )}
                >
                  {active ? <Check className="h-2.5 w-2.5" /> : null}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
