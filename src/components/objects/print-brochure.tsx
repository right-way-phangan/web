import type { RealEstateObject } from "@/types/object";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";
import { getRentalMarket, buildInventoryYield, fmtThb } from "@/lib/data/rental-market";
import { BrochureMedia } from "./brochure-media";
import type { Locale } from "@/lib/i18n/dictionaries";
import { L, localePath } from "@/lib/i18n/locale-path";

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
export function PrintBrochure({
  object,
  locale = "en",
}: {
  object: RealEstateObject;
  locale?: Locale;
}) {
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
            {L(locale, { en: "Investment potential", ru: "Инвестиционный потенциал", th: "ศักยภาพการลงทุน" })}
          </p>
          <p className="mt-1 text-sm text-forest-900">
            {L(locale, {
              en: `Est. rental income ≈ ${fmtThb(invest.annualGrossThb, true)}/year`,
              ru: `Оценка дохода от аренды ≈ ${fmtThb(invest.annualGrossThb, true)}/год`,
              th: `รายได้ค่าเช่าโดยประมาณ ≈ ${fmtThb(invest.annualGrossThb, true)}/ปี`,
            })}
            <span className="text-forest-500">
              {" "}
              {L(locale, {
                en: `(gross, at ${Math.round(invest.occUsed * 100)}% occupancy · ${fmtThb(invest.districtAdr)}/night in ${invest.district})`,
                ru: `(до расходов, при загрузке ${Math.round(invest.occUsed * 100)}% · ${fmtThb(invest.districtAdr)}/ночь в районе ${invest.district})`,
                th: `(ก่อนหักค่าใช้จ่าย ที่อัตราการเข้าพัก ${Math.round(invest.occUsed * 100)}% · ${fmtThb(invest.districtAdr)}/คืน ในย่าน ${invest.district})`,
              })}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-forest-900">
            {L(locale, { en: "Gross yield", ru: "Валовая доходность", th: "ผลตอบแทนรวม" })} {invest.grossYieldPct}% ·{" "}
            {L(locale, { en: "Net yield", ru: "Чистая доходность", th: "ผลตอบแทนสุทธิ" })} {invest.netYieldPct}%
            {invest.paybackYears > 0
              ? L(locale, {
                  en: ` · Payback ~${invest.paybackYears} yrs`,
                  ru: ` · Окупаемость ~${invest.paybackYears} лет`,
                  th: ` · ระยะคืนทุน ~${invest.paybackYears} ปี`,
                })
              : ""}
          </p>
          <p className="mt-1 text-[10px] text-forest-500">
            {L(locale, {
              en: "Indicative estimate (district short-let medians, modelled occupancy) — not a guarantee.",
              ru: "Ориентировочная оценка (медианы краткосрочной аренды по району, расчётная загрузка) — не гарантия.",
              th: "ตัวเลขประมาณการ (ค่ามัธยฐานค่าเช่าระยะสั้นในย่าน อัตราการเข้าพักจากแบบจำลอง) — ไม่ใช่การรับประกัน",
            })}
          </p>
        </div>
      ) : null}
      <BrochureMedia
        photos={photos}
        mapUrl={mapUrl}
        altPrefix={`${object.titleEn} (${object.rwNumber})`}
      />
      <p className="mt-3 text-xs text-forest-500">
        {host}
        {localePath(locale, `/object/${object.rwNumber}`)} · WhatsApp {phone} ·{" "}
        {siteConfig.contact.email} ·{" "}
        {L(locale, { en: "Koh Phangan, Thailand", ru: "Панган, Таиланд", th: "เกาะพะงัน ประเทศไทย" })}
      </p>
    </div>
  );
}
