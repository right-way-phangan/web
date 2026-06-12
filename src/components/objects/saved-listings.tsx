"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Heart, ArrowRight } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import { useSaved } from "@/lib/saved/saved-context";
import { ObjectCard } from "./object-card";
import { CompareTable } from "./compare-table";
import { LeadForm } from "@/components/forms/lead-form";
import { formatPriceCompact } from "@/lib/utils/price";
import { useLocale, localeHref } from "@/lib/i18n/use-locale";
import { pluralRu } from "@/lib/i18n/dictionaries";

const SL = {
  en: {
    emptyTitle: "Your shortlist is empty.",
    emptyBody:
      "Tap the heart on any listing to save it here. Compare your favourites side by side, then send the whole list to us in one go.",
    browse: "Browse listings",
    savedCount: (n: number) => `${n} saved ${n === 1 ? "property" : "properties"}`,
    clearAll: "Clear all",
    sendTitle: "Send us your shortlist",
    sendBody:
      "We'll review the whole list, flag anything to watch, and reply with availability and the best next step — usually within the working day.",
    sendSubmit: "Send my shortlist",
    msgEmpty: "I'd like more information about my shortlist.",
    msgIntro: "I'd like more information about my shortlist:",
  },
  ru: {
    emptyTitle: "Ваш список пуст.",
    emptyBody:
      "Нажмите на сердечко у любого объекта, чтобы сохранить его здесь. Сравните избранное бок о бок и отправьте нам весь список разом.",
    browse: "Смотреть каталог",
    savedCount: (n: number) =>
      `${n} ${pluralRu(n, "сохранённый объект", "сохранённых объекта", "сохранённых объектов")}`,
    clearAll: "Очистить всё",
    sendTitle: "Отправьте нам ваш список",
    sendBody:
      "Мы посмотрим весь список, отметим, на что обратить внимание, и ответим по доступности и лучшему следующему шагу — обычно в течение рабочего дня.",
    sendSubmit: "Отправить мой список",
    msgEmpty: "Хочу больше информации по моему списку объектов.",
    msgIntro: "Хочу больше информации по моему списку объектов:",
  },
} as const;

export function SavedListings({ catalog }: { catalog: RealEstateObject[] }) {
  const locale = useLocale();
  const t = SL[locale];
  const { saved, ready, clear } = useSaved();

  // Saved objects in saved-order (newest first). Drop ids no longer in catalog.
  const items = useMemo(() => {
    const byRw = new Map(catalog.map((o) => [o.rwNumber, o]));
    return saved.map((rw) => byRw.get(rw)).filter((o): o is RealEstateObject => !!o);
  }, [catalog, saved]);

  const shortlistMessage = useMemo(() => {
    if (items.length === 0) return t.msgEmpty;
    const lines = items.map(
      (o) =>
        `• ${o.rwNumber} — ${o.titleEn}${o.priceThb ? ` (${formatPriceCompact(o.priceThb)})` : ""}`,
    );
    return `${t.msgIntro}\n${lines.join("\n")}`;
  }, [items, t]);

  if (!ready) {
    return (
      <div className="mt-12 h-40 animate-pulse rounded-sm border border-forest-500/10 bg-forest-500/5" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-12 rounded-sm border border-forest-500/10 bg-cream-50 px-6 py-16 text-center">
        <Heart className="mx-auto h-8 w-8 text-forest-500/25" strokeWidth={1.5} />
        <p className="mt-4 text-lg text-forest-900">{t.emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-forest-500/70">{t.emptyBody}</p>
        <Link
          href={localeHref(locale, "/listings") as Route}
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-forest-500 px-6 py-3 text-sm font-medium text-cream-100 transition-colors hover:bg-forest-400"
        >
          {t.browse}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-12">
      <div className="flex items-center justify-between">
        <p className="text-sm text-forest-500/70">{t.savedCount(items.length)}</p>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-forest-500/70 underline-offset-4 hover:text-forest-500 hover:underline"
        >
          {t.clearAll}
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((o) => (
          <ObjectCard key={o.id} object={o} />
        ))}
      </div>

      {/* Compare table */}
      {items.length > 1 ? <CompareTable items={items} /> : null}

      {/* Send shortlist */}
      <section className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:p-8">
        <h2 className="font-serif text-2xl text-forest-900">{t.sendTitle}</h2>
        <p className="mt-2 max-w-xl text-sm text-forest-500/70">{t.sendBody}</p>
        <div className="mt-6 max-w-xl">
          <LeadForm
            source="contact"
            kind="shortlist"
            locale={locale}
            defaultMessage={shortlistMessage}
            submitLabel={t.sendSubmit}
          />
        </div>
      </section>
    </div>
  );
}
