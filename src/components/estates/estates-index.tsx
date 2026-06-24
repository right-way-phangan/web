import { getPublishedEstates } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { EstateCard } from "./estate-card";
import { Appear } from "@/components/motion/appear";

/** Общая индекс-сетка для /estates и /ru/estates. */
export function EstatesIndex({ locale }: { locale: Locale }) {
  const t = getEstatesDict(locale);
  const estates = getPublishedEstates();

  return (
    <section className="container-prose py-10 md:py-14">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">{t.eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-balance">{t.indexTitle}</h1>
      <p className="mt-3 max-w-2xl text-base text-forest-500/70">{t.indexLede}</p>
      <p className="mt-2 text-sm text-forest-500/55">{t.count(estates.length)}</p>

      {estates.length === 0 ? (
        <p className="mt-12 rounded-sm border border-dashed border-forest-500/20 p-10 text-center text-forest-500/60">
          {t.empty}
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {estates.map((estate, i) => (
            <Appear key={estate.slug} delay={(i % 3) * 0.08} className="h-full">
              <EstateCard
                estate={estate}
                href={localePath(locale, `/estates/${estate.slug}`)}
                locale={locale}
              />
            </Appear>
          ))}
        </div>
      )}
    </section>
  );
}
