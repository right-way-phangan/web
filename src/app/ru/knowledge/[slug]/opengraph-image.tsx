import { getKbArticleRuBySlug } from "@/content/knowledge-base.ru";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// Node runtime, not Edge: this route imports the whole knowledge-base.ru data
// module, which the daily content bot keeps growing. On Edge that bundle pushed
// past the 1 MB function-size limit and blocked prod deploys; Node's limit is
// far higher. renderOg (next/og ImageResponse, system-ui fonts, no fetch) runs
// fine on Node.
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
