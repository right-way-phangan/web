import { getPublicObjects } from "@/lib/data/objects";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// Text card (no photo) — self-contained on Edge.
export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — объекты недвижимости";

export default async function Image() {
  const objects = await getPublicObjects().catch(() => []);
  const n = objects.length;
  const districts = new Set(objects.map((o) => o.district).filter(Boolean)).size;

  return renderOg({
    eyebrow: "Ко Панган · Таиланд",
    title: "Земля, виллы и дома на Пангане.",
    subtitle: n
      ? `${n} лично проверенных объектов в ${districts} районах.`
      : "Лично проверенная земля, виллы и дома по всему острову.",
    features: ["Земля", "Виллы", "Дома", "Проверено"],
  });
}
