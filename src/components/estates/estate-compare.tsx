"use client";

import { useState } from "react";
import { X, Scale } from "lucide-react";
import type { LandEstate } from "@/content/land-estates";
import { plotPriceVisible, buildPotential } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";
import { useEstateCurrency } from "./estate-currency";

interface Props {
  estate: LandEstate;
  /** Коды выбранных для сравнения лотов (до 3). */
  codes: string[];
  locale: Locale;
  onRemove: (code: string) => void;
  onClear: () => void;
  /** Скрыть трей, когда открыт драуэр. */
  hidden?: boolean;
}

/**
 * Сравнение участков: липкий трей снизу с выбранными лотами + модальная таблица
 * «бок о бок» (площадь, цена, цена/м², вид, статус, потенциал застройки). До 3
 * лотов. Управляется состоянием из EstateExplorer.
 */
export function EstateCompare({ estate, codes, locale, onRemove, onClear, hidden }: Props) {
  const t = getEstatesDict(locale);
  const { fmt } = useEstateCurrency();
  const [open, setOpen] = useState(false);
  if (codes.length === 0 || hidden) return null;

  const plots = codes
    .map((c) => estate.plots.find((p) => p.code === c))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const fmtArea = (sqm?: number) =>
    sqm ? `${sqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²` : "—";
  const fmtPrice = (code: string) => {
    const p = estate.plots.find((x) => x.code === code);
    if (!p || !plotPriceVisible(p.status)) return "—";
    return p.priceThb ? fmt(p.priceThb) : t.priceOnRequest;
  };
  const fmtPerSqm = (code: string) => {
    const p = estate.plots.find((x) => x.code === code);
    if (!p || !plotPriceVisible(p.status) || !p.priceThb || !p.areaSqm) return "—";
    return `฿${Math.round(p.priceThb / p.areaSqm).toLocaleString(locale === "ru" ? "ru-RU" : "en-US")}`;
  };

  const rows: { label: string; cell: (code: string) => string }[] = [
    { label: t.table.area, cell: (c) => fmtArea(estate.plots.find((p) => p.code === c)?.areaSqm) },
    { label: t.table.price, cell: fmtPrice },
    { label: t.compare.pricePerSqm, cell: fmtPerSqm },
    {
      label: t.drawer.view,
      cell: (c) => (estate.plots.find((p) => p.code === c)?.seaView ? `🌊 ${t.view.sea}` : `⛰ ${t.view.mountain}`),
    },
    { label: t.table.statusCol, cell: (c) => t.status[estate.plots.find((p) => p.code === c)!.status] },
    {
      label: t.drawer.coverage,
      cell: (c) => {
        const p = estate.plots.find((x) => x.code === c);
        const bp = p ? buildPotential(p) : null;
        return bp ? `~${bp.coverageSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²` : "—";
      },
    },
    {
      label: t.drawer.villas,
      cell: (c) => {
        const p = estate.plots.find((x) => x.code === c);
        const bp = p ? buildPotential(p) : null;
        return bp ? `~${bp.villas}` : "—";
      },
    },
  ];

  return (
    <>
      {/* Трей */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 print:hidden">
        <div className="flex max-w-full items-center gap-2 rounded-full border border-forest-500/15 bg-cream-50/95 px-2 py-2 shadow-xl backdrop-blur-md">
          <span className="hidden pl-2 text-xs font-medium text-forest-500/60 sm:inline">{t.compare.title}</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {plots.map((p) => (
              <span key={p.code} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-forest-500/8 py-1 pl-2.5 pr-1 text-xs font-medium text-forest-900">
                {p.code}
                <button type="button" onClick={() => onRemove(p.code)} aria-label={`remove ${p.code}`} className="rounded-full p-0.5 text-forest-500/50 hover:text-forest-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={codes.length < 2}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-forest-900 px-3.5 py-1.5 text-xs font-semibold text-cream-50 transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Scale className="h-3.5 w-3.5" />
            {t.compare.open}
          </button>
          <button type="button" onClick={onClear} aria-label={t.compare.clear} className="rounded-full p-1.5 text-forest-500/50 hover:text-forest-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Модалка сравнения */}
      {open ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 print:hidden" role="dialog" aria-modal="true" aria-label={t.compare.title}>
          <div className="absolute inset-0 bg-forest-900/55" style={{ animation: "lbFade 0.2s ease" }} onClick={() => setOpen(false)} />
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-auto rounded-sm bg-cream-50 p-5 shadow-2xl" style={{ animation: "lbZoom 0.26s cubic-bezier(0.22,1,0.36,1)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-2xl text-forest-900">{t.compare.title}</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-forest-500/70 hover:bg-forest-500/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-28" />
                  {plots.map((p) => (
                    <th key={p.code} className="border-b border-forest-500/15 px-2 py-2 text-center font-serif text-lg text-forest-900">
                      {p.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-forest-500/8">
                    <th className="px-1 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-forest-500/50">{r.label}</th>
                    {plots.map((p) => (
                      <td key={p.code} className="px-2 py-2.5 text-center text-forest-900">{r.cell(p.code)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}
