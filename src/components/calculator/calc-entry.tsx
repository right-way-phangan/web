"use client";

import { useState } from "react";
import { Building2, Home, Hammer } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import type { RentalMarket } from "@/lib/data/rental-market";
import type { CalcDict } from "@/lib/i18n/calculator";
import type { RoiInputs } from "@/lib/calculator/roi";
import { estimateNightly } from "./market-preset";

type Seg = "catalog" | "own" | "build";

// Airbnb room links look like airbnb.com/rooms/12345 (also /rooms/plus/…, /h/…).
const AIRBNB_RE = /airbnb\.[a-z.]+\/(?:rooms\/(?:plus\/)?|h\/)(\d+)/i;

const fieldCls =
  "mt-1.5 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-3 py-2 text-sm text-forest-900 focus:border-forest-500/50 focus:outline-none";

/**
 * "What are you pricing?" chooser above the calculator, shown only on the
 * standalone page (not object-page embeds). Three ways in: load one of our
 * listings, describe your own property (price + district → rent from our market
 * data, optional Airbnb link), or jump to the build-to-rent pro-forma.
 */
export function CalcEntry({
  catalog,
  market,
  t,
  onApply,
  onOwnNote,
}: {
  catalog: RealEstateObject[];
  market?: RentalMarket;
  t: CalcDict;
  onApply: (patch: Partial<RoiInputs>) => void;
  onOwnNote: (note: string | null) => void;
}) {
  const [seg, setSeg] = useState<Seg>("catalog");
  const [priceThb, setPriceThb] = useState("");
  const [district, setDistrict] = useState(market?.districts[0]?.name ?? "");
  const [bedrooms, setBedrooms] = useState("");
  const [airbnb, setAirbnb] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const priced = catalog.filter((o) => o.rwNumber && o.priceThb);

  function applyCatalog(rw: string) {
    const o = priced.find((x) => x.rwNumber === rw);
    if (!o?.priceThb) return;
    const isLand = (o.type ?? "").toLowerCase() === "land";
    onApply({ purchasePriceThb: o.priceThb, mode: isLand ? "hold" : "rent" });
    onOwnNote(null);
  }

  async function applyOwn() {
    const m = airbnb.trim() ? airbnb.trim().match(AIRBNB_RE) : null;
    if (airbnb.trim() && !m) {
      setNote(t.ownAirbnbBad);
      return;
    }
    const roomId = m ? m[1] : null;
    const price = Number(priceThb);
    const br = bedrooms === "" ? null : Number(bedrooms);
    const patch: Partial<RoiInputs> = {};
    if (Number.isFinite(price) && price > 0) patch.purchasePriceThb = price;

    let nightly: number | null = null;
    let occ: number | null = null;
    let status = t.ownApplied;
    let resolvedDistrict = district;

    if (roomId) {
      setBusy(true);
      try {
        const res = await fetch(`/api/listing-lookup?room=${roomId}`);
        if (res.ok) {
          const data = (await res.json()) as {
            adr?: number;
            district?: string;
            bedrooms?: number;
            asOf?: string;
          };
          if (data?.adr) {
            nightly = Math.round(data.adr);
            status = t.ownAirbnbHit(data.asOf ?? "");
            if (data.district) resolvedDistrict = data.district;
          }
        }
      } catch {
        /* offline — fall back to district estimate below */
      }
      setBusy(false);
    }

    if (nightly == null && market && resolvedDistrict) {
      const est = estimateNightly(market, resolvedDistrict, br);
      if (est) {
        nightly = est.nightlyRateThb;
        occ = est.occupancyPct;
      }
      if (roomId) status = t.ownAirbnbMiss;
    }

    if (nightly != null) {
      patch.mode = "rent";
      patch.longTermRent = false;
      patch.nightlyRateThb = nightly;
      if (occ != null) patch.occupancyPct = occ;
    }
    onApply(patch);

    const bedLabel = br == null ? null : br === 0 ? t.ownStudio : `${br}BR`;
    const noteParts = [
      t.ownLeadTag,
      bedLabel,
      resolvedDistrict || null,
      roomId ? `airbnb.com/rooms/${roomId}` : null,
    ].filter(Boolean);
    onOwnNote(noteParts.join(" · "));
    setNote(status);
  }

  const segs: { key: Seg; label: string; Icon: typeof Home }[] = [
    { key: "catalog", label: t.entryFromCatalog, Icon: Building2 },
    { key: "own", label: t.entryOwn, Icon: Home },
    { key: "build", label: t.entryBuild, Icon: Hammer },
  ];

  return (
    <div className="mb-8 rounded-lg border border-forest-500/12 bg-cream-100/60 p-4 md:p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-forest-500/50">
        {t.entryTitle}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-sm bg-forest-500/8 p-1">
        {segs.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSeg(key)}
            aria-pressed={seg === key}
            className={`flex items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors ${
              seg === key
                ? "bg-cream-50 text-forest-900 shadow-bezel"
                : "text-forest-500/70 hover:text-forest-900"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {seg === "catalog" ? (
        <div className="mt-4">
          <label className="text-sm text-forest-500/70">{t.entryPickListing}</label>
          <select
            className={fieldCls}
            defaultValue=""
            onChange={(e) => e.target.value && applyCatalog(e.target.value)}
          >
            <option value="" disabled>
              {t.entryPickPlaceholder}
            </option>
            {priced.map((o) => (
              <option key={o.rwNumber} value={o.rwNumber as string}>
                {o.rwNumber} — {o.titleEn || o.type}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {seg === "own" ? (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm text-forest-500/70 sm:col-span-3">
              {t.ownValueLabel}
              <input
                type="number"
                inputMode="numeric"
                value={priceThb}
                onChange={(e) => setPriceThb(e.target.value)}
                placeholder="9000000"
                className={fieldCls}
              />
            </label>
            <label className="block text-sm text-forest-500/70">
              {t.ownDistrict}
              <select
                className={fieldCls}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                {(market?.districts ?? []).map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-forest-500/70">
              {t.ownBedrooms}
              <select
                className={fieldCls}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              >
                <option value="">{t.ownBedroomsAny}</option>
                <option value="0">{t.ownStudio}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </label>
            <label className="block text-sm text-forest-500/70">
              {t.ownAirbnbLabel}
              <input
                type="url"
                value={airbnb}
                onChange={(e) => setAirbnb(e.target.value)}
                placeholder="airbnb.com/rooms/…"
                className={fieldCls}
              />
            </label>
          </div>
          <p className="text-xs leading-relaxed text-forest-500/60">{t.ownAirbnbHint}</p>
          <button
            type="button"
            onClick={applyOwn}
            disabled={busy}
            className="rounded-sm bg-panel px-4 py-2 text-sm font-medium text-panel-fg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t.ownApply}
          </button>
          {note ? <p className="text-xs font-medium text-brass-700">{note}</p> : null}
        </div>
      ) : null}

      {seg === "build" ? (
        <div className="mt-4">
          <a
            href="#build"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brass-700 hover:text-brass-600"
          >
            {t.entryBuildCta}
          </a>
        </div>
      ) : null}
    </div>
  );
}
