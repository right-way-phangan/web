import { Appear } from "@/components/motion/appear";

interface Principle {
  title: string;
  text: string;
}

interface Props {
  title?: string;
  eyebrow?: string;
  principles: Principle[];
  columns?: 2 | 3;
}

export function PrincipleGrid({
  title,
  eyebrow,
  principles,
  columns = 3,
}: Props) {
  const gridCols = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <section className="container-prose py-20 md:py-28">
      {eyebrow ? (
        <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-eyebrow text-brass-700">
          <span className="h-px w-10 bg-brass-600/60" aria-hidden />
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-5 max-w-3xl text-balance font-serif text-3xl text-forest-900 md:text-4xl">
          {title}
        </h2>
      ) : null}

      <div className={`mt-14 grid gap-10 ${gridCols} md:gap-8`}>
        {principles.map((p, i) => (
          <Appear key={p.title} delay={(i % 3) * 0.08} className="h-full">
            <div className="h-full border-t border-forest-900/10 pt-6">
              <h3 className="font-serif text-2xl text-forest-900">{p.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-forest-600/80">
                {p.text}
              </p>
            </div>
          </Appear>
        ))}
      </div>
    </section>
  );
}
