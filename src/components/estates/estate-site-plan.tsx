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

  return (
    <figure className="overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50">
      <svg
        viewBox={plan.viewBox}
        className="block w-full select-none"
        role="img"
        aria-label={t.sections.plan}
      >
        {/* Дороги */}
        {plan.roads?.map((d, i) => (
          <path
            key={i}
            d={d}
            className="fill-none stroke-forest-500/15"
            strokeWidth={3.2}
            strokeLinecap="round"
          />
        ))}

        {/* Лоты */}
        {lots.map((p) => {
          const pts = p.plotShape!;
          const [cx, cy] = centroid(pts);
          const isHover = hovered === p.code;
          const st = FILL[p.status];
          const reachable = true; // все кликабельны (скролл к строке/фото)
          return (
            <g
              key={p.code}
              className={cn("transition-opacity", reachable && "cursor-pointer")}
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
              <text
                x={cx}
                y={cy - 0.4}
                textAnchor="middle"
                className={cn("font-semibold", st.text)}
                style={{ fontSize: 4 }}
              >
                {p.code}
              </text>
              {p.status === "available" && p.areaSqm ? (
                <text
                  x={cx}
                  y={cy + 4.2}
                  textAnchor="middle"
                  className="fill-forest-500/60"
                  style={{ fontSize: 2.8 }}
                >
                  {p.areaSqm.toLocaleString()} m²
                </text>
              ) : p.status === "sold" || p.status === "rented" ? (
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  className={st.text}
                  style={{ fontSize: 2.6, letterSpacing: 0.3 }}
                >
                  {t.status[p.status].toUpperCase()}
                </text>
              ) : null}
            </g>
          );
        })}

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
