import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { COMMONS_CREDITS, PEXELS_LICENSE_URL } from "@/content/credits";

export const metadata: Metadata = {
  title: "Кредиты фото",
  description:
    "Источники изображений и лицензии для фотографий, используемых на сайте Right Way Phangan.",
  alternates: { canonical: "/ru/credits", languages: { en: "/credits", ru: "/ru/credits", "x-default": "/credits" } },
};

export default function RussianCreditsPage() {
  return (
    <>
      <PageHero
        eyebrow="Кредиты"
        title="Кредиты фото."
        lede="Часть фотографий районов лицензирована у авторов через Wikimedia Commons. По условиям их лицензий Creative Commons мы указываем авторство ниже. Остальные изображения — representative-атмосфера под лицензией Pexels (атрибуция не требуется)."
      />

      <section className="container-prose py-12 md:py-16">
        <h2 className="font-serif text-2xl text-forest-900 md:text-3xl">
          Фотографии через Wikimedia Commons
        </h2>
        <p className="mt-3 max-w-prose text-sm text-forest-500/70">
          Реальные фотографии конкретного места, используются по указанной лицензии.
          Название ведёт к файлу-источнику, «лицензия» — к тексту лицензии.
        </p>

        <ul className="mt-8 divide-y divide-forest-500/10 border-y border-forest-500/10">
          {COMMONS_CREDITS.map((c) => (
            <li
              key={c.district}
              className="flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:justify-between md:gap-6"
            >
              <div>
                <p className="text-sm font-medium text-forest-900">{c.district}</p>
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-forest-500/80 underline-offset-2 hover:text-brass-500 hover:underline"
                >
                  «{c.title}»
                </a>
              </div>
              <p className="text-sm text-forest-500/70">
                {c.author} ·{" "}
                <a
                  href={c.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:text-brass-500 hover:underline"
                >
                  {c.license}
                </a>
              </p>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-serif text-2xl text-forest-900 md:text-3xl">
          Representative-изображения через Pexels
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-forest-500/70">
          Остальные фотографии районов и страниц — representative-атмосфера
          Ко&nbsp;Пангана / Сиамского залива под{" "}
          <a
            href={PEXELS_LICENSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:text-brass-500 hover:underline"
          >
            лицензией Pexels
          </a>{" "}
          (бесплатно для коммерческого использования, без атрибуции) — атмосфера, а не
          документальный снимок конкретного участка или пляжа.
        </p>
      </section>
    </>
  );
}
