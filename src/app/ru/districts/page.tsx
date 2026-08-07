import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { DISTRICT_COORDS, districtHasHero } from "@/content/districts";
import { DISTRICTS_RU } from "@/content/districts.ru";
import { DistrictsMap } from "@/components/districts/districts-map";
import type { DistrictPoint } from "@/components/districts/districts-map-leaflet";
import { getPublicObjects } from "@/lib/data/objects";

export const metadata: Metadata = {
  title: "Районы",
  description:
    "Каждый район Ко Пангана глазами Right Way — у каждого свой характер, ценовой профиль и «свой» покупатель, от велнес-запада до тихих холмов в глубине острова.",
  alternates: { canonical: "/ru/districts", languages: { en: "/districts", ru: "/ru/districts", "x-default": "/districts" } },
};

export const revalidate = 300;

async function buildDistrictPoints(): Promise<DistrictPoint[]> {
  const objects = await getPublicObjects();
  const points = DISTRICTS_RU.map((d) => {
    const mine = objects.filter(
      (o) => o.district === d.amoName && o.lat != null && o.lng != null,
    );
    const fallback = DISTRICT_COORDS[d.slug];
    const lat = mine.length ? mine.reduce((s, o) => s + o.lat!, 0) / mine.length : fallback?.lat;
    const lng = mine.length ? mine.reduce((s, o) => s + o.lng!, 0) / mine.length : fallback?.lng;
    const count = objects.filter((o) => o.district === d.amoName).length;
    if (lat == null || lng == null) return null;
    const [name] = d.title.split(" — ");
    return { slug: d.slug, amoName: d.amoName, name, lat, lng, count };
  }).filter((p): p is DistrictPoint => p !== null);
  // Real coords — nearby districts grouped by map clustering, split on zoom-in.
  return points;
}

export default async function RussianDistrictsPage() {
  const districtPoints = await buildDistrictPoints();

  return (
    <>
      <PageHero
        eyebrow="Районы"
        title="Где мы работаем — по всему Ко Пангану."
        lede="Мы покрываем весь остров. У каждого района свой характер, ценовой профиль и «свой» покупатель — от велнес-побережья на западе до премиального востока, рабочего севера и тихих холмов в глубине. Здесь наша сеть, данные и опыт на земле превращают локальное знание в правильный короткий список под вас."
      />

      <section className="container-prose pt-12 md:pt-16">
        <p className="mb-6 text-sm text-forest-500/70">
          Нажмите на район на карте, чтобы сразу перейти к его актуальным объектам.
        </p>
        <DistrictsMap points={districtPoints} />
      </section>

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {DISTRICTS_RU.map((d) => {
            const [name, subtitle] = d.title.split(" — ");
            return (
              <Link
                key={d.slug}
                href={`/ru/districts/${d.slug}` as Route}
                className="group flex flex-col overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50 transition-[border-color,box-shadow] duration-300 hover:border-forest-500/30 hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-panel">
                  {districtHasHero(d.slug) ? (
                    <Image
                      src={`/images/districts/${d.slug}.jpg`}
                      alt={`${name}, Ко Панган`}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-panel/80 via-panel/10 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <h2 className="font-serif text-2xl text-panel-fg md:text-3xl">{name}</h2>
                    <p className="mt-0.5 text-sm text-panel-fg/85">{subtitle}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
                  <p className="text-sm leading-relaxed text-forest-500/85 md:text-base">{d.short}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                    Подробнее
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              Не уверены, какой район подходит?
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              Короткий вводный звонок обычно сужает выбор быстрее, чем чтение всех
              страниц по районам. Скажите, что важнее всего — тишина, сообщество, выход к пляжу,
              инфраструктура, потенциал застройки — и мы подскажем один-два района,
              с которых стоит начать.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={"/ru/contact" as Route}
                className="inline-flex items-center gap-2 rounded-sm bg-panel px-6 py-3 text-sm font-medium text-panel-fg transition-colors hover:bg-forest-400"
              >
                Записаться на вводный звонок
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
