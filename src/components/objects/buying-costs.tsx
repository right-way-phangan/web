import type { RealEstateObject } from "@/types/object";
import { formatPriceCompact } from "@/lib/utils/price";
import { getObjectDict, type Locale } from "@/lib/i18n/dictionaries";

/**
 * "What it costs to buy" — per-object buyer-side cost table. Figures mirror
 * the closing-costs FAQ (the single vetted source): Land Office rates +
 * typical professional fees. Seller-side taxes (SBT, withholding) are
 * deliberately excluded — noted in copy. No commission anywhere: seller-paid,
 * inside the price, and not public information.
 */
export function BuyingCosts({
  object,
  locale,
}: {
  object: RealEstateObject;
  locale: Locale;
}) {
  const t = getObjectDict(locale).costs;
  const price = object.priceThb;
  if (!price) return null;

  const isLeasehold =
    object.tenure?.includes("Leasehold") && !object.tenure?.includes("Freehold");
  const isBuilt = object.type !== "Land" && object.type !== "Project";

  // Transfer fee: 2% of appraised value (≤ asking in practice), often split —
  // honest range is half to full 2% of the asking price.
  const transferLo = price * 0.01;
  const transferHi = price * 0.02;

  const rows: Array<{ label: string; note?: string; value: string }> = [];
  if (isLeasehold) {
    // Lease registration replaces the freehold transfer fee for the land part.
    rows.push({
      label: t.leaseReg,
      note: t.leaseRegNote,
      value: `≈ ${formatPriceCompact(price * 0.0055)}–${formatPriceCompact(price * 0.011)}`,
    });
  } else {
    rows.push({
      label: t.transferFee,
      note: t.transferFeeNote,
      value: `≈ ${formatPriceCompact(transferLo)}–${formatPriceCompact(transferHi)}`,
    });
  }
  rows.push(
    { label: t.legal, value: "80K–150K THB" },
    { label: t.surveyor, value: "15K–30K THB" },
    { label: t.translation, value: "5K–15K THB" },
  );
  if (isBuilt) rows.push({ label: t.inspection, value: "~30K THB" });

  // Total: fee range + fixed services (100K–195K, +30K inspection when built).
  const feeLo = isLeasehold ? price * 0.0055 : transferLo;
  const feeHi = isLeasehold ? price * 0.011 : transferHi;
  const fixedLo = 100_000 + (isBuilt ? 30_000 : 0);
  const fixedHi = 195_000 + (isBuilt ? 30_000 : 0);
  const totalLo = feeLo + fixedLo;
  const totalHi = feeHi + fixedHi;

  return (
    <section>
      <h2 className="font-serif text-3xl text-forest-900">{t.title}</h2>
      <p className="mt-3 max-w-prose text-base text-forest-500/70">{t.lede}</p>

      <div className="mt-8 overflow-hidden rounded-sm border border-forest-500/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest-500/10 bg-cream-200/50 text-left">
              <th className="px-4 py-3 font-medium text-forest-500/80">{t.item}</th>
              <th className="px-4 py-3 text-right font-medium text-forest-500/80">
                {t.typical}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-forest-500/10 last:border-0">
                <td className="px-4 py-3">
                  <span className="text-forest-900">{row.label}</span>
                  {row.note ? (
                    <span className="mt-0.5 block text-xs text-forest-500/70">
                      {row.note}
                    </span>
                  ) : null}
                </td>
                <td className="num whitespace-nowrap px-4 py-3 text-right align-top text-forest-900">
                  {row.value}
                </td>
              </tr>
            ))}
            <tr className="bg-cream-200/50">
              <td className="px-4 py-3 font-medium text-forest-900">{t.total}</td>
              <td className="num whitespace-nowrap px-4 py-3 text-right font-semibold text-forest-900">
                ≈ {formatPriceCompact(totalLo)}–{formatPriceCompact(totalHi)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-prose text-sm text-forest-500/70">{t.sellerNote}</p>
      <p className="mt-2 max-w-prose text-xs text-forest-500/55">{t.disclaimer}</p>
    </section>
  );
}
