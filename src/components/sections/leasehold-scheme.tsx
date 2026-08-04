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
      <div
        className="absolute bottom-10 left-[2.6rem] top-14 w-px bg-gradient-to-b from-brass-500/50 via-forest-500/20 to-transparent"
        aria-hidden
      />
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
