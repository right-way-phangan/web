import { Suspense } from "react";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { FreshListings } from "@/components/layout/not-found-fresh-server";

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
 *
 * RU has its own not-found under app/ru (reached via app/ru/[...notFound]) so
 * the Russian copy is server-rendered, not swapped in after hydration.
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
