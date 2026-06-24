import { Appear } from "@/components/motion/appear";

interface Step {
  number: number;
  title: string;
  duration?: string;
  text: string;
}

interface Props {
  steps: Step[];
}

export function ProcessTimeline({ steps }: Props) {
  return (
    <section className="container-prose py-20 md:py-28">
      <ol className="relative space-y-12 md:space-y-16">
        {steps.map((step, i) => (
          <Appear key={step.number} delay={(i % 2) * 0.06}>
            <li className="relative grid gap-6 md:grid-cols-[120px_1fr] md:gap-10">
              {/* Number column */}
              <div className="relative">
                <div className="font-serif text-5xl text-forest-500/25 md:text-6xl">
                  {step.number.toString().padStart(2, "0")}
                </div>
                {/* Vertical connector except after last */}
                {i < steps.length - 1 ? (
                  <div className="absolute left-3 top-16 hidden h-full w-px bg-gradient-to-b from-forest-500/20 to-transparent md:block" />
                ) : null}
              </div>

              {/* Content */}
              <div className="md:pt-2">
                <h3 className="font-serif text-2xl text-forest-900 md:text-3xl">
                  {step.title}
                </h3>
                {step.duration ? (
                  <p className="mt-1 flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-brass-700">
                    <span className="h-px w-7 bg-brass-600/60" aria-hidden />
                    {step.duration}
                  </p>
                ) : null}
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-forest-600/85 md:text-lg">
                  {step.text}
                </p>
              </div>
            </li>
          </Appear>
        ))}
      </ol>
    </section>
  );
}
