/**
 * Seller listing submission → CRM lead shape. Pure (no IO) so the server action
 * stays thin and the composition is easy to reason about. The constants are
 * shared with the form component (option lists) and the action (zod enum), so
 * the field set can't drift between UI and validation.
 */

/** Property categories an owner can submit for sale. */
export const PROPERTY_TYPES = ["land", "villa", "house", "apartment", "project"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

/** Ownership options an owner can pick (or leave blank when unsure). */
export const TENURES = ["freehold", "leasehold", "either", "unsure"] as const;
export type Tenure = (typeof TENURES)[number];

/** English labels for the CRM note — agent-facing, matching the buyer notes. */
const TYPE_LABEL: Record<PropertyType, string> = {
  land: "Land",
  villa: "Villa",
  house: "House",
  apartment: "Apartment",
  project: "Off-plan project",
};
const TENURE_LABEL: Record<Tenure, string> = {
  freehold: "Freehold",
  leasehold: "Leasehold",
  either: "Freehold or leasehold",
  unsure: "Owner unsure",
};

export interface SellerListingInput {
  name: string;
  email?: string;
  phone?: string;
  propertyType: PropertyType;
  location: string;
  size?: string;
  tenure?: Tenure;
  price?: string;
  hasDocs?: boolean;
  message?: string;
  replyVia?: "whatsapp" | "telegram" | "email";
  lang?: "en" | "ru";
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landing?: string;
}

export interface ComposedLead {
  leadName: string;
  note: string;
  tags: string[];
}

/**
 * Turn an owner's property submission into the CRM lead: a scannable board
 * title, a structured agent-facing note (English labels, like the buyer
 * inquiry notes), and tags. Pure — no network, no env.
 */
export function composeSellerLead(input: SellerListingInput): ComposedLead {
  const typeLabel = TYPE_LABEL[input.propertyType];

  const leadName = `Property for sale · ${input.name} · ${typeLabel}, ${input.location}`.slice(0, 120);

  // Structured facts first (only the ones given), then the owner's free text,
  // then reply/traffic context — so the agent sees everything at a glance.
  const facts = [
    `Type: ${typeLabel}`,
    `Location: ${input.location}`,
    input.size ? `Size: ${input.size}` : null,
    input.tenure ? `Tenure: ${TENURE_LABEL[input.tenure]}` : null,
    input.price ? `Asking price: ${input.price}` : null,
    input.hasDocs ? "Title docs: owner has them ready" : null,
  ].filter(Boolean);

  const context = [
    input.message ? `Owner's note:\n${input.message}` : null,
    input.replyVia ? `Reply via: ${input.replyVia}` : null,
    input.lang === "ru" ? "🗣️ Submitted on the RU site — reply in Russian" : null,
    trafficLine(input),
  ].filter(Boolean);

  const note = [
    "🏷️ Property for sale — owner submission",
    "",
    facts.join("\n"),
    ...(context.length ? ["", context.join("\n")] : []),
  ].join("\n");

  const tags = [
    "website",
    "website-contact",
    "seller-listing",
    "seller-lead",
    `type:${input.propertyType}`,
    ...(input.tenure ? [`tenure:${input.tenure}`] : []),
    ...(input.replyVia ? [`reply:${input.replyVia}`] : []),
    ...(input.lang ? [`lang:${input.lang}`] : []),
    ...(input.utmSource ? [`utm-source:${input.utmSource}`] : []),
    ...(input.utmMedium ? [`utm-medium:${input.utmMedium}`] : []),
    ...(input.utmCampaign ? [`utm-campaign:${input.utmCampaign}`] : []),
  ];

  return { leadName, note, tags };
}

function trafficLine(input: SellerListingInput): string | null {
  const channel = [input.utmSource, input.utmMedium, input.utmCampaign].filter(Boolean).join(" / ");
  const parts = [channel || null, input.landing ? `landed: ${input.landing}` : null].filter(Boolean);
  return parts.length ? `Traffic: ${parts.join(" · ")}` : null;
}
