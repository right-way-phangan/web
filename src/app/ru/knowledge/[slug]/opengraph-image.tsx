import { getKbArticleRuBySlug } from "@/content/knowledge-base.ru";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — База знаний";

interface Props {
  params: { slug: string };
}

export default function Image({ params }: Props) {
  const a = getKbArticleRuBySlug(params.slug);

  if (!a) {
    return renderOg({ eyebrow: "База знаний · Ко Панган", title: "База знаний Right Way" });
  }

  return renderOg({
    eyebrow: `База знаний · ${a.topic}`,
    title: a.title,
    subtitle: a.short,
  });
}
