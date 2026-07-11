import { getKbArticleBySlug } from "@/content/knowledge-base";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// nodejs, not edge: bundled knowledge-base content grows with every
// auto-published guide; the RU twin already broke the 1 MB edge limit and
// failed the whole deployment. → memory reference_vercel_edge_og_1mb_limit
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
