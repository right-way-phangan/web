import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// Text card (no photo) — self-contained on Edge.
export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — land estates";

export default function Image() {
  return renderOg({
    eyebrow: "Koh Phangan · Land",
    title: "Plot collections on Phangan.",
    subtitle: "Several plots from one owner under one title — buy or lease individually.",
    features: ["One owner", "Verified", "Freehold", "Leasehold"],
  });
}
