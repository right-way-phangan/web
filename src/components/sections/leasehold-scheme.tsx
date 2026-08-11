import { Home, Scale, Trees } from "lucide-react";

const ICONS = { home: Home, land: Trees, law: Scale } as const;

/**
 * Правая колонка hero /leasehold: вертикальная схема «вилла ваша → земля в
 * лизе → деньги под контролем юриста». Декорация (aria-hidden учитывать не
 * нужно — текст осмысленный), строки приходят пропсами — EN и RU свои.
 */
export function LeaseholdScheme({
  rows,
}: {
  rows: { icon: keyof typeof ICONS; title: string; text: string }[];
}) {
  return (
    <div className="relative rounded-lg border border-forest-500/10 bg-cream-50/80 p-6 shadow-[0_24px_60px_-30px_rgba(11,61,58,0.3)]">
      {/* Связка между тремя кружками — вектор, а не градиентная полоска: она
          прочерчивается сверху вниз при появлении схемы, повторяя порядок
          чтения «вилла → земля → деньги». */}
      {/* Высота задана явно (top-14 + bottom-10 = 6rem): svg с viewBox иначе
          схлопывается до собственной пропорции вместо растяжения по top/bottom. */}
      <svg
        className="pointer-events-none absolute left-[2.6rem] top-14 h-[calc(100%-6rem)] w-px"
        viewBox="0 0 1 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="scheme-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--c-brass-500))" stopOpacity="0.5" />
            <stop offset="55%" stopColor="rgb(var(--c-forest-500))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(var(--c-forest-500))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="100"
          pathLength={1}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          stroke="url(#scheme-line)"
          className="draw-path draw-path-in"
        />
      </svg>
      <ul className="space-y-6">
        {rows.map((r) => {
          const Icon = ICONS[r.icon];
          return (
            <li key={r.title} className="relative flex gap-4">
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-panel text-panel-fg">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="font-serif text-lg text-forest-900">{r.title}</div>
                <div className="mt-0.5 text-sm leading-relaxed text-forest-500/75">{r.text}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
