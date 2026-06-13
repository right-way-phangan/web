import { getPublicObjects } from "@/lib/data/objects";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// Text card (no photo) — self-contained on Edge, no network image fetch.
export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — property listings";

export default async function Image() {
  // Live count so a shared /listings card reads "23 vetted listings", not a
  // static blurb. getPublicObjects uses fetch — Edge-safe; [] on failure.
  const objects = await getPublicObjects().catch(() => []);
  const n = objects.length;
  const districts = new Set(objects.map((o) => o.district).filter(Boolean)).size;

  return renderOg({
    eyebrow: "Koh Phangan · Thailand",
    title: "Land, villas and homes on Phangan.",
    subtitle: n
      ? `${n} personally vetted listings across ${districts} districts.`
      : "Personally vetted land, villas and houses across the island.",
    features: ["Land", "Villas", "Houses", "Verified"],
  });
}
