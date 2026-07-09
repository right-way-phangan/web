import { getKbArticleBySlug } from "@/content/knowledge-base";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// Node runtime, not Edge: this route imports the whole knowledge-base data
// module, which the daily content bot keeps growing. On Edge that bundle nears
// the 1 MB function-size limit (its RU twin already crossed it and blocked prod
// deploys); Node's limit is far higher. renderOg (next/og ImageResponse,
// system-ui fonts, no fetch) runs fine on Node.
export const runtime = "nodejs";
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
