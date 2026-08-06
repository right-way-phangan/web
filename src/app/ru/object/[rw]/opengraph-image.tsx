import {
  renderObjectOg,
  objectOgSize,
  objectOgContentType,
  objectOgAlt,
} from "@/lib/seo/object-og";

// Зеркало EN-роута: страница задаёт свой openGraph без images, поэтому
// file-based картинка нужна и в русском сегменте — иначе ссылка на объект
// уходит в Telegram и WhatsApp вообще без превью.
export const runtime = "edge";
export const size = objectOgSize;
export const contentType = objectOgContentType;
export const alt = objectOgAlt;

interface Props {
  params: { rw: string };
}

export default async function Image({ params }: Props) {
  return renderObjectOg(params.rw);
}
