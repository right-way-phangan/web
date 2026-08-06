import { getObjectByRwNumber } from "@/lib/data/objects";
import { renderOg, OG_PHOTO_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Общий рендер OG-карточки объекта для обеих локалей.
 *
 * Жил инлайном в /object/[rw]/opengraph-image.tsx, из-за чего у русского
 * сегмента картинки не было вовсе: страница задаёт свой openGraph без images,
 * а file-based картинку Next подставляет только тому сегменту, где лежит файл.
 * 80 русских карточек уходили в Telegram и WhatsApp без превью — это основной
 * канал, поэтому логика вынесена сюда, а оба роута стали тонкими обёртками.
 *
 * Тайтл объекта остаётся исходным EN и в русской карточке — так задумано
 * (данные объекта не переводим), локализована обвязка страницы.
 */
export const objectOgSize = OG_PHOTO_SIZE;
export const objectOgContentType = OG_CONTENT_TYPE;
export const objectOgAlt = "Right Way Phangan property listing";

function formatRai(rai?: number): string | null {
  if (!rai) return null;
  if (rai >= 1)
    return `${rai.toLocaleString(undefined, { maximumFractionDigits: 2 })} rai`;
  return `${Math.round(rai * 1600).toLocaleString()} m²`;
}

export async function renderObjectOg(rw: string) {
  const o = await getObjectByRwNumber(rw);

  if (!o) {
    return renderOg({
      eyebrow: "Right Way Phangan",
      title: `${rw} — not available`,
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
  // w must be one of next/image's configured deviceSizes (828 ≈ our canvas).
  const photo =
    o.coverImage && coverOk
      ? `${getSiteUrl()}/_next/image?url=${encodeURIComponent(o.coverImage)}&w=828&q=55`
      : undefined;

  return renderOg({
    eyebrow: eyebrowParts.join(" · "),
    title: o.titleEn,
    features,
    photo,
  });
}
