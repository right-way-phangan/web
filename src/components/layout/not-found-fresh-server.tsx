import { unstable_cache } from "next/cache";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { NotFoundFresh } from "@/components/layout/not-found-fresh";

// Корневая 404 входит в дерево КАЖДОГО маршрута, и срок кэша её данных
// становится сроком кэша всех страниц: с каталогом (5 мин, потом 1 ч) даже
// статичные /about и ~500 гайдов пересобирались по кругу при заходах ботов —
// это и выжгло ISR Writes/CPU на Vercel в октябре–ноябре 2026. Подборке на 404
// хватает суточной свежести, поэтому у неё своя сутки-живущая запись кэша
// (внутренний кэш каталога при промахе на срок страниц не влияет).
const getFresh = unstable_cache(
  async () => {
    const fresh = (await getPublicObjects())
      .filter((o) => o.coverImage)
      .slice(0, 3)
      .map(slimObjectForCard);
    // Пустой ответ (сбой каталога) не кэшируем на сутки: throw не сохраняется.
    if (fresh.length === 0) throw new Error("catalog empty");
    return fresh;
  },
  ["not-found-fresh"],
  { revalidate: 86_400 },
);

/**
 * "Fresh on the island" strip for the 404s (root and /ru). Server component
 * rendered under Suspense by the not-found pages: if the catalogue is down the
 * strip simply doesn't appear and the 404 stays intact.
 */
export async function FreshListings() {
  try {
    return <NotFoundFresh fresh={await getFresh()} />;
  } catch {
    // Каталог недоступен — 404 остаётся полноценной, просто без подборки.
    return null;
  }
}
