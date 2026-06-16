"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Heart, ArrowRight, Share2, Check, Import } from "lucide-react";
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
    share: "Share shortlist",
    shareCopied: "Link copied",
    shareTitle: "My Phangan shortlist — Right Way",
    sharedBanner: (n: number) =>
      `A shortlist shared with you — ${n} ${n === 1 ? "property" : "properties"}.`,
    sharedSave: "Add to my shortlist",
    sharedSaved: "Added",
    sharedMine: "View my own shortlist",
    sharedEmpty:
      "The shared listings are no longer available — they may have been sold or withdrawn.",
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
    share: "Поделиться подборкой",
    shareCopied: "Ссылка скопирована",
    shareTitle: "Моя подборка на Пангане — Right Way",
    sharedBanner: (n: number) =>
      `С вами поделились подборкой — ${n} ${pluralRu(n, "объект", "объекта", "объектов")}.`,
    sharedSave: "Сохранить себе",
    sharedSaved: "Сохранено",
    sharedMine: "Моя подборка",
    sharedEmpty:
      "Объекты из подборки больше не доступны — возможно, проданы или сняты с продажи.",
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
  const { saved, ready, clear, addMany } = useSaved();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [imported, setImported] = useState(false);

  const byRw = useMemo(
    () => new Map(catalog.map((o) => [o.rwNumber, o])),
    [catalog],
  );

  // Shared view: /saved?rw=RW-L0001,RW-V0003 shows someone else's shortlist
  // without touching the visitor's own until they choose to import it.
  const sharedRws = useMemo(() => {
    const raw = params.get("rw");
    if (!raw) return null;
    const list = raw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    return list.length > 0 ? list : null;
  }, [params]);

  // Saved objects in saved-order (newest first). Drop ids no longer in catalog.
  const ownItems = useMemo(
    () => saved.map((rw) => byRw.get(rw)).filter((o): o is RealEstateObject => !!o),
    [byRw, saved],
  );
  const sharedItems = useMemo(
    () =>
      sharedRws
        ? sharedRws.map((rw) => byRw.get(rw)).filter((o): o is RealEstateObject => !!o)
        : null,
    [byRw, sharedRws],
  );

  const isShared = sharedItems !== null;
  const items = sharedItems ?? ownItems;

  const shortlistMessage = useMemo(() => {
    if (items.length === 0) return t.msgEmpty;
    const lines = items.map(
      (o) =>
        `• ${o.rwNumber} — ${o.titleEn}${o.priceThb ? ` (${formatPriceCompact(o.priceThb)})` : ""}`,
    );
    return `${t.msgIntro}\n${lines.join("\n")}`;
  }, [items, t]);

  const onShare = async () => {
    const url = `${window.location.origin}${localeHref(locale, "/saved")}?rw=${ownItems
      .map((o) => o.rwNumber)
      .join(",")}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: t.shareTitle, url });
        return;
      } catch {
        /* dismissed — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — nothing sensible to do */
    }
  };

  const onImport = () => {
    if (!sharedItems) return;
    addMany(sharedItems.map((o) => o.rwNumber));
    setImported(true);
  };

  if (!ready && !isShared) {
    return (
      <div className="mt-12 h-40 animate-pulse rounded-sm border border-forest-500/10 bg-forest-500/5" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-12 rounded-sm border border-forest-500/10 bg-cream-50 px-6 py-16 text-center">
        <Heart className="mx-auto h-8 w-8 text-forest-500/25" strokeWidth={1.5} />
        <p className="mt-4 text-lg text-forest-900">
          {isShared ? t.sharedEmpty : t.emptyTitle}
        </p>
        {!isShared ? (
          <p className="mx-auto mt-2 max-w-md text-sm text-forest-500/70">{t.emptyBody}</p>
        ) : null}
        <Link
          href={localeHref(locale, "/listings") as Route}
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-panel px-6 py-3 text-sm font-medium text-panel-fg transition-colors hover:bg-forest-400"
        >
          {t.browse}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-12">
      {isShared ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-brass-500/30 bg-brass-500/5 px-4 py-3">
          <p className="text-sm text-forest-900">{t.sharedBanner(items.length)}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onImport}
              disabled={imported}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brass-600 underline-offset-4 hover:underline disabled:no-underline disabled:opacity-70"
            >
              {imported ? <Check className="h-4 w-4" /> : <Import className="h-4 w-4" />}
              {imported ? t.sharedSaved : t.sharedSave}
            </button>
            <button
              type="button"
              onClick={() => router.replace(pathname as Route)}
              className="text-sm text-forest-500/70 underline-offset-4 hover:text-forest-500 hover:underline"
            >
              {t.sharedMine}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-forest-500/70">{t.savedCount(items.length)}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-500 underline-offset-4 hover:text-brass-500 hover:underline"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? t.shareCopied : t.share}
            </button>
            <button
              type="button"
              onClick={clear}
              className="text-sm text-forest-500/70 underline-offset-4 hover:text-forest-500 hover:underline"
            >
              {t.clearAll}
            </button>
          </div>
        </div>
      )}

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
