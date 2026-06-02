import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

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
      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {services.map((s) => (
          <article
            key={s.title}
            className="flex flex-col rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-8"
          >
            <h3 className="font-serif text-2xl text-forest-900">{s.title}</h3>
            <p className="mt-4 flex-1 text-base leading-relaxed text-forest-500/80">
              {s.text}
            </p>
            {s.meta ? (
              <p className="mt-6 text-xs font-medium uppercase tracking-[0.15em] text-brass-500">
                {s.meta}
              </p>
            ) : null}
            {s.href ? (
              <Link
                href={s.href}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 hover:text-brass-500 transition-colors"
              >
                Learn more
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
