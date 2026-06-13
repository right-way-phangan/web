import { getBlogPostBySlug } from "@/content/blog";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — Journal";

interface Props {
  params: { slug: string };
}

export default function Image({ params }: Props) {
  // Static content getter (edge-safe, bundled). DB-only drafts fall back to a
  // branded generic card rather than a broken fetch on the edge.
  const p = getBlogPostBySlug(params.slug);

  if (!p) {
    return renderOg({ eyebrow: "Journal · Koh Phangan", title: "Right Way Journal" });
  }

  return renderOg({
    eyebrow: `Journal · ${p.topic}`,
    title: p.title,
    subtitle: p.excerpt,
  });
}
