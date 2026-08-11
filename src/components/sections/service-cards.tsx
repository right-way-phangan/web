import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { Appear } from "@/components/motion/appear";

interface Service {
  title: string;
  text: string;
  meta?: string;
  href?: Route;
}

interface Props {
  services: Service[];
}

export function ServiceCards({ services }: Props) {
  return (
    <section className="container-prose py-16 md:py-24">
      <div className="grid gap-6 md:grid-cols-3 md:gap-6">
        {services.map((s, i) => (
          <Appear key={s.title} delay={(i % 3) * 0.08} className="h-full">
            {/* Double-bezel — machined like physical hardware */}
            <div className="group h-full rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5 transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft">
              <article className="flex h-full flex-col rounded-core bg-cream-50 p-7 shadow-bezel md:p-8">
                <h3 className="font-serif text-2xl text-forest-900">{s.title}</h3>
                <p className="mt-4 flex-1 text-base leading-relaxed text-forest-600/80">
                  {s.text}
                </p>
                {s.meta ? (
                  <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-brass-700">
                    {s.meta}
                  </p>
                ) : null}
                {s.href ? (
                  <Link
                    href={s.href}
                    className="group/link mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 transition-colors hover:text-brass-600"
                  >
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" />
                  </Link>
                ) : null}
              </article>
            </div>
          </Appear>
        ))}
      </div>
    </section>
  );
}
