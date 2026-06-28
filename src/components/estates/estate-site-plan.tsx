"use client";

import { cn } from "@/lib/utils/cn";
import type { LandEstate, PlotStatus } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";

interface Props {
  estate: LandEstate;
  locale: Locale;
  hovered: string | null;
  onHover: (code: string | null) => void;
  onSelect: (code: string) => void;
}

/** Заливка/обводка/текст контура по статусу (палитра бренда, без сырых hex). */
const FILL: Record<PlotStatus, { poly: string; text: string }> = {
  available: { poly: "fill-brass-500/25 stroke-brass-500", text: "fill-forest-900" },
  reserved: { poly: "fill-brass-500/10 stroke-brass-500 [stroke-dasharray:2_1.5]", text: "fill-brass-700" },
  sold: { poly: "fill-forest-500/12 stroke-forest-500/30", text: "fill-forest-500/55" },
  rented: { poly: "fill-forest-700/18 stroke-forest-700/35", text: "fill-forest-700/70" },
};

function centroid(pts: [number, number][]): [number, number] {
  const n = pts.length;
  const s = pts.reduce<[number, number]>((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]);
  return [s[0] / n, s[1] / n];
}

/** Ширина карточки-подписи (в координатах viewBox) под код + площадь.
 *  Сужена так, чтобы соседние карточки даже узких лотов (M7↔M8) не накладывались. */
function pillWidth(code: string, area: string | null): number {
  const codeW = code.length * 2.4;
  const areaW = area ? area.length * 1.3 : 0;
  return Math.max(codeW, areaW) + 3.8;
}

/**
 * Интерактивная схема разбивки участка «в стиле RW»: контуры лотов из plotShape,
 * цвет по статусу, дороги, стрелка на закатную/морскую сторону. Наведение/клик
 * синхронизированы с таблицей через hovered/onHover/onSelect. Чистый SVG (SSR-safe,
 * без тайлов и ключей); перекрашивается сам при смене статуса лота в данных.
 *
 * NB: координаты — стилизованная схема (не кадастр), под layout собственника.
 */
