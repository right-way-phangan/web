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
    <section className="container-prose py-16 md:py-24">
      <ol className="relative space-y-12 md:space-y-16">
        {steps.map((step, i) => (
          <Appear key={step.number} delay={(i % 2) * 0.06}>
            <li className="relative grid gap-6 md:grid-cols-[120px_1fr] md:gap-10">
              {/* Связка до следующего шага: раньше это был градиентный обрубок
                  высотой в цифру — теперь вектор во весь промежуток, который
                  прочерчивается, пока шаг проходит экран. Путь ведёт от номера
                  к номеру, поэтому читается как маршрут, а не как насечка. */}
              {i < steps.length - 1 ? (
                /* h-full, а не top/bottom: у svg есть внутренняя пропорция из
                   viewBox, и при height:auto он схлопывается до неё (100px)
                   вместо растяжения. Высота li плюс отступ top-16 как раз
                   доводят линию до цифры следующего шага. */
                <svg
                  className="draw-line draw-line-scroll pointer-events-none absolute left-3 top-16 hidden h-full w-px text-forest-500 md:block"
                  viewBox="0 0 1 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    {/* userSpaceOnUse обязателен: bbox вертикальной линии
                        нулевой ширины, а градиент в objectBoundingBox на
                        вырожденном bbox не отрисовывается — линия просто
                        исчезает. */}
                    <linearGradient
                      id={`step-line-${step.number}`}
                      gradientUnits="userSpaceOnUse"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="100"
                    >
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                      <stop offset="70%" stopColor="currentColor" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
                    </linearGradient>
                  </defs>
                  <line
                    x1="0.5"
                    y1="0"
                    x2="0.5"
                    y2="100"
                    strokeWidth={1}
                    stroke={`url(#step-line-${step.number})`}
                  />
                </svg>
              ) : null}

              {/* Number column */}
              <div className="relative">
                <div className="font-serif text-5xl text-forest-500/25 md:text-6xl">
                  {step.number.toString().padStart(2, "0")}
                </div>
              </div>

              {/* Content */}
              <div className="md:pt-2">
                <h3 className="font-serif text-2xl text-forest-900 md:text-3xl">
                  {step.title}
                </h3>
                {step.duration ? (
                  <p className="mt-1 flex items-center gap-2.5 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-700">
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
