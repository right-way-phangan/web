import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — Premium real estate on Koh Phangan";

export default function Image() {
  return renderOg({
    eyebrow: "Koh Phangan · Thailand",
    title: "Land, villas, and homes — curated on Phangan.",
    subtitle:
      "A specialised advisory for international buyers. Verified listings, transparent process.",
    features: ["Listings", "Districts", "Process", "FAQ"],
  });
}
