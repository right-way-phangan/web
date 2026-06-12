import { getObjectByRwNumber } from "@/lib/data/objects";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";
import { getSiteUrl } from "@/lib/site-url";

// Edge runtime requires fetch-only data sources. amoCRM client uses fetch — works.
export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan property listing";

interface Props {
  params: { rw: string };
}

function formatRai(rai?: number): string | null {
  if (!rai) return null;
  if (rai >= 1)
    return `${rai.toLocaleString(undefined, { maximumFractionDigits: 2 })} rai`;
  return `${Math.round(rai * 1600).toLocaleString()} m²`;
}

export default async function Image({ params }: Props) {
  const o = await getObjectByRwNumber(params.rw);

  if (!o) {
    return renderOg({
      eyebrow: "Right Way Phangan",
      title: `${params.rw} — not available`,
      subtitle: "This property may have been sold or withdrawn.",
    });
  }

  const eyebrowParts = [o.rwNumber, o.type];
  if (o.district) eyebrowParts.push(o.district);

  const features: string[] = [];
  if (o.beachfront) features.push("Beachfront");
  else if (o.seaView) features.push("Sea view");
  else if (o.mountainView) features.push("Mountain view");
  else if (o.jungleView) features.push("Jungle view");
  const area = formatRai(o.areaRai);
  if (area) features.push(area);
  if (o.documentType) features.push(o.documentType);
  if (o.tenure?.[0]) features.push(o.tenure[0]);

  // Run the cover through the image optimizer (resized jpeg) before satori:
  // feeding the raw multi-MB drone shot balloons the PNG past what WhatsApp
  // will preview. Satori decodes jpeg/png only, so skip exotic source formats.
  const coverOk = /\.(jpe?g|png)(\?|$)/i.test(o.coverImage ?? "");
  const photo =
    o.coverImage && coverOk
      ? `${getSiteUrl()}/_next/image?url=${encodeURIComponent(o.coverImage)}&w=1200&q=55`
      : undefined;

  return renderOg({
    eyebrow: eyebrowParts.join(" · "),
    title: o.titleEn,
    features,
    photo,
  });
}
