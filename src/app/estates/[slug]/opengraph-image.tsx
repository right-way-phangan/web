import { getEstateBySlug, estateStats } from "@/content/land-estates";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan land estate";

interface Props {
  params: { slug: string };
}

export default function Image({ params }: Props) {
  const estate = getEstateBySlug(params.slug);

  if (!estate) {
    return renderOg({
      eyebrow: "Right Way Phangan",
      title: "Estate not available",
      subtitle: "This plot collection may have been withdrawn.",
    });
  }

  const s = estateStats(estate);
  const features = [
    `${s.total} plots`,
    `${s.available} available`,
    ...(s.areaRai > 0 ? [`${s.areaRai} rai`] : []),
  ];

  return renderOg({
    eyebrow: `Land estate · ${estate.district}`,
    title: estate.name.en,
    subtitle: estate.tagline.en,
    features,
  });
}
