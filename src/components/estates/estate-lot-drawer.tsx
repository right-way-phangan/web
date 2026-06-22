"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { X, ArrowRight, TrendingUp, Hammer, MapPin, ExternalLink, Scale, ChevronLeft, ChevronRight, Share2, Check, Images, ShieldCheck, Zap, Route as RouteIcon, FileCheck, Clock, MessageCircle, Send } from "lucide-react";
import type { LandEstate, EstatePlot } from "@/content/land-estates";
import { plotPriceVisible, buildPotential } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/locale-path";
import { whatsappLink, telegramDmLink } from "@/lib/site-config";
import { cn } from "@/lib/utils/cn";
import { EstateLotCarousel } from "./estate-lot-carousel";
import { PlotStatusBadge } from "./plot-status-badge";
import { PhotoLightbox } from "@/components/media/photo-lightbox";
import { useEstateCurrency } from "./estate-currency";
import { track } from "@/lib/analytics/track";

interface Props {
  estate: LandEstate;
  plot: EstatePlot | null;
  locale: Locale;
  estateName: string;
  /** Порядок кодов лотов для перелистывания ‹/› и свайпа между лотами. */
  codes: string[];
  /** Открыть другой лот (перелистывание внутри драуэра). */
  onNavigate: (code: string) => void;
  onClose: () => void;
  onEnquire: (code: string) => void;
  onToggleCompare: (code: string) => void;
  inCompare: boolean;
}

/**
 * Боковой драуэр одного лота: карусель фото, параметры, потенциал застройки,
 * ссылка в ROI-калькулятор (с предзаполненной ценой), кнопки «Запросить» и
 * «В сравнение», ссылка на полную карточку каталога. Открывается кликом по лоту
 * на схеме/в таблице. Esc/клик по фону — закрыть; блокирует прокрутку body.
 */
