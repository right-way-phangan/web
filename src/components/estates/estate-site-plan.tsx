"use client";

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

/**
 * Брендовая палитра инлайном (Tailwind fill-цвет с opacity для SVG ненадёжен —
 * проданные уходили в чёрный). Значения из tailwind.config (forest/brass/cream).
 */
const C = {
  cream50: "#FEFCF9",
  cream300: "#E8E0CF",
  forest: "#1F3A2E",
  brass: "#B5651D",
  brass400: "#C77929",
};
type Style = { fill: string; stroke: string; sw: number; dash?: string; text: string };
const STYLE: Record<PlotStatus, Style> = {
  available: { fill: "rgba(199,121,41,0.18)", stroke: C.brass, sw: 0.7, text: C.forest },
  reserved: { fill: "rgba(199,121,41,0.07)", stroke: C.brass400, sw: 0.7, dash: "2 1.4", text: "#965318" },
  sold: { fill: "rgba(31,58,46,0.07)", stroke: "rgba(31,58,46,0.18)", sw: 0.6, text: "rgba(31,58,46,0.45)" },
  rented: { fill: "rgba(31,58,46,0.13)", stroke: "rgba(31,58,46,0.3)", sw: 0.6, text: "rgba(31,58,46,0.6)" },
};

function centroid(pts: [number, number][]): [number, number] {
  const n = pts.length;
  const s = pts.reduce<[number, number]>((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]);
  return [s[0] / n, s[1] / n];
}

/**
 * Интерактивная схема разбивки участка «в стиле RW»: контуры лотов из plotShape
 * примыкают друг к другу (тесселяция, общие границы), цвет — по статусу, дорога
 * проходит коридором между рядами, стрелка указывает на закатную/морскую сторону.
 * Наведение/клик синхронизированы с таблицей. Чистый SVG (SSR-safe), перекраска
 * по статусу — из данных. Геометрия — стилизованная схема (не кадастр).
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
        {/* Дороги (под лотами) */}
        {plan.roads?.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={C.cream300} strokeWidth={3.8} strokeLinecap="round" />
        ))}

        {/* Лоты */}
        {lots.map((p) => {
          const pts = p.plotShape!;
          const [cx, cy] = centroid(pts);
          const isHover = hovered === p.code;
          const st = STYLE[p.status];
          const pointsAttr = pts.map((pt) => pt.join(",")).join(" ");
          return (
            <g
              key={p.code}
              className="cursor-pointer"
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
                points={pointsAttr}
                style={{
                  fill: isHover && p.status === "available" ? "rgba(199,121,41,0.32)" : st.fill,
                  stroke: isHover ? C.brass : st.stroke,
                  strokeWidth: isHover ? 1.5 : st.sw,
                  strokeLinejoin: "round",
                  ...(st.dash ? { strokeDasharray: st.dash } : {}),
                  transition: "fill 120ms, stroke 120ms",
                }}
              />
              <text
                x={cx}
                y={p.status === "available" ? cy - 0.6 : cy - 1.2}
                textAnchor="middle"
                style={{ fill: st.text, fontSize: 4.3, fontWeight: 700 }}
              >
                {p.code}
              </text>
              {p.status === "available" && p.areaSqm ? (
                <text x={cx} y={cy + 4} textAnchor="middle" style={{ fill: "rgba(31,58,46,0.5)", fontSize: 2.7 }}>
                  {p.areaSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²
                </text>
              ) : p.status === "sold" || p.status === "rented" ? (
                <text x={cx} y={cy + 3.4} textAnchor="middle" style={{ fill: st.text, fontSize: 2.5, letterSpacing: 0.4 }}>
                  {t.status[p.status].toUpperCase()}
                </text>
              ) : null}
            </g>
          );
        })}

        <SeaArrow side={seaSide} viewBox={plan.viewBox} label={`☀ ${locale === "ru" ? "море · закат" : "sea · sunset"}`} />
      </svg>

      {/* Легенда */}
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-forest-500/10 px-4 py-2.5 text-[11px] text-forest-500/70">
        {statusesPresent.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: STYLE[s].fill, outline: `1px solid ${STYLE[s].stroke}` }}
              aria-hidden
            />
            {t.status[s]}
          </span>
        ))}
        <span className="ml-auto italic text-forest-500/45">{t.planLede.split(".")[0]}</span>
      </figcaption>
    </figure>
  );
}

function SeaArrow({ side, viewBox, label }: { side: string; viewBox: string; label: string }) {
  const [, , w, h] = viewBox.split(/\s+/).map(Number);
  const pos =
    side === "left"
      ? { x: 6, y: h * 0.36, rot: 180 }
      : side === "right"
        ? { x: w - 6, y: h * 0.5, rot: 0 }
        : side === "top"
          ? { x: w * 0.5, y: 6, rot: -90 }
          : { x: w * 0.5, y: h - 6, rot: 90 };
  return (
    <g transform={`translate(${pos.x},${pos.y})`}>
      <g transform={`rotate(${pos.rot})`} style={{ fill: "rgba(181,101,29,0.8)" }}>
        <path d="M0,-2 L4,-2 L4,-4 L8,0 L4,4 L4,2 L0,2 Z" />
      </g>
      <text
        x={0}
        y={side === "top" ? 10 : side === "bottom" ? -6 : -4}
        textAnchor="middle"
        style={{ fill: "#965318", fontSize: 2.9, fontWeight: 600 }}
      >
        {label}
      </text>
    </g>
  );
}
