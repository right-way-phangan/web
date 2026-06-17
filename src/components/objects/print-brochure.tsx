import type { RealEstateObject } from "@/types/object";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";
import { getRentalMarket, buildInventoryYield, fmtThb } from "@/lib/data/rental-market";
import { BrochureMedia } from "./brochure-media";

/**
 * Print-only photo sheet + contact line for the listing brochure (the
 * interactive gallery is print-hidden). The heavy media (photos + static map)
 * lives in the client child <BrochureMedia>, which mounts it only when a print
 * is actually requested — mounting it on every page view was fetching full-size
 * originals straight from blob on every visit/bot crawl. → memory
 * project_image_optimization_limit
 *
 * Investment block reuses the public /insights yield logic (district ADR ×
 * occupancy, mgmt + opex) — same numbers the site already shows, no internal
 * valuation internals leak into the client brochure.
 */
export function PrintBrochure({ object }: { object: RealEstateObject }) {
  const photos = (object.gallery ?? []).filter(Boolean).slice(0, 4);
  const host = getSiteUrl().replace(/^https?:\/\//, "");
  const phone = `+${siteConfig.contact.whatsapp}`;
  const hasCoords = object.lat != null && object.lng != null;
  const mapUrl = hasCoords
    ? `/staticmap?lat=${object.lat}&lng=${object.lng}&z=15&w=720&h=300`
    : null;
  const invest = buildInventoryYield([object], getRentalMarket(), 1)[0] ?? null;

  return (
    <div className="hidden print:block">
      {invest ? (
        <div className="mb-3 rounded-sm border border-forest-500/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            Investment potential
          </p>
          <p className="mt-1 text-sm text-forest-900">
            Est. rental income ≈ {fmtThb(invest.annualGrossThb, true)}/year
            <span className="text-forest-500">
              {" "}
              (gross, at {Math.round(invest.occUsed * 100)}% occupancy · {fmtThb(invest.districtAdr)}/night in {invest.district})
            </span>
          </p>
          <p className="mt-0.5 text-sm text-forest-900">
            Gross yield {invest.grossYieldPct}% · Net yield {invest.netYieldPct}%
            {invest.paybackYears > 0 ? ` · Payback ~${invest.paybackYears} yrs` : ""}
          </p>
          <p className="mt-1 text-[10px] text-forest-500">
            Indicative estimate (district short-let medians, modelled occupancy) — not a guarantee.
          </p>
        </div>
      ) : null}
      <BrochureMedia
        photos={photos}
        mapUrl={mapUrl}
        altPrefix={`${object.titleEn} (${object.rwNumber})`}
      />
      <p className="mt-3 text-xs text-forest-500">
        {host}/object/{object.rwNumber} · WhatsApp {phone} ·{" "}
        {siteConfig.contact.email} · Koh Phangan, Thailand
      </p>
    </div>
  );
}
