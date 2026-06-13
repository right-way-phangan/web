import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// Text card (no photo) — self-contained on Edge.
export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — developer projects";

export default function Image() {
  return renderOg({
    eyebrow: "Koh Phangan · Off-plan",
    title: "Developer projects on Phangan.",
    subtitle: "Pool villas and complexes — units, pricing, payment plans and projected returns.",
    features: ["Off-plan", "Turnkey", "Units", "Verified"],
  });
}
