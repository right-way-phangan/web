import { getKbArticleBySlug } from "@/content/knowledge-base";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — Knowledge base";

interface Props {
  params: { slug: string };
}

export default function Image({ params }: Props) {
  const a = getKbArticleBySlug(params.slug);

  if (!a) {
    return renderOg({ eyebrow: "Knowledge · Koh Phangan", title: "Right Way Knowledge base" });
  }

  return renderOg({
    eyebrow: `Knowledge · ${a.topic}`,
    title: a.title,
    subtitle: a.short,
  });
}
