import { getDistrictBySlug } from "@/content/districts";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan district guide";

interface Props {
  params: { slug: string };
}

export default function Image({ params }: Props) {
  const d = getDistrictBySlug(params.slug);

  if (!d) {
    return renderOg({
      eyebrow: "Districts · Koh Phangan",
      title: "District guide",
    });
  }

  const [name, subtitle] = d.title.split(" — ");
  return renderOg({
    eyebrow: `District · ${name}`,
    title: subtitle ?? name,
    subtitle: d.short,
  });
}
