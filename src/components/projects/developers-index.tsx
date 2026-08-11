import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { getDevelopers } from "@/lib/data/projects";
import { getDeveloperProfile } from "@/content/developers";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { Appear } from "@/components/motion/appear";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";

/** Shared index for /developers and /ru/developers — vetted developers we work with. */
export async function DevelopersIndex({ locale }: { locale: Locale }) {
  const t = getProjectsDict(locale);
  const developers = await getDevelopers();

  return (
    <section className="container-prose py-10 md:py-14 aura">
      <SectionEyebrow>{t.developers.indexEyebrow}</SectionEyebrow>
      <h1 className="mt-3 max-w-3xl text-balance">{t.developers.indexTitle}</h1>
      <p className="mt-3 max-w-2xl text-base text-forest-500/70">
        {t.developers.indexLede}
      </p>

      {developers.length === 0 ? (
        <p className="mt-12 rounded-sm border border-dashed border-forest-500/20 p-10 text-center text-forest-500/60">
          {t.empty}
        </p>
      ) : (
        /* Колонки под фактическое число карточек: при двух застройщиках сетка
           на три колонки оставляла пустую треть справа. Тот же приём, что в
           секции отзывов. */
        <div
          className={`mt-10 grid gap-6 sm:grid-cols-2 ${
            developers.length >= 3 ? "lg:grid-cols-3" : ""
          }`}
        >
          {developers.map((dev, i) => {
            const profile = getDeveloperProfile(dev.slug);
            const href = localePath(locale, `/developers/${dev.slug}`);
            return (
              <Appear key={dev.slug} delay={(i % 3) * 0.08} className="h-full">
                <Link
                  href={href as Route}
                  className="group flex h-full flex-col rounded-sm border border-forest-500/12 bg-cream-50/60 p-6 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-brass-500/40 hover:shadow-[0_16px_40px_-30px_rgba(4,38,46,0.55)]"
                >
                  <h2 className="font-serif text-2xl text-forest-900">
                    {dev.name}
                  </h2>
                  {profile?.hero?.tagline ? (
                    <p className="mt-2 text-sm text-forest-500/75">
                      {profile.hero.tagline[locale]}
                    </p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="text-sm text-forest-500/55">
                      {t.count(dev.projects.length)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-forest-500/50 transition-colors group-hover:text-brass-500" />
                  </div>
                </Link>
              </Appear>
            );
          })}
        </div>
      )}
    </section>
  );
}
