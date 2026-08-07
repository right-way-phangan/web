import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { DISTRICTS_RU, getDistrictRuBySlug } from "@/content/districts.ru";
import { districtHasHero } from "@/content/districts";
import { Button } from "@/components/ui/button";
import { ObjectCard } from "@/components/objects/object-card";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { ItemListJsonLd } from "@/components/seo/item-list-json-ld";
import { getDistrictMarket } from "@/lib/data/rental-market";
import { DistrictMarketPanel } from "@/components/insights/district-market";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export function generateStaticParams() {
  return DISTRICTS_RU.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = getDistrictRuBySlug(slug);
  if (!d) return { title: "Район не найден" };
  return {
    title: d.title.split(" — ")[0],
    description: d.short,
    alternates: {
      canonical: `/ru/districts/${d.slug}`,
      languages: { en: `/districts/${d.slug}`, ru: `/ru/districts/${d.slug}`, "x-default": `/districts/${d.slug}` },
    },
  };
}

export default async function RussianDistrictPage({ params }: Props) {
  const { slug } = await params;
  const d = getDistrictRuBySlug(slug);
  if (!d) notFound();

  const listingsHref = `/ru/listings?district=${encodeURIComponent(d.amoName)}` as Route;
  const [name, subtitle] = d.title.split(" — ");
  const siteUrl = getSiteUrl();

  const all = await getPublicObjects();
  const inDistrict = all.filter((o) => o.district === d.amoName);
  const preview = inDistrict.slice(0, 6).map(slimObjectForCard);
  const districtMarket = getDistrictMarket(d.amoName);
  const others = DISTRICTS_RU.filter((x) => x.slug !== d.slug).slice(0, 3);

  return (
    <article>
      <ItemListJsonLd name={`Объекты в районе ${name} — Right Way`} objects={inDistrict} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Главная", url: `${siteUrl}/ru` },
          { name: "Районы", url: `${siteUrl}/ru/districts` },
          { name: name, url: `${siteUrl}/ru/districts/${d.slug}` },
        ]}
      />
      <div className="container-prose pt-8">
        <Button asChild variant="ghost" size="sm">
          <Link href={"/ru/districts" as Route}>
            <ArrowLeft className="h-4 w-4" />
            Все районы
          </Link>
        </Button>
      </div>

      <header className="container-prose pt-6 md:pt-8">
        <div className="relative isolate overflow-hidden rounded-sm bg-panel">
          {districtHasHero(d.slug) ? (
            <Image
              src={`/images/districts/${d.slug}.jpg`}
              alt={`${name}, Ко Панган`}
              fill
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-panel/92 via-panel/55 to-panel/25" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-panel/75 via-panel/30 to-transparent" aria-hidden />
          <div className="relative z-10 flex min-h-[42vh] flex-col justify-end p-7 md:min-h-[48vh] md:p-12">
            <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-300">Район</p>
            <h1 className="mt-3 max-w-3xl text-balance text-panel-fg">{name}</h1>
            <p className="mt-3 max-w-2xl text-lg text-panel-fg/85 md:text-xl">{subtitle}</p>
          </div>
        </div>
      </header>

      <section className="container-prose py-12 md:py-16">
        <div className="max-w-prose space-y-5 text-base leading-relaxed text-forest-500/85 md:text-lg">
          {d.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section className="container-prose pb-16 md:pb-20">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
              Кто здесь покупает
            </p>
            <p className="mt-4 text-base leading-relaxed text-forest-500/85 md:text-lg">{d.audience}</p>
          </div>
          <div>
            <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
              Чего ожидать
            </p>
            <ul className="mt-4 space-y-2.5">
              {d.expect.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-base text-forest-500/85 md:text-lg">
                  <Check className="h-4 w-4 mt-1 shrink-0 text-forest-500/50" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {districtMarket ? <DistrictMarketPanel dm={districtMarket} locale="ru" /> : null}

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              {inDistrict.length > 0 ? `Доступно в районе ${name}.` : `Объекты в районе ${name}.`}
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              {inDistrict.length > 0
                ? `${inDistrict.length} ${pluralObjects(inDistrict.length)} в этом районе прямо сейчас — фильтруется вживую из каталога.`
                : "Наше текущее предложение в этом районе, фильтруется вживую из каталога."}
            </p>
          </div>

          {preview.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((object) => (
                <ObjectCard key={object.id} object={object} />
              ))}
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="md">
              <Link href={listingsHref}>
                {inDistrict.length > preview.length
                  ? `Все объекты в районе ${name} (${inDistrict.length})`
                  : `Объекты в районе ${name}`}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href={"/ru/contact" as Route}>Спросить про off-market участки</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-prose py-16 md:py-24">
        <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">Другие районы</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/ru/districts/${o.slug}` as Route}
              className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-colors hover:border-forest-500/30"
            >
              <h3 className="font-serif text-xl text-forest-900">{o.title.split(" — ")[0]}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-500/70 line-clamp-3">{o.short}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                Подробнее
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

/** Russian plural for "объект": 1 объект, 2 объекта, 5 объектов. */
function pluralObjects(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "объект";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "объекта";
  return "объектов";
}
