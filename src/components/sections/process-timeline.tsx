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
    <section className="container-prose py-16 md:py-24">
      <ol className="relative space-y-12 md:space-y-16">
        {steps.map((step, i) => (
          <li key={step.number} className="relative grid gap-6 md:grid-cols-[120px_1fr] md:gap-10">
            {/* Number column */}
            <div className="relative">
              <div className="font-serif text-5xl text-forest-500/30 md:text-6xl">
                {step.number.toString().padStart(2, "0")}
              </div>
              {/* Vertical connector except after last */}
              {i < steps.length - 1 ? (
                <div className="absolute left-3 top-16 hidden h-full w-px bg-forest-500/15 md:block" />
              ) : null}
            </div>

            {/* Content */}
            <div className="md:pt-2">
              <h3 className="font-serif text-2xl text-forest-900 md:text-3xl">
                {step.title}
              </h3>
              {step.duration ? (
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                  {step.duration}
                </p>
              ) : null}
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-forest-500/85 md:text-lg">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
