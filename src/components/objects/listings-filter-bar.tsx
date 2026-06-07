"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Route } from "next";
import { useTransition } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import type { ObjectType, TenureType } from "@/types/object";
import type { ListingsFilter, SortOption } from "@/lib/filters/listings";
import { cn } from "@/lib/utils/cn";

interface Props {
  current: ListingsFilter;
  options: {
    districts: string[];
    types: ObjectType[];
  };
  totalCount: number;
}

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
};

const TENURE_OPTIONS: TenureType[] = ["Freehold", "Leasehold"];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

// Price stops in millions of THB (URL params ?pmin / ?pmax are in millions).
const PRICE_STOPS = [5, 10, 20, 30, 50, 75, 100];
const priceLabel = (m: number) => `฿${m}M`;

export function ListingsFilterBar({ current, options, totalCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

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
    set.has(value) ? set.delete(value) : set.add(value);
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

  function clearAll() {
    update((p) => {
      [...p.keys()].forEach((k) => p.delete(k));
    });
  }

  const filtered =
    current.type.length > 0 ||
    current.district.length > 0 ||
    current.tenure.length > 0 ||
    current.bedroomsMin !== undefined ||
    current.priceMinThb !== undefined ||
    current.priceMaxThb !== undefined ||
    current.beachfront ||
    current.seaView ||
    current.mountainView ||
    current.sort !== "featured";

  const priceMinM = current.priceMinThb ? current.priceMinThb / 1_000_000 : undefined;
  const priceMaxM = current.priceMaxThb ? current.priceMaxThb / 1_000_000 : undefined;

  const showBedrooms =
    current.type.length === 0 ||
    current.type.some((t) => ["Villa", "House", "Apartment"].includes(t));

  // Flat list of active filters, each removable on its own (handy for the
  // select-based ones — district, price, beds, sort — that have no quick off).
  const activeFilters: Array<{ key: string; label: string; remove: () => void }> = [
    ...current.type.map((t) => ({
      key: `type-${t}`,
      label: t,
      remove: () => toggleMulti("type", t, current.type),
    })),
    ...current.district.map((d) => ({
      key: `district-${d}`,
      label: d,
      remove: () => setSingle("district", undefined),
    })),
    ...current.tenure.map((t) => ({
      key: `tenure-${t}`,
      label: t,
      remove: () => toggleMulti("tenure", t, current.tenure),
    })),
    ...(priceMinM ? [{ key: "pmin", label: `≥ ฿${priceMinM}M`, remove: () => setSingle("pmin", undefined) }] : []),
    ...(priceMaxM ? [{ key: "pmax", label: `≤ ฿${priceMaxM}M`, remove: () => setSingle("pmax", undefined) }] : []),
    ...(current.bedroomsMin ? [{ key: "beds", label: `${current.bedroomsMin}+ bed`, remove: () => setSingle("bedrooms", undefined) }] : []),
    ...(current.beachfront ? [{ key: "beachfront", label: "Beachfront", remove: () => setSingle("beachfront", undefined) }] : []),
    ...(current.seaView ? [{ key: "seaview", label: "Sea view", remove: () => setSingle("seaview", undefined) }] : []),
    ...(current.mountainView ? [{ key: "mountainview", label: "Mountain view", remove: () => setSingle("mountainview", undefined) }] : []),
    ...(current.sort !== "featured" ? [{ key: "sort", label: `Sort: ${SORT_LABELS[current.sort]}`, remove: () => setSingle("sort", undefined) }] : []),
  ];

  return (
    <div
      className={cn(
        "sticky top-16 z-30 -mx-6 mt-8 border-y border-forest-500/10 bg-cream-100/90 px-6 py-4 backdrop-blur-md md:top-20 md:-mx-8 md:px-8",
        pending && "opacity-90",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Type chips */}
        {options.types.map((t) => {
          const active = current.type.includes(t);
          return (
            <Chip
              key={t}
              active={active}
              onClick={() => toggleMulti("type", t, current.type)}
            >
              {t}
            </Chip>
          );
        })}

        <Divider />

        {/* District multi-select */}
        <Select
          label="District"
          placeholder="Any district"
          value={current.district[0] ?? ""}
          activeCount={current.district.length}
          options={options.districts.map((d) => ({ value: d, label: d }))}
          onChange={(v) => {
            update((p) => {
              if (!v) p.delete("district");
              else p.set("district", v);
            });
          }}
        />

        {/* Price range (millions THB) */}
        <Select
          label="Min price"
          placeholder="Min ฿"
          value={priceMinM?.toString() ?? ""}
          options={PRICE_STOPS.filter((m) => !priceMaxM || m < priceMaxM).map((m) => ({
            value: String(m),
            label: priceLabel(m),
          }))}
          onChange={(v) => setSingle("pmin", v || undefined)}
        />
        <Select
          label="Max price"
          placeholder="Max ฿"
          value={priceMaxM?.toString() ?? ""}
          options={PRICE_STOPS.filter((m) => !priceMinM || m > priceMinM).map((m) => ({
            value: String(m),
            label: priceLabel(m),
          }))}
          onChange={(v) => setSingle("pmax", v || undefined)}
        />

        <Divider />

        {/* Tenure chips */}
        {TENURE_OPTIONS.map((t) => {
          const active = current.tenure.includes(t);
          return (
            <Chip
              key={t}
              active={active}
              onClick={() => toggleMulti("tenure", t, current.tenure)}
            >
              {t}
            </Chip>
          );
        })}

        <Divider />

        {/* Feature toggles */}
        <Chip
          active={current.beachfront}
          onClick={() => setSingle("beachfront", current.beachfront ? undefined : "1")}
        >
          Beachfront
        </Chip>
        <Chip
          active={current.seaView}
          onClick={() => setSingle("seaview", current.seaView ? undefined : "1")}
        >
          Sea view
        </Chip>
        <Chip
          active={current.mountainView}
          onClick={() =>
            setSingle("mountainview", current.mountainView ? undefined : "1")
          }
        >
          Mountain view
        </Chip>

        {/* Bedrooms (conditional) */}
        {showBedrooms ? (
          <>
            <Divider />
            <Select
              label="Beds"
              placeholder="Any beds"
              value={current.bedroomsMin?.toString() ?? ""}
              options={BEDROOM_OPTIONS.map((n) => ({
                value: String(n),
                label: `${n}+`,
              }))}
              onChange={(v) => setSingle("bedrooms", v || undefined)}
            />
          </>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {/* Sort */}
          <Select
            label="Sort"
            value={current.sort}
            options={(Object.keys(SORT_LABELS) as SortOption[]).map((s) => ({
              value: s,
              label: SORT_LABELS[s],
            }))}
            onChange={(v) => setSingle("sort", v === "featured" ? undefined : v)}
          />

          {/* Clear */}
          {filtered ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs text-forest-500/70 hover:text-forest-500 hover:bg-forest-500/5 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {activeFilters.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={f.remove}
              className="inline-flex items-center gap-1 rounded-full bg-forest-500/10 px-2.5 py-1 text-xs text-forest-500 transition-colors hover:bg-forest-500/20"
              aria-label={`Remove ${f.label}`}
            >
              {f.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-forest-500/50">
        {filtered ? `${totalCount} matching` : `${totalCount} total`} ·{" "}
        {pending ? "Updating…" : `Showing ${current.sort}`}
      </p>
    </div>
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
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-forest-500 bg-forest-500 text-cream-100"
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

function Select({
  label,
  placeholder,
  value,
  activeCount,
  options,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string;
  activeCount?: number;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-8 cursor-pointer appearance-none rounded-sm border border-forest-500/20 bg-cream-50 pl-3 pr-7 text-xs font-medium text-forest-500 hover:border-forest-500/50 focus:outline-none focus:ring-2 focus:ring-forest-500/30",
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