export function EstateLotDrawer({
  estate,
  plot,
  locale,
  estateName,
  codes,
  onNavigate,
  onClose,
  onEnquire,
  onToggleCompare,
  inCompare,
}: Props) {
  const [lb, setLb] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const { fmt } = useEstateCurrency();

  // Аналитика: открытие панели лота (тепловая карта интереса по лотам).
  useEffect(() => {
    if (plot) track("estate_lot_open", { estate: estate.slug, lot: plot.code });
  }, [plot, estate.slug]);

  useEffect(() => {
    if (!plot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lb === null) onClose(); // лайтбокс Esc закрывает сам (Radix)
        return;
      }
      if (lb !== null) return; // при открытом лайтбоксе ←/→ листают фото
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && codes.length > 1) {
        const ix = codes.indexOf(plot.code);
        if (ix < 0) return;
        const d = e.key === "ArrowLeft" ? -1 : 1;
        onNavigate(codes[(ix + d + codes.length) % codes.length]);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [plot, onClose, lb, codes, onNavigate]);

  // Смена лота — сбросить открытый лайтбокс.
  useEffect(() => setLb(null), [plot?.code]);

  if (!plot) return null;
  const t = getEstatesDict(locale);
  const priceVisible = plotPriceVisible(plot.status);
  const bp = buildPotential(plot);
  const pricePerSqm =
    priceVisible && plot.priceThb && plot.areaSqm ? Math.round(plot.priceThb / plot.areaSqm) : null;

  const area = plot.areaRai
    ? `${plot.areaRai} ${locale === "ru" ? "рай" : "rai"}`
    : plot.areaSqm
      ? `${plot.areaSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²`
      : "—";

  const roiHref =
    priceVisible && plot.priceThb
      ? (`${localePath(locale, "/calculator")}?price=${plot.priceThb}&tenure=${plot.tenure === "Leasehold" ? "leasehold" : "freehold"}` as Route)
      : null;

  // ‹/› — перелистывание лотов внутри драуэра (циклично).
  const ix = codes.indexOf(plot.code);
  const canNav = codes.length > 1 && ix >= 0;
  const navTo = (d: number) => {
    if (canNav) onNavigate(codes[(ix + d + codes.length) % codes.length]);
  };

  // Свайп по телу драуэра (вне карусели) листает лоты на тач-устройстве.
  const onAsideDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-noswipe]")) {
      swipe.current = null;
      return;
    }
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onAsideUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || e.pointerType !== "touch" || !canNav) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.4) navTo(dx > 0 ? -1 : 1);
  };

  const ru = locale === "ru";
  // Каноническая страница лота /estates/<slug>/<code> (свой OG/мета).
  const origin = typeof window !== "undefined" ? window.location.origin : "https://rightwaygroup.co";
  const lotUrl = `${origin}${localePath(locale, `/estates/${estate.slug}/${plot.code}`)}`;
  const waText = ru
    ? `Здравствуйте! Интересует участок ${plot.code} — ${estateName}. ${lotUrl}`
    : `Hi! I'm interested in plot ${plot.code} — ${estateName}. ${lotUrl}`;

  // Поделиться лотом: Web Share API → fallback в буфер обмена.
  const onShare = async () => {
    track("estate_lot_share", { estate: estate.slug, lot: plot.code });
    const url = lotUrl;
    const title = `${estateName} — ${plot.code}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
      } catch {
        /* пользователь отменил */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* буфер недоступен */
    }
  };

  // Быстрый переход к фото-секции лота на странице (якоря lot-<code>).
  const hasGallery = Boolean(plot.photos && plot.photos.length > 0);
  const toPhotos = () => {
    const id = `lot-${plot.code}`;
    onClose();
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  return (
    <div className="fixed inset-0 z-[90] flex justify-end print:hidden" role="dialog" aria-modal="true" aria-label={plot.code}>
      <div className="absolute inset-0 bg-forest-900/50" style={{ animation: "lbFade 0.2s ease" }} onClick={onClose} />
      <aside
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-cream-50 shadow-2xl"
        style={{ animation: "drawerIn 0.32s cubic-bezier(0.22,1,0.36,1)" }}
        onPointerDown={onAsideDown}
        onPointerUp={onAsideUp}
        onPointerCancel={() => (swipe.current = null)}
      >
        {/* Шапка */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-forest-500/10 bg-cream-50/95 px-4 py-3.5 backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="font-serif text-2xl text-forest-900">{plot.code}</span>
            <PlotStatusBadge status={plot.status} locale={locale} />
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={onShare}
              aria-label={locale === "ru" ? "Поделиться" : "Share"}
              className="rounded-full p-1.5 text-forest-500/70 transition-colors hover:bg-forest-500/10 hover:text-forest-900"
            >
              {copied ? <Check className="h-5 w-5 text-brass-600" /> : <Share2 className="h-5 w-5" />}
            </button>
            {canNav ? (
              <>
                <button
                  type="button"
                  onClick={() => navTo(-1)}
                  aria-label={locale === "ru" ? "Предыдущий лот" : "Previous lot"}
                  className="rounded-full p-1.5 text-forest-500/70 transition-colors hover:bg-forest-500/10 hover:text-forest-900"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => navTo(1)}
                  aria-label={locale === "ru" ? "Следующий лот" : "Next lot"}
                  className="rounded-full p-1.5 text-forest-500/70 transition-colors hover:bg-forest-500/10 hover:text-forest-900"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label={locale === "ru" ? "Закрыть" : "Close"}
              className="rounded-full p-1.5 text-forest-500/70 transition-colors hover:bg-forest-500/10 hover:text-forest-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-5">
          {hasGallery ? (
            <div className="space-y-2" data-noswipe>
              <EstateLotCarousel
                photos={plot.photos!}
                altPrefix={`${estateName} — ${plot.code}`}
                onOpen={(i) => {
                  track("estate_lot_photos", { estate: estate.slug, lot: plot.code });
                  setLb(i);
                }}
                sizes="(min-width: 768px) 28rem, 100vw"
                info={{
                  seaView: plot.seaView,
                  viewLabel: plot.seaView ? t.view.sea : t.view.mountain,
                  priceLabel: priceVisible && plot.priceThb ? fmt(plot.priceThb) : null,
                }}
                hint
                hintLabel={locale === "ru" ? "Листайте" : "Swipe"}
              />
              <button
                type="button"
                onClick={toPhotos}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-forest-500/70 transition-colors hover:text-brass-600"
              >
                <Images className="h-3.5 w-3.5" />
                {locale === "ru" ? "Все фото участка в галерее" : "All plot photos in gallery"}
              </button>
            </div>
          ) : null}

          {/* Параметры */}
          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.drawer.facts}</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Fact label={t.table.area} value={area} />
              <Fact label={t.table.tenure} value={t.tenure[plot.tenure]} />
              <Fact
                label={t.table.price}
                value={
                  priceVisible && plot.priceThb
                    ? fmt(plot.priceThb)
                    : priceVisible
                      ? t.priceOnRequest
                      : "—"
                }
                accent={priceVisible && !!plot.priceThb}
              />
              <Fact label={t.drawer.view} value={plot.seaView ? `🌊 ${t.view.sea}` : `⛰ ${t.view.mountain}`} />
              {pricePerSqm ? <Fact label={t.compare.pricePerSqm} value={`฿${pricePerSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")}`} /> : null}
            </dl>
          </div>

          {/* Готовность / доверие */}
          {priceVisible ? (
            <div className="flex flex-wrap gap-1.5">
              <TrustBadge icon={ShieldCheck} label={ru ? "Проверен · DD" : "Vetted · DD"} />
              {estate.utilities?.road ? <TrustBadge icon={RouteIcon} label={ru ? "Дорога" : "Road"} /> : null}
              {estate.utilities?.power ? <TrustBadge icon={Zap} label={ru ? "Электричество" : "Power"} /> : null}
              <TrustBadge
                icon={plot.chanote === "inProgress" ? Clock : FileCheck}
                ok={plot.chanote !== "inProgress"}
                label={
                  plot.chanote === "inProgress"
                    ? ru
                      ? "Чанот в процессе"
                      : "Title in progress"
                    : ru
                      ? "Чанот готов"
                      : "Title ready"
                }
              />
            </div>
          ) : null}

          {/* Потенциал застройки */}
          {bp ? (
            <div className="rounded-sm border border-forest-500/12 bg-forest-500/[0.03] p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
                <Hammer className="h-3.5 w-3.5" /> {t.drawer.buildTitle}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="num text-2xl text-forest-900">~{bp.coverageSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²</div>
                  <div className="mt-0.5 text-[11px] text-forest-500/60">{t.drawer.coverage}</div>
                </div>
                <div>
                  <div className="num text-2xl text-forest-900">~{bp.villas}</div>
                  <div className="mt-0.5 text-[11px] text-forest-500/60">{t.drawer.villas}</div>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-forest-500/50">{t.drawer.buildNote}</p>
            </div>
          ) : null}

          {/* Заметка */}
          {plot.note ? (
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-brass-500">{t.drawer.note}</h3>
              <p className="text-sm leading-relaxed text-forest-500/80">{plot.note[locale]}</p>
            </div>
          ) : null}

          {/* ROI */}
          {roiHref ? (
            <Link
              href={roiHref}
              className="flex items-center justify-between gap-2 rounded-sm border border-brass-500/30 bg-brass-500/5 px-4 py-3 text-sm font-medium text-brass-700 transition-colors hover:bg-brass-500/10"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> {t.drawer.roiCta}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        {/* Действия (липкий низ) */}
        <div className="sticky bottom-0 mt-auto space-y-2 border-t border-forest-500/10 bg-cream-50/95 p-5 backdrop-blur">
          {plot.status === "available" ? (
            <button
              type="button"
              onClick={() => {
                track("estate_lot_enquire", { estate: estate.slug, lot: plot.code });
                onEnquire(plot.code);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-brass-500 px-4 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-brass-600"
            >
              {t.enquireLot(plot.code)}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
          {priceVisible ? (
            <div className="flex gap-2">
              {/* data-rw lets the global ContactClickTracker attribute this
                  messenger click to the lot's catalog object (own-DB funnel),
                  not the site bucket. Omitted for synthetic lots without an RW. */}
              <a
                href={whatsappLink(waText)}
                target="_blank"
                rel="noopener noreferrer"
                data-rw={plot.rwNumber}
                onClick={() => track("estate_lot_whatsapp", { estate: estate.slug, lot: plot.code })}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-forest-500/25 px-3 py-2.5 text-xs font-medium text-forest-500/80 transition-colors hover:border-forest-500/45 hover:text-forest-900"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <a
                href={telegramDmLink(`lot_${plot.code}`)}
                target="_blank"
                rel="noopener noreferrer"
                data-rw={plot.rwNumber}
                onClick={() => track("estate_lot_telegram", { estate: estate.slug, lot: plot.code })}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-forest-500/25 px-3 py-2.5 text-xs font-medium text-forest-500/80 transition-colors hover:border-forest-500/45 hover:text-forest-900"
              >
                <Send className="h-3.5 w-3.5" />
                Telegram
              </a>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onToggleCompare(plot.code)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm border px-3 py-2.5 text-xs font-medium transition-colors",
                inCompare
                  ? "border-forest-900 bg-forest-900 text-cream-50"
                  : "border-forest-500/25 text-forest-500/80 hover:border-forest-500/45",
              )}
            >
              <Scale className="h-3.5 w-3.5" />
              {inCompare ? t.drawer.inCompare : t.drawer.addCompare}
            </button>
            {plot.rwNumber && plot.status === "available" ? (
              <Link
                href={localePath(locale, `/object/${plot.rwNumber}`) as Route}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-forest-500/25 px-3 py-2.5 text-xs font-medium text-forest-500/80 transition-colors hover:border-forest-500/45"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t.drawer.fullPlot}
              </Link>
            ) : (
              <Link
                href={localePath(locale, `/listings?district=${encodeURIComponent(estate.district)}`) as Route}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-forest-500/25 px-3 py-2.5 text-xs font-medium text-forest-500/80 transition-colors hover:border-forest-500/45"
              >
                <MapPin className="h-3.5 w-3.5" />
                {t.seeDistrict}
              </Link>
            )}
          </div>
        </div>
      </aside>

      {plot.photos && plot.photos.length > 0 ? (
        <PhotoLightbox
          photos={plot.photos.map((src, i) => ({ src, alt: `${estateName} — ${plot.code} (${i + 1})`, caption: plot.code }))}
          index={lb}
          onIndexChange={setLb}
          onClose={() => setLb(null)}
          unoptimized
          title={plot.code}
          labels={{
            prev: locale === "ru" ? "Назад" : "Previous",
            next: locale === "ru" ? "Вперёд" : "Next",
            close: locale === "ru" ? "Закрыть" : "Close",
          }}
        />
      ) : null}
    </div>
  );
}

function TrustBadge({
  icon: Icon,
  label,
  ok = true,
}: {
  icon: typeof ShieldCheck;
  label: string;
  ok?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
        ok ? "bg-forest-500/8 text-forest-700" : "bg-brass-500/12 text-brass-700",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-forest-500/50">{label}</dt>
      <dd className={cn("mt-0.5", accent ? "num text-base text-forest-900" : "text-forest-900")}>{value}</dd>
    </div>
  );
}
