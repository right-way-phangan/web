import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import { DISTRICTS } from "@/content/districts";
import { DISTRICTS_RU } from "@/content/districts.ru";
import { SectionEyebrow } from "./section-eyebrow";
import { Appear } from "@/components/motion/appear";
import { getPublicObjects } from "@/lib/data/objects";
import type { Locale } from "@/lib/i18n/dictionaries";

// Шесть витринных районов — у всех есть фото /images/districts/<slug>.jpg.
const FEATURED_SLUGS = ["sri-thanu", "haad-yao", "chaloklum", "thong-sala", "ban-tai"];

const COPY = {
  en: {
    guide: "District guide",
    eyebrow: "Where to look",
    title: "Districts with character.",
    lede: "Every district has its own buyer. Start where yours lives.",
    all: "All districts",
  },
  ru: {
    guide: "Гид по району",
    eyebrow: "Где искать",
    title: "Районы с характером.",
    lede: "У каждого района свой покупатель. Начните с того, который ваш.",
    all: "Все районы",
  },
} as const;

function listingsLabel(n: number, locale: Locale): string {
  if (locale === "en") return n === 1 ? "1 listing" : `${n} listings`;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} объект`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} объекта`;
  return `${n} объектов`;
}

/**
 * Бенто «Где искать» на главной: шесть районов с фото, живым счётчиком
 * активных объектов и ссылкой на гайд района. Первый тайл крупный (2×2) —
 * классическая бенто-иерархия. Счётчики падают в 0 без каталога — секция
 * всё равно рендерится (фото и гайды не зависят от API).
 */
export async function DistrictsBento({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const base = locale === "ru" ? "/ru" : "";
  const source = locale === "ru" ? DISTRICTS_RU : DISTRICTS;
  const featured = FEATURED_SLUGS.map((slug) => source.find((d) => d.slug === slug)).filter(
    (d): d is (typeof source)[number] => Boolean(d),
  );

  let counts = new Map<string, number>();
  try {
    const objects = await getPublicObjects();
    counts = new Map(
      featured.map((d) => [d.slug, objects.filter((o) => o.district === d.amoName).length]),
    );
  } catch {
    /* каталог недоступен — тайлы без счётчиков */
  }

  return (
    <section className="container-prose relative isolate py-14 md:py-20">
      <div
        className="pointer-events-none absolute -inset-x-16 inset-y-0 -z-10 bg-[radial-gradient(70%_90%_at_88%_100%,rgba(21,168,168,0.06),transparent_62%)]"
        aria-hidden
      />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
          <h2 className="mt-5 max-w-3xl text-balance font-serif text-3xl text-forest-900 md:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 max-w-xl text-base text-forest-500/75">{t.lede}</p>
        </div>
        <Link
          href={`${base}/districts` as Route}
          className="group inline-flex items-center gap-1.5 rounded-sm border border-forest-500/25 px-4 py-2.5 text-sm font-medium text-forest-500 transition-colors hover:border-brass-500/60 hover:text-brass-700"
        >
          {t.all}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-3 md:auto-rows-[170px] md:grid-cols-4 md:gap-4">
        {featured.map((d, i) => {
          const n = counts.get(d.slug) ?? 0;
          const name = d.title.split("—")[0]?.trim() ?? d.amoName;
          return (
            <Appear
              key={d.slug}
              delay={(i % 4) * 0.05}
              className={i === 0 ? "col-span-2 row-span-2" : ""}
            >
              <Link
                href={`${base}/districts/${d.slug}` as Route}
                className="group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-lg bg-panel"
              >
                <Image
                  src={`/images/districts/${d.slug}.jpg`}
                  alt=""
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 640px, 100vw" : "(min-width: 768px) 320px, 50vw"}
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-panel/85 via-panel/25 to-transparent"
                  aria-hidden
                />
                <div className="relative z-10 p-4 md:p-5">
                  <div className={`font-serif text-panel-fg ${i === 0 ? "text-2xl md:text-3xl" : "text-lg"}`}>
                    {name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs uppercase tracking-eyebrow text-panel-fg/70">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {n > 0 ? listingsLabel(n, locale) : t.guide}
                  </div>
                </div>
              </Link>
            </Appear>
          );
        })}
      </div>
    </section>
  );
}
