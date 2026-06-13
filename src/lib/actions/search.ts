"use server";

import { getPublicObjects } from "@/lib/data/objects";
import { deriveFilterOptions, parseListingsSearchParams, makeFilterPredicate } from "@/lib/filters/listings";
import { parseSearchQuery } from "@/lib/search/parse-query";
import { recordSearchEvent } from "@/lib/data/demand";

export interface NlSearchResult {
  href: string;
  interpreted: string[];
  matched: boolean;
}

/** Map filter URL params → the structural fields the demand log stores. */
function demandFieldsFromParams(params: Record<string, string>) {
  const features: string[] = [];
  if (params.beachfront) features.push("beachfront");
  if (params.seaview) features.push("seaView");
  if (params.mountainview) features.push("mountainView");
  return {
    types: params.type ? params.type.split(",") : [],
    districts: params.district ? params.district.split(",") : [],
    tenure: params.tenure ? params.tenure.split(",") : [],
    features,
    priceMinM: params.pmin ? Number(params.pmin) : null,
    priceMaxM: params.pmax ? Number(params.pmax) : null,
    bedroomsMin: params.bedrooms ? Number(params.bedrooms) : null,
  };
}

/**
 * Turn a natural-language query into a /listings URL with the matching filter
 * params. The query text is preserved as `q` so the search box stays populated.
 * Side effect: records the query as a demand signal (server-side → ad-blocker
 * proof). resultCount lets /admin/demand surface "searched but we have nothing".
 */
export async function runNlSearch(text: string, locale = "en"): Promise<NlSearchResult> {
  const objects = await getPublicObjects();
  const { districts } = deriveFilterOptions(objects);
  const { params, interpreted } = await parseSearchQuery(text, districts);
  const matched = interpreted.length > 0;

  // How many listings the interpreted filter actually returns (demand vs supply).
  let resultCount: number | undefined;
  if (matched) {
    const filter = parseListingsSearchParams(params);
    resultCount = objects.filter(makeFilterPredicate(filter)).length;
  }

  // Fire-and-forget; never block or fail the search on logging.
  void recordSearchEvent({
    kind: "nl",
    query: text.trim(),
    matched,
    resultCount: resultCount ?? null,
    locale,
    ...demandFieldsFromParams(params),
  });

  const sp = new URLSearchParams(params);
  if (text.trim()) sp.set("q", text.trim());
  const qs = sp.toString();

  return {
    href: qs ? `/listings?${qs}` : "/listings",
    interpreted,
    matched,
  };
}