export function EstateSitePlan({ estate, locale, hovered, onHover, onSelect }: Props) {
  const t = getEstatesDict(locale);
  const plan = estate.plan;
  const lots = estate.plots.filter((p) => p.plotShape && p.plotShape.length >= 3);
  if (!plan || lots.length === 0) return null;

  const seaSide = plan.seaSide ?? "left";
  const statusesPresent = (["available", "reserved", "sold", "rented"] as PlotStatus[]).filter(
    (s) => estate.plots.some((p) => p.status === s),
  );

  const fmtArea = (n: number) => `${n.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²`;

  return (
    <figure className="mx-auto w-full max-w-[440px] overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50">
      <svg
        viewBox={plan.viewBox}
        className="block w-full select-none"
        role="img"
        aria-label={t.sections.plan}
      >
        <defs>
          {/* Мягкая тень карточек-подписей (бренд-ink forest-900) */}
          <filter id="rw-pill-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" floodColor="#04262E" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Слой 1 — контуры участков (интерактив: наведение/клик) */}
        {lots.map((p) => {
          const pts = p.plotShape!;
          const isHover = hovered === p.code;
          const st = FILL[p.status];
          return (
            <g
              key={p.code}
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => onHover(p.code)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(p.code)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(p.code);
                }
              }}
              onFocus={() => onHover(p.code)}
              onBlur={() => onHover(null)}
              tabIndex={0}
              role="button"
              aria-label={`${p.code} — ${t.status[p.status]}`}
            >
              <polygon
                points={pts.map((pt) => pt.join(",")).join(" ")}
                className={cn(st.poly, "transition-all")}
                strokeWidth={isHover ? 1.6 : 0.7}
                style={isHover ? { filter: "brightness(1.06)" } : undefined}
              />
            </g>
          );
        })}

        {/* Слой 2 — дороги поверх границ (казинг-бордюр + светлый просвет) */}
        {plan.roads?.map((d, i) => (
          <path
            key={`rc-${i}`}
            d={d}
            className="fill-none stroke-forest-500/30"
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {plan.roads?.map((d, i) => (
          <path
            key={`rs-${i}`}
            d={d}
            className="fill-none stroke-cream-50"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Слой 3 — подписи (карточки/текст), клики не перехватывают */}
        <g className="pointer-events-none">
          {lots.map((p) => {
            const pts = p.plotShape!;
            const [cx, cy] = centroid(pts);
            const isHover = hovered === p.code;
            const st = FILL[p.status];
            const isCard = p.status === "available" || p.status === "reserved";
            const area = p.areaSqm ? fmtArea(p.areaSqm) : null;
            const w = pillWidth(p.code, area);
            const codeColor = p.status === "reserved" ? "fill-brass-700" : "fill-forest-900";
            return isCard ? (
              <g key={p.code}>
                <rect
                  x={cx - w / 2}
                  y={area ? cy - 6 : cy - 4}
                  width={w}
                  height={area ? 12 : 8}
                  rx={2.2}
                  ry={2.2}
                  className={cn(
                    "fill-cream-50 transition-all",
                    isHover ? "stroke-brass-500" : "stroke-forest-500/10",
                  )}
                  strokeWidth={isHover ? 0.7 : 0.4}
                  style={{ filter: "url(#rw-pill-shadow)" }}
                />
                <text
                  x={cx}
                  y={area ? cy - 0.6 : cy + 1.4}
                  textAnchor="middle"
                  className={cn("font-sans font-semibold", codeColor)}
                  style={{ fontSize: 4 }}
                >
                  {p.code}
                </text>
                {area ? (
                  <text
                    x={cx}
                    y={cy + 3.6}
                    textAnchor="middle"
                    className="fill-brass-600 font-sans font-medium"
                    style={{ fontSize: 2.5 }}
                  >
                    {area}
                  </text>
                ) : null}
              </g>
            ) : (
              <g key={p.code}>
                <text
                  x={cx}
                  y={cy - 0.2}
                  textAnchor="middle"
                  className={cn("font-sans font-semibold", st.text)}
                  style={{ fontSize: 3.6 }}
                >
                  {p.code}
                </text>
                <text
                  x={cx}
                  y={cy + 3.4}
                  textAnchor="middle"
                  className={cn("font-sans", st.text)}
                  style={{ fontSize: 2.3, letterSpacing: 0.3 }}
                >
                  {t.status[p.status].toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>

        {/* Стрелка-ориентир на море/закат */}
        <SeaArrow side={seaSide} viewBox={plan.viewBox} label={`☀ ${locale === "ru" ? "море · закат" : "sea · sunset"}`} />
      </svg>

      {/* Легенда */}
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-forest-500/10 px-4 py-2.5 text-[11px] text-forest-500/70">
        {statusesPresent.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={cn("inline-block h-2.5 w-2.5 rounded-[2px] ring-1", swatch(s))} aria-hidden />
            {t.status[s]}
          </span>
        ))}
        <span className="ml-auto italic text-forest-500/45">{t.planLede.split(".")[0]}</span>
      </figcaption>
    </figure>
  );
}

function swatch(s: PlotStatus): string {
  switch (s) {
    case "available":
      return "bg-brass-500/30 ring-brass-500/50";
    case "reserved":
      return "bg-brass-500/10 ring-brass-500/60";
    case "sold":
      return "bg-forest-500/15 ring-forest-500/30";
    case "rented":
      return "bg-forest-700/20 ring-forest-700/40";
  }
}

function SeaArrow({ side, viewBox, label }: { side: string; viewBox: string; label: string }) {
  const [, , w, h] = viewBox.split(/\s+/).map(Number);
  // Размещаем у соответствующего края, стрелка указывает наружу.
  const pos =
    side === "left"
      ? { x: 6, y: h * 0.5, rot: 180 }
      : side === "right"
        ? { x: w - 6, y: h * 0.5, rot: 0 }
        : side === "top"
          ? { x: w * 0.5, y: 6, rot: -90 }
          : { x: w * 0.5, y: h - 6, rot: 90 };
  return (
    <g className="fill-brass-500/70" transform={`translate(${pos.x},${pos.y})`}>
      <g transform={`rotate(${pos.rot})`}>
        <path d="M0,-2 L4,-2 L4,-4 L8,0 L4,4 L4,2 L0,2 Z" />
      </g>
      <text
        x={0}
        y={side === "top" ? 10 : side === "bottom" ? -6 : -4}
        textAnchor="middle"
        className="fill-brass-600"
        style={{ fontSize: 2.8 }}
      >
        {label}
      </text>
    </g>
  );
}
