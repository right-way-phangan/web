import { getBlogPostRuBySlug } from "@/content/blog.ru";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — Журнал";

interface Props {
  params: { slug: string };
}

export default function Image({ params }: Props) {
  const p = getBlogPostRuBySlug(params.slug);

  if (!p) {
    return renderOg({ eyebrow: "Журнал · Ко Панган", title: "Журнал Right Way" });
  }

  return renderOg({
    eyebrow: `Журнал · ${p.topic}`,
    title: p.title,
    subtitle: p.excerpt,
  });
}
