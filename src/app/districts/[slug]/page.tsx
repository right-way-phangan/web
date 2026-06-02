import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { DISTRICTS, getDistrictBySlug } from "@/content/districts";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = getDistrictBySlug(slug);
  if (!d) return { title: "District not found" };
  return {
    title: d.title.split(" — ")[0],
    description: d.short,
  };
}

export default async function DistrictPage({ params }: Props) {
  const { slug } = await params;
  const d = getDistrictBySlug(slug);
  if (!d) notFound();

  const listingsHref = `/listings?district=${encodeURIComponent(d.amoName)}` as Route;
  const [name, subtitle] = d.title.split(" — ");

  // Other districts for the bottom strip
  const others = DISTRICTS.filter((x) => x.slug !== d.slug).slice(0, 3);

  return (
    <article>
      <div className="container-prose pt-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/districts">
            <ArrowLeft className="h-4 w-4" />
            All districts
          </Link>
        </Button>
      </div>

      <header className="container-prose pt-8 md:pt-12">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
          District
        </p>
        <h1 className="mt-4 max-w-3xl text-balance">{name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-forest-500/65 md:text-xl">
          {subtitle}
        </p>
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
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              Who buys here
            </p>
            <p className="mt-4 text-base leading-relaxed text-forest-500/85 md:text-lg">
              {d.audience}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
              What to expect
            </p>
            <ul className="mt-4 space-y-2.5">
              {d.expect.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-base text-forest-500/85 md:text-lg"
                >
                  <Check className="h-4 w-4 mt-1 shrink-0 text-forest-500/50" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-forest-500/10 bg-cream-200/30">
        <div className="container-prose py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-forest-900 md:text-4xl">
              See available listings in {name}.
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              Our current inventory in this district, filtered live from the
              catalog.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="md">
                <Link href={listingsHref}>
                  See {name} listings
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href="/contact">Ask about off-market plots</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-prose py-16 md:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
          More districts
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/districts/${o.slug}` as Route}
              className="group flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 transition-colors hover:border-forest-500/30"
            >
              <h3 className="font-serif text-xl text-forest-900">
                {o.title.split(" — ")[0]}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-500/70 line-clamp-3">
                {o.short}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                Read
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
