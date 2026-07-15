"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import {
  Waves,
  Mountain,
  Trees,
  Building2,
  Home,
  TreePine,
  Sun,
  ShieldCheck,
  Ruler,
  TrendingUp,
} from "lucide-react";
import type { RealEstateObject, ObjectType } from "@/types/object";
import type { BuildBadge } from "@/lib/data/build-envelope";
import { BLUR_PLACEHOLDER } from "@/lib/utils/blur";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";
import { getListingsDict, type ListingsDict } from "@/lib/i18n/dictionaries";
import { escalatedLeaseTotalThb } from "@/lib/objects/lease-format";
import { zoneCategory, buildWarnLabels } from "@/lib/data/zone-rules";
import { SaveButton } from "./save-button";
import { MagicCard } from "@/components/ui/magic-card";
import { useCurrency } from "@/components/ui/currency";

const NEW_BADGE_DAYS = 14;

function isFreshListing(dateAdded?: string): boolean {
  if (!dateAdded) return false;
  const added = Date.parse(dateAdded);
  if (Number.isNaN(added)) return false;
  return Date.now() - added < NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
}

const TYPE_ICON: Record<ObjectType, typeof Home> = {
  Land: TreePine,
  Villa: Home,
  House: Home,
  Apartment: Building2,
  Townhouse: Home,
  Hotel: Building2,
  Business: Building2,
  Project: Building2,
};

/**
 * Card thumbnail shows the migrated cover photo (Drive → Vercel Blob) when
 * present, falling back to a deterministic gradient from rwNumber for objects
 * without photos yet — so the grid stays intentional, never broken.
 *
 * Client component so it can self-localize via useLocale (label chrome switches
 * EN/RU by URL). The object's own title/description stays in its source language
 * (amoCRM, currently EN). The detail link stays at /object/[rw] for both locales
 * until /ru/object ships.
 */
function thumbHue(rw: string): number {
  let h = 0;
  for (let i = 0; i < rw.length; i++) h = (h * 31 + rw.charCodeAt(i)) >>> 0;
  return h % 360;
}

interface Props {
  object: RealEstateObject;
  /**
   * Eager-load the cover (priority) for the few cards above the fold. The grid's
   * first photo is the page LCP on /listings; left at the default lazy it loads
   * late and pushed LCP to ~6s. Pass for the first ~4 cards only.
   */
  priority?: boolean;
  /**
   * In the Rent view (/listings Buy/Rent toggle), lead with the monthly lease
   * rate instead of the sale price. Defaults to "buy" — every other surface
   * keeps the sale-price-first headline unchanged.
   */
  priceMode?: "buy" | "rent";
  /**
   * Pre-computed "max build envelope" chip (server-side, from sea distance).
   * Only set on /listings cards; null/absent elsewhere → no chip.
   */
  buildBadge?: BuildBadge | null;
}

