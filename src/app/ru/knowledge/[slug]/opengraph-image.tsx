import { getKbArticleRuBySlug } from "@/content/knowledge-base.ru";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// nodejs, not edge: the imported knowledge-base content is bundled into this
// function and auto-published guides keep growing it — it broke the 1 MB edge
// limit (1.01 MB, 2026-07-11) and that fails the WHOLE deployment.
// → memory reference_vercel_edge_og_1mb_limit
export const runtime = "nodejs";
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
