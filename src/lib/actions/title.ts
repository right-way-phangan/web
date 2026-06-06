"use server";

import { generateObjectTitle } from "@/lib/generate/object-title";
import { titleAttrsFromInput, type NewObjectInput } from "@/lib/amocrm/object-writer";

/** Subset of the intake form needed to suggest a title (preview, pre-create). */
export interface TitlePreviewInput {
  type: string;
  district?: string;
  area?: string;
  bedrooms?: number;
  unitsTotal?: number;
  documentType?: string;
  features?: string[];
  villaFeatures?: string[];
  terrain?: string;
  condition?: string;
  stage?: string;
  /** Changes each click so repeated presses surface different phrasings. */
  nonce?: string;
}

/**
 * Server action for the "Сгенерировать" button on /admin/new. Reuses the exact
 * create-time mapping + generator, so the preview matches what would be written.
 * The RW number isn't known until publish, so `nonce` seeds the variety instead.
 */
export async function previewObjectTitle(inp: TitlePreviewInput): Promise<string> {
  if (!inp.type) return "";
  const partial: NewObjectInput = {
    type: inp.type,
    district: inp.district,
    area: inp.area,
    bedrooms: inp.bedrooms,
    unitsTotal: inp.unitsTotal,
    documentType: inp.documentType,
    features: inp.features,
    villaFeatures: inp.villaFeatures,
    terrain: inp.terrain,
    condition: inp.condition,
    stage: inp.stage,
  };
  const seedRw = inp.nonce || `${inp.type}${inp.district ?? ""}`;
  return generateObjectTitle(titleAttrsFromInput(partial, seedRw));
}