export function ObjectCard({ object, priority = false, priceMode = "buy", buildBadge }: Props) {
  const TypeIcon = TYPE_ICON[object.type];
  const hue = thumbHue(object.rwNumber);
  // Cover can 402 (optimizer cap) / 403 (blob store blocked) — fall back to the
  // gradient panel rather than a broken-image box. See object-gallery SafeImage
  // and memory project_image_optimization_limit.
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = Boolean(object.coverImage) && !coverFailed;
  const locale = useLocale();
  const t = getListingsDict(locale);
  const { fmt } = useCurrency();
  // Explicit locale so server/client number formatting matches (hydration).
  const nl = locale === "ru" ? "ru-RU" : "en-US";
  const zoneCat = zoneCategory(object, locale);
  const buildWarns = buildWarnLabels(object, locale);

  return (
    <div className="group relative flex h-full flex-col">
      <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
        <SaveButton rw={object.rwNumber} />
        {object.priceThb ? (
          <Link
            href={
              localeHref(
                locale,
                // Carry tenure/lease/phase so leasehold & off-plan deep-link to the
                // correct model — /calculator reads these params. Freehold resale
                // needs only the price.
                `/calculator?price=${object.priceThb}` +
                  (object.tenure?.includes("Leasehold") && !object.tenure?.includes("Freehold")
                    ? `&tenure=leasehold${object.leaseTermYears ? `&lease=${object.leaseTermYears}` : ""}`
                    : "") +
                  (object.type === "Project" ? "&phase=offplan" : ""),
              ) as Route
            }
            title={locale === "ru" ? "Калькулятор доходности" : "ROI calculator"}
            className="inline-flex items-center gap-1 rounded-sm bg-panel/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-panel-fg backdrop-blur-sm transition-colors hover:bg-panel"
          >
            <TrendingUp className="h-3 w-3" />
            ROI
          </Link>
        ) : null}
      </div>
      {/* New tab so list/search/map context survives — users lose NL-search
          results when navigating back (feedback 2026-06-11). */}
      <Link
        href={localeHref(locale, `/object/${object.rwNumber}`) as Route}
        target="_blank"
        rel="noopener"
        className="flex h-full flex-col overflow-hidden rounded-sm card-elevated transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-panel/15 motion-reduce:hover:translate-y-0"
      >
      {/* MagicCard несёт поверхность + рамку-spotlight (brass, следит за
          курсором). card-elevated/бронзовый кант/parallax остаются на Link. */}
      <MagicCard className="flex h-full flex-col">
      <div
        className="relative aspect-[4/3] overflow-hidden bg-forest-500/5"
        style={
          showCover
            ? undefined
            : {
                backgroundImage: `linear-gradient(135deg, hsl(${hue} 30% 88%) 0%, hsl(${(hue + 40) % 360} 25% 78%) 100%)`,
              }
        }
      >
        {showCover ? (
          // Обёртка крупнее контейнера несёт scroll-parallax (.cover-parallax);
          // зум при наведении — на самом <img>, чтобы трансформации не конфликтовали.
          <div className="cover-parallax absolute -inset-[8%]">
            <Image
              src={object.coverImage!}
              alt={object.titleEn}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              priority={priority}
              onError={() => setCoverFailed(true)}
              className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08] motion-reduce:group-hover:scale-100"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-forest-500/30 transition-transform duration-500 group-hover:scale-105">
            <TypeIcon className="h-16 w-16" strokeWidth={1} />
          </div>
        )}

        {/* Hover-дуотон (только dark): мягкий бронзовый грейд обложки при
            наведении — премиальный «оживающий» эффект. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] hidden bg-bronze/25 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none dark:block"
        />

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="rounded-sm bg-cream-50/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-forest-500 backdrop-blur-sm">
            {object.rwNumber}
          </span>
          {isFreshListing(object.dateAdded) ? (
            <span className="rounded-sm bg-brass-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-panel-fg">
              {t.newBadge}
            </span>
          ) : null}
          {/* Leasehold is the strategic product — flag it in the grid so the
              tenure reads at a glance, not only deep in the spec table. */}
          {object.tenure?.includes("Leasehold") ? (
            <span className="rounded-sm bg-panel/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-panel-fg backdrop-blur-sm">
              {t.leasehold}
            </span>
          ) : null}
        </div>

        {object.beachfront ? (
          <FeatureBadge icon={Waves} label={t.beachfront} />
        ) : object.seaView ? (
          <FeatureBadge icon={Sun} label={t.seaView} />
        ) : object.mountainView ? (
          <FeatureBadge icon={Mountain} label={t.mountainView} />
        ) : object.jungleView ? (
          <FeatureBadge icon={Trees} label={t.jungleView} />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs text-forest-500/70">
          <span className="font-medium">{t.types[object.type]}</span>
          {object.district ? (
            <>
              <span aria-hidden>·</span>
              <span>{object.district}</span>
            </>
          ) : null}
        </div>

        <h3 className="font-serif text-xl leading-snug text-forest-900 line-clamp-2">
          {object.titleEn}
        </h3>

        {priceMode === "rent" && (object.rentPerMonth || object.rentPerRaiMonth) ? (
          // Rent view: lead with the monthly rent — whole-unit for buildings
          // (฿/mo), per-rai land lease for land (฿/rai/mo).
          <p className="num text-lg text-forest-900">
            {object.rentPerMonth ? (
              <>
                {fmt(object.rentPerMonth)}
                <span className="ml-2 text-xs font-sans text-forest-500/70">{t.perMonthShort}</span>
              </>
            ) : (
              <>
                {fmt(object.rentPerRaiMonth!)}
                <span className="ml-2 text-xs font-sans text-forest-500/70">{t.perRaiMonth}</span>
              </>
            )}
          </p>
        ) : object.priceThb ? (
          <p className="num text-lg text-forest-900">
            {fmt(object.priceThb)}
            {object.type === "Land" && object.pricePerRai ? (
              <span className="ml-2 text-xs font-sans text-forest-500/70">
                {fmt(object.pricePerRai)}{t.perRai}
              </span>
            ) : null}
          </p>
        ) : object.pricePerRai ? (
          <p className="num text-lg text-forest-900">
            {fmt(object.pricePerRai)}
            <span className="ml-2 text-xs font-sans text-forest-500/70">{t.perRai}</span>
          </p>
        ) : object.rentPerMonth ? (
          <p className="num text-lg text-forest-900">
            {fmt(object.rentPerMonth)}
            <span className="ml-2 text-xs font-sans text-forest-500/70">{t.perMonthShort}</span>
          </p>
        ) : object.rentPerRaiMonth ? (
          <p className="num text-lg text-forest-900">
            {fmt(object.rentPerRaiMonth)}
            <span className="ml-2 text-xs font-sans text-forest-500/70">{t.perRaiMonth}</span>
          </p>
        ) : (
          <p className="text-sm italic text-forest-500/55">{t.priceOnRequest}</p>
        )}

        {/* Lease total: a monthly rate alone isn't comparable to sale prices in
            the Buy grid, so surface the whole-term cost. */}
        {!object.priceThb && object.rentPerMonth && object.leaseTermYears ? (
          <p className="mt-0.5 text-xs text-forest-500/70">
            ≈{" "}
            {fmt(
              escalatedLeaseTotalThb(
                object.rentPerMonth,
                object.leaseTermYears,
                object.leaseEscPercent,
                object.leaseEscPeriodYears,
              ),
            )}
            <span className="ml-1">
              {locale === "ru" ? `за ${object.leaseTermYears} лет` : `over ${object.leaseTermYears}y`}
            </span>
          </p>
        ) : null}

        {/* Max build envelope — indicative ceiling; exact limits on the detail
            page's "What you can build" block. Pre-computed server-side. */}
        {buildBadge ? (
          <span
            title={
              locale === "ru"
                ? "Максимум по нормам застройки — точные лимиты в due diligence"
                : "Maximum allowed by building norms — exact limits in due diligence"
            }
            className={`inline-flex w-fit items-center gap-1.5 rounded-sm border px-2 py-1 text-[11px] font-medium ${
              buildBadge.restricted
                ? "border-amber-600/25 bg-amber-50/70 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                : "border-forest-500/15 bg-forest-500/[0.04] text-forest-700"
            }`}
          >
            <Ruler className="h-3 w-3 shrink-0 text-forest-500/55" />
            {buildBadge.text}
          </span>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-forest-500/70">
          {object.areaRai ? (
            <span>{formatRai(object.areaRai, t, nl)}</span>
          ) : object.areaSqm ? (
            <span>{object.areaSqm.toLocaleString(nl)} m²</span>
          ) : null}

          {object.bedrooms ? (
            <span>· {object.bedrooms} {t.bed}</span>
          ) : null}

          {zoneCat || buildWarns.length > 0 ? (
            <span
              className="inline-flex items-center gap-1"
              title={buildWarns.length > 0 ? buildWarns.join(" · ") : undefined}
            >
              {buildWarns.length > 0 ? (
                <span aria-hidden className="text-amber-600 dark:text-amber-400">▲</span>
              ) : null}
              {zoneCat ? <span>{zoneCat}</span> : null}
            </span>
          ) : null}

          {object.documentType ? (
            <span className="ml-auto inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {object.documentType}
            </span>
          ) : null}
        </div>
        </div>
      </MagicCard>
      </Link>
    </div>
  );
}

function FeatureBadge({
  icon: Icon,
  label,
}: {
  icon: typeof Waves;
  label: string;
}) {
  return (
    <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-sm bg-panel/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-panel-fg backdrop-blur-sm">
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

function formatRai(rai: number, t: ListingsDict, nl: string): string {
  if (rai >= 1) return `${rai.toLocaleString(nl, { maximumFractionDigits: 2 })} ${t.rai}`;
  // sub-rai: 1 rai = 400 sq.wah; 1 sq.wah = 4 m². Show in m² for clarity.
  return `${Math.round(rai * 1600).toLocaleString(nl)} m²`;
}
