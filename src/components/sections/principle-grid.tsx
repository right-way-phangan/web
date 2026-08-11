import { Appear } from "@/components/motion/appear";
import { SectionEyebrow } from "@/components/sections/section-eyebrow";

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
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
      ) : null}
      {title ? (
        <h2 className="mt-5 max-w-3xl text-balance font-serif text-3xl text-forest-900 md:text-4xl">
          {title}
        </h2>
      ) : null}

      <div className={`mt-12 grid gap-6 ${gridCols}`}>
        {principles.map((p, i) => (
          <Appear key={p.title} delay={(i % 3) * 0.05} className="h-full">
            <div className="group h-full rounded-bezel bg-cream-200/50 p-1.5 ring-1 ring-forest-900/5 transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft">
              <div className="flex h-full flex-col rounded-core bg-cream-50 p-8 shadow-bezel">
                <h3 className="font-serif text-2xl text-forest-900">{p.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-forest-600/80">
                  {p.text}
                </p>
              </div>
            </div>
          </Appear>
        ))}
      </div>
    </section>
  );
}
