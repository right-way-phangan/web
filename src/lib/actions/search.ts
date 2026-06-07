"use server";

import { getPublicObjects } from "@/lib/data/objects";
import { deriveFilterOptions } from "@/lib/filters/listings";
import { parseSearchQuery } from "@/lib/search/parse-query";

export interface NlSearchResult {
  href: string;
  interpreted: string[];
  matched: boolean;
}

/**
 * Turn a natural-language query into a /listings URL with the matching filter
 * params. The query text is preserved as `q` so the search box stays populated.
 */
export async function runNlSearch(text: string): Promise<NlSearchResult> {
  const objects = await getPublicObjects();
  const { districts } = deriveFilterOptions(objects);
  const { params, interpreted } = await parseSearchQuery(text, districts);

  const sp = new URLSearchParams(params);
  if (text.trim()) sp.set("q", text.trim());
  const qs = sp.toString();

  return {
    href: qs ? `/listings?${qs}` : "/listings",
    interpreted,
    matched: interpreted.length > 0,
  };
}
