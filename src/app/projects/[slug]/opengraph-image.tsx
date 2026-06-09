import { getProjectBySlug } from "@/lib/data/projects";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// Edge runtime requires fetch-only data sources. amoCRM client uses fetch — works.
export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan developer project";

interface Props {
  params: { slug: string };
}

export default async function Image({ params }: Props) {
  const found = await getProjectBySlug(params.slug);

  if (!found) {
    return renderOg({
      eyebrow: "Right Way Phangan",
      title: "Project not available",
      subtitle: "This developer project may have been withdrawn.",
    });
  }

  const { project: p } = found;
  const eyebrowParts = [p.developer ?? "Developer project"];
  if (p.district) eyebrowParts.push(p.district);

  const features: string[] = [];
  if (p.stage) features.push(p.stage);
  if (p.priceThb) features.push(`from ฿${(p.priceThb / 1_000_000).toFixed(p.priceThb >= 10_000_000 ? 0 : 1)}M`);
  if (p.unitsTotal != null) {
    const avail = p.unitsAvailable ?? p.unitsTotal;
    features.push(`${avail}/${p.unitsTotal} units`);
  }
  if (p.completion) features.push(p.completion);

  return renderOg({
    eyebrow: eyebrowParts.join(" · "),
    title: p.titleEn,
    features,
  });
}
