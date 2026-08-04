import Image from "next/image";
import { BadgeCheck } from "lucide-react";

/**
 * Правая колонка hero /sell: стилизованное превью «как ваш объект выглядит
 * у нас» — карточка листинга с бейджем проверки. Чистая декорация
 * (aria-hidden), все строки приходят пропсами — EN и RU страницы передают свои.
 */
export function SellPreviewCard({
  tag,
  title,
  meta,
  foot,
}: {
  tag: string;
  title: string;
  meta: string;
  foot: string;
}) {
  return (
    <div
      aria-hidden
      className="relative rotate-1 rounded-lg border border-forest-500/10 bg-cream-50 p-3 shadow-[0_24px_60px_-30px_rgba(11,61,58,0.35)] transition-transform duration-300 hover:rotate-0"
    >
      <div className="relative h-44 overflow-hidden rounded-md">
        <Image src="/hero/scene-4.jpg" alt="" fill sizes="416px" className="object-cover" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-panel/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-panel-fg backdrop-blur">
          <BadgeCheck className="h-3 w-3 text-brass-300" />
          {tag}
        </span>
      </div>
      <div className="p-3">
        <div className="font-serif text-xl text-forest-900">{title}</div>
        <div className="mt-1 text-sm leading-relaxed text-forest-500/75">{meta}</div>
        <div className="mt-3 border-t border-forest-500/10 pt-3 text-[11px] uppercase tracking-[0.15em] text-brass-700">
          {foot}
        </div>
      </div>
    </div>
  );
}
