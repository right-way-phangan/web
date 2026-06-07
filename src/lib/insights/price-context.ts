import type { RealEstateObject } from "@/types/object";

export interface PriceContext {
  deltaPct: number; // negative = below district average
  sampleSize: number;
  metric: "per-rai" | "per-sqm" | "total";
  district: string;
  type: string;
}

const MIN_SAMPLE = 3;
// Beyond this the "comparables" are almost certainly apples-to-oranges (e.g. a
// rare premium plot vs the rest) — better to show nothing than mislead.
const MAX_PLAUSIBLE_DELTA = 80;

// Compare like with like: a beachfront plot against beachfront, a view plot
// against view, plain against plain. Avoids flagging a premium parcel as wildly
// "above average" just because the district also has cheap inland land.
function viewTier(o: RealEstateObject): "beach" | "view" | "plain" {
  if (o.beachfront) return "beach";
  if (o.seaView || o.mountainView) return "view";
  return "plain";
}

function landPerRai(o: RealEstateObject): number | undefined {
  if (o.pricePerRai && o.pricePerRai > 0) return o.pricePerRai;
  if (o.priceThb && o.areaRai) return o.priceThb / o.areaRai;
  return undefined;
}

const avg = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;

/**
 * Where this listing sits versus comparable listings in the same district and
 * type — using price-per-rai for land, price-per-m² for buildings (falling back
 * to total price). Returns null unless there are at least MIN_SAMPLE comparables,
 * so we never quote a "market position" off a tiny or absent sample.
 */
export function computePriceContext(
  o: RealEstateObject,
  catalog: RealEstateObject[],
): PriceContext | null {
  if (!o.district) return null;
  const tier = viewTier(o);
  const peers = catalog.filter(
    (x) =>
      x.rwNumber !== o.rwNumber &&
      x.district === o.district &&
      x.type === o.type &&
      viewTier(x) === tier,
  );

  const finalize = (deltaPct: number, sampleSize: number, metric: PriceContext["metric"]): PriceContext | null =>
    Math.abs(deltaPct) > MAX_PLAUSIBLE_DELTA
      ? null
      : { deltaPct, sampleSize, metric, district: o.district!, type: o.type };

  if (o.type === "Land") {
    const self = landPerRai(o);
    if (!self) return null;
    const vals = peers.map(landPerRai).filter((v): v is number => !!v && v > 0);
    if (vals.length < MIN_SAMPLE) return null;
    const a = avg(vals);
    return finalize(((self - a) / a) * 100, vals.length, "per-rai");
  }

  // Buildings — prefer price per m².
  if (o.priceThb && o.areaSqm) {
    const self = o.priceThb / o.areaSqm;
    const vals = peers
      .filter((x) => x.priceThb && x.areaSqm)
      .map((x) => x.priceThb! / x.areaSqm!);
    if (vals.length >= MIN_SAMPLE) {
      const a = avg(vals);
      return finalize(((self - a) / a) * 100, vals.length, "per-sqm");
    }
  }
  // Fallback — total price.
  if (o.priceThb) {
    const vals = peers.filter((x) => x.priceThb).map((x) => x.priceThb!);
    if (vals.length >= MIN_SAMPLE) {
      const a = avg(vals);
      return finalize(((o.priceThb - a) / a) * 100, vals.length, "total");
    }
  }
  return null;
}
