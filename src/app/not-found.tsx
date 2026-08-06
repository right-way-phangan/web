import { Suspense } from "react";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { NotFoundFresh } from "@/components/layout/not-found-fresh";

/**
 * Smart 404: a dead link still lands on live inventory.
 *
 * Статика (заголовок, копия, выходы) рендерится синхронно, подборка объектов —
 * отдельным Suspense-ребёнком. Раньше весь not-found был одним async-компонентом
 * с запросом в каталог: на путях, где notFound() зовётся из generateMetadata
 * (объект, проект, статья), прод отдавал 404 с ПУСТЫМ <main> и __next_error__ —
 * статус верный, страница белая. Теперь что бы ни случилось с каталогом,
 * пользователь видит полноценную 404 с ссылками, а карточки просто не приедут.
 *
 * Next embeds the root not-found into every page's initial RSC payload, so
 * the objects are cut down to exactly what ObjectCard renders — passing full
 * objects (galleries, descriptions, RU-sourced notes) would bloat every page.
 */
export default function NotFound() {
  return (
    <NotFoundContent
      fresh={
        <Suspense fallback={null}>
          <FreshListings />
        </Suspense>
      }
    />
  );
}

async function FreshListings() {
  try {
    const objects = await getPublicObjects();
    const fresh = objects
      .filter((o) => o.coverImage)
      .slice(0, 3)
      .map(slimObjectForCard);
    if (fresh.length === 0) return null;
    return <NotFoundFresh fresh={fresh} />;
  } catch {
    // Каталог недоступен — 404 остаётся полноценной, просто без подборки.
    return null;
  }
}
