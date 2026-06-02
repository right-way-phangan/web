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
    <section className="container-prose py-16 md:py-24">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-3 max-w-3xl text-balance font-serif text-3xl text-forest-900 md:text-4xl">
          {title}
        </h2>
      ) : null}

      <div className={`mt-12 grid gap-10 ${gridCols} md:gap-8`}>
        {principles.map((p) => (
          <div key={p.title}>
            <h3 className="font-serif text-2xl text-forest-900">{p.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-forest-500/80">
              {p.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
