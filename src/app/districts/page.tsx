import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { DISTRICTS } from "@/content/districts";

export const metadata: Metadata = {
  title: "Districts",
  description:
    "Seven districts of Koh Phangan where Right Way focuses — each with its own character, price profile, and buyer match.",
};

function hueFor(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

export default function DistrictsPage() {
  return (
    <>
      <PageHero
        eyebrow="Districts"
        title="Where we work — seven districts of Koh Phangan."
        lede="Right Way focuses on seven districts that cover roughly ninety percent of high-quality residential land on the island. Each has its own character, price profile, and buyer match. We don't claim to cover all of Phangan with equal depth — these are where our network, data, and experience are strongest."
      />

      <section className="container-prose py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {DISTRICTS.map((d) => {
            const h = hueFor(d.slug);
            return (
              <Link
                key={d.slug}
                href={`/districts/${d.slug}` as Route}
                className="group flex flex-col overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50 transition-all hover:border-forest-500/30 hover:shadow-lg"
              >
                <div
                  className="relative aspect-[16/9] overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(135deg, hsl(${h} 30% 86%) 0%, hsl(${(h + 40) % 360} 25% 76%) 100%)`,
                  }}
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
                  <h2 className="font-serif text-2xl text-forest-900 md:text-3xl">
                    {d.title.split(" — ")[0]}
                  </h2>
                  <p className="text-sm text-forest-500/60 md:text-base">
                    {d.title.split(" — ")[1]}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-forest-500/85 md:text-base">
                    {d.short}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 transition-colors group-hover:text-brass-500">
                    Read more
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
              Not sure which district fits?
            </h2>
            <p className="mt-4 text-lg text-forest-500/70">
              A short discovery call usually narrows it down faster than
              reading through seven pages. Tell us what matters most — quiet,
              community, beach access, infrastructure, build potential — and
              we&rsquo;ll point you to one or two districts to explore first.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-sm bg-forest-500 px-6 py-3 text-sm font-medium text-cream-100 transition-colors hover:bg-forest-400"
              >
                Book a discovery call
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
