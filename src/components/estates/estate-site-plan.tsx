"use client";

import { useEffect, useRef, useState } from "react";
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

function centroid(pts: [number, number][]): [number, number] {
  const n = pts.length;
  const s = pts.reduce<[number, number]>((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]);
  return [s[0] / n, s[1] / n];
}

// Едва заметные «горизонтали» рельефа под лотами — даёт ощущение склона.
const CONTOURS = [
  "M2,46 C26,40 52,52 74,44 C86,40 96,46 99,44",
  "M2,66 C28,60 50,72 72,64 C86,59 96,66 99,64",
  "M3,90 C26,84 50,96 70,88 C84,83 96,90 99,88",
  "M6,112 C26,107 48,118 66,112 C80,108 92,114 98,113",
];

/**
 * Стилизованная «аэро»-схема разбивки участка «в стиле RW» — выглядит как
 * настоящий мастер-план: процедурная текстура полога (feTurbulence) как
 * подложка-склон, белые контуры лотов с мягкими тенями, лейбл-чипы у свободных,
 * дороги-коридоры, стрелка севера, солнце на закатной/морской стороне и картуш
 * с названием. Цвета — через <defs>-градиенты (Tailwind fill-opacity для SVG
 * ненадёжен). Наведение/клик синхронизированы с таблицей/драуэром; лоты
 * проявляются каскадом при выходе в кадр. Геометрия — схема (не кадастр).
 */
export function EstateSitePlan({ estate, locale, hovered, onHover, onSelect }: Props) {
  const t = getEstatesDict(locale);
  const plan = estate.plan;
  const lots = estate.plots.filter((p) => p.plotShape && p.plotShape.length >= 3);

  // Хуки — ДО любого раннего return (rules-of-hooks). Каскадное проявление лотов
  // при выходе схемы в кадр. SSR/no-JS: "ready" = всё видимо сразу.
  const figRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<"ready" | "hidden" | "shown">("ready");
  useEffect(() => {
    const el = figRef.current;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (!el || reduce || !("IntersectionObserver" in window)) {
      setPhase("shown");
      return;
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      setPhase("shown");
      return;
    }
    setPhase("hidden");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("shown");
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const reveal = (i: number): React.CSSProperties =>
    phase === "ready"
      ? {}
      : phase === "hidden"
        ? { opacity: 0 }
        : { opacity: 1, transition: `opacity 0.5s ease ${0.04 * i}s` };

  if (!plan || lots.length === 0) return null;

  const [, , vbW, vbH] = plan.viewBox.split(/\s+/).map(Number);
  const seaSide = plan.seaSide ?? "left";
  const title = estate.name[locale].split("—")[0].trim();
  const statusesPresent = (["available", "reserved", "sold", "rented"] as PlotStatus[]).filter(
    (s) => estate.plots.some((p) => p.status === s),
  );
  const legendFill: Record<PlotStatus, string> = {
    available: "rgba(199,121,41,0.4)",
    reserved: "rgba(199,121,41,0.18)",
    sold: "rgba(31,58,46,0.34)",
    rented: "rgba(31,58,46,0.45)",
  };

  return (
    <figure ref={figRef} className="overflow-hidden rounded-sm border border-forest-500/15 bg-cream-50 shadow-md">
      <svg viewBox={plan.viewBox} className="block w-full select-none" role="img" aria-label={t.sections.plan}>
        <defs>
          <radialGradient id="esp-bg" cx="34%" cy="22%" r="100%">
            <stop offset="0%" stopColor="#F4ECDB" />
            <stop offset="60%" stopColor="#E7DCC6" />
            <stop offset="100%" stopColor="#D9CDB2" />
          </radialGradient>
          {/* Процедурная текстура полога/склона — мягкое «аэро»-ощущение без растра. */}
          <filter id="esp-canopy" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.028 0.045" numOctaves="4" seed="11" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.21  0 0 0 0 0.34  0 0 0 0 0.20  0 0 0 0.3 0" />
            <feGaussianBlur stdDeviation="0.25" />
          </filter>
          <linearGradient id="esp-avail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E7B57F" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#B5651D" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="esp-availH" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EFAE63" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#B5651D" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="esp-reserved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C77929" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#C77929" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="esp-sold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#33543F" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#1F3A2E" stopOpacity="0.2" />
          </linearGradient>
          <filter id="esp-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0.35" stdDeviation="0.45" floodColor="#16271E" floodOpacity="0.22" />
          </filter>
          <filter id="esp-csh" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.25" stdDeviation="0.4" floodColor="#16271E" floodOpacity="0.22" />
          </filter>
          <radialGradient id="esp-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6CE84" />
            <stop offset="55%" stopColor="#E0922F" />
            <stop offset="100%" stopColor="#E0922F" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Подложка-склон: градиент + текстура полога + горизонтали рельефа */}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#esp-bg)" />
        <rect x="0" y="0" width="100%" height="100%" fill="#3a5a40" filter="url(#esp-canopy)" />
        {CONTOURS.map((d, i) => (
          <path key={`c${i}`} d={d} fill="none" stroke="#1F3A2E" strokeOpacity={0.07} strokeWidth={0.5} />
        ))}

        {/* Дороги — коридором (мягкая обочина + светлая сплошная середина) */}
        {plan.roads?.map((d, i) => (
          <path key={`rc${i}`} d={d} fill="none" stroke="#C9BD9F" strokeOpacity={0.85} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={reveal(0)} />
        ))}
        {plan.roads?.map((d, i) => (
          <path key={`rm${i}`} d={d} fill="none" stroke="#F1EAD8" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" style={reveal(0)} />
        ))}

        {/* Лоты */}
        {lots.map((p, idx) => {
          const pts = p.plotShape!;
          const [cx, cy] = centroid(pts);
          const isHover = hovered === p.code;
          const pointsAttr = pts.map((pt) => pt.join(",")).join(" ");
          const fill =
            p.status === "available"
              ? isHover ? "url(#esp-availH)" : "url(#esp-avail)"
              : p.status === "reserved" ? "url(#esp-reserved)" : "url(#esp-sold)";
          const showChip = p.status === "available" || p.status === "reserved";
          const chipW = 12.5;
          const chipH = p.areaSqm ? 8 : 5;
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
              style={reveal(idx)}
            >
              <polygon
                points={pointsAttr}
                filter="url(#esp-sh)"
                style={{
                  fill,
                  stroke: "#FBF7EE",
                  strokeWidth: isHover ? 0.85 : 0.42,
                  strokeOpacity: p.status === "sold" ? 0.5 : isHover ? 1 : 0.85,
                  strokeLinejoin: "round",
                  ...(p.status === "reserved" ? { strokeDasharray: "1.6 1.2" } : {}),
                  transition: "fill 140ms, stroke-width 140ms, stroke-opacity 140ms",
                }}
              />
              {showChip ? (
                <>
                  <g filter="url(#esp-csh)">
                    <rect
                      x={cx - chipW / 2}
                      y={cy - chipH / 2}
                      width={chipW}
                      height={chipH}
                      rx={1.2}
                      style={{
                        fill: isHover ? "#FFFDF8" : "#FCF9F2",
                        fillOpacity: 0.96,
                        stroke: "#B5651D",
                        strokeOpacity: isHover ? 0.55 : 0.28,
                        strokeWidth: 0.22,
                        transition: "fill 140ms",
                      }}
                    />
                  </g>
                  <text x={cx} y={p.areaSqm ? cy - 0.3 : cy + 1.2} textAnchor="middle" style={{ fill: "#1F3A2E", fontSize: 3.5, fontWeight: 600, letterSpacing: 0.2 }}>
                    {p.code}
                  </text>
                  {p.areaSqm ? (
                    <text x={cx} y={cy + 3.1} textAnchor="middle" style={{ fill: "#9B7A47", fontSize: 2, fontWeight: 400 }}>
                      {p.areaSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²
                    </text>
                  ) : null}
                </>
              ) : (
                <>
                  <text x={cx} y={cy - 0.4} textAnchor="middle" style={{ fill: "#EDF2ED", fontSize: 3.5, fontWeight: 600, opacity: 0.85 }}>
                    {p.code}
                  </text>
                  <text x={cx} y={cy + 2.8} textAnchor="middle" style={{ fill: "#EDF2ED", fontSize: 1.9, letterSpacing: 0.6, opacity: 0.62 }}>
                    {t.status[p.status].toUpperCase()}
                  </text>
                </>
              )}
            </g>
          );
        })}

        <Sun side={seaSide} vbW={vbW} vbH={vbH} label={locale === "ru" ? "закат · море" : "sunset · sea"} />

        {/* Стрелка севера (правый верх) */}
        <g aria-hidden transform={`translate(${vbW - 7.5}, 11)`}>
          <polygon points="0,-5.4 -2.1,1.8 0,0.2 2.1,1.8" fill="#1F3A2E" fillOpacity={0.82} />
          <text x={0} y={6.2} textAnchor="middle" style={{ fill: "#1F3A2E", fillOpacity: 0.82, fontSize: 3, fontWeight: 600 }}>
            N
          </text>
        </g>

        {/* Картуш с названием (левый низ) */}
        <g aria-hidden>
          <g filter="url(#esp-csh)">
            <rect x={5} y={vbH - 12.5} width={54} height={8.6} rx={1.2} fill="#1F3A2E" opacity={0.88} />
          </g>
          <text x={8} y={vbH - 8.1} className="font-serif" style={{ fill: "#F4C879", fontSize: 3, letterSpacing: 0.5 }}>
            {title}
          </text>
          <text x={8} y={vbH - 5} style={{ fill: "#E8E0CF", fontSize: 1.9, opacity: 0.78 }}>
            {locale === "ru" ? "ориентировочная разбивка · не в масштабе" : "indicative subdivision · not to scale"}
          </text>
        </g>
      </svg>

      {/* Легенда */}
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-forest-500/10 px-4 py-2.5 text-[11px] text-forest-500/70">
        {statusesPresent.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: legendFill[s], outline: "1px solid #FBF6EC", outlineOffset: "-1px" }}
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

/** Декоративное солнце-ориентир на закатной/морской стороне. */
function Sun({ side, vbW, vbH, label }: { side: string; vbW: number; vbH: number; label: string }) {
  const pos =
    side === "left"
      ? { x: 12, y: 19, lx: 21, ly: 20, anchor: "start" as const }
      : side === "right"
        ? { x: vbW - 12, y: 19, lx: vbW - 21, ly: 20, anchor: "end" as const }
        : side === "top"
          ? { x: vbW * 0.5, y: 12, lx: vbW * 0.5, ly: 26, anchor: "middle" as const }
          : { x: vbW * 0.5, y: vbH - 12, lx: vbW * 0.5, ly: vbH - 24, anchor: "middle" as const };
  const rays = [];
  for (let a = 0; a < 360; a += 45) {
    const rad = (a * Math.PI) / 180, r0 = 3.8, r1 = 5.3;
    rays.push(
      <line
        key={a}
        x1={pos.x + r0 * Math.cos(rad)}
        y1={pos.y + r0 * Math.sin(rad)}
        x2={pos.x + r1 * Math.cos(rad)}
        y2={pos.y + r1 * Math.sin(rad)}
        stroke="#E0922F"
        strokeWidth={0.6}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <g aria-hidden>
      <circle cx={pos.x} cy={pos.y} r={9.5} fill="url(#esp-sun)" />
      <circle cx={pos.x} cy={pos.y} r={2.6} fill="#E0922F" />
      {rays}
      <text x={pos.lx} y={pos.ly} textAnchor={pos.anchor} style={{ fill: "#7A4E18", fontSize: 2.9, fontWeight: 600, letterSpacing: 0.2 }}>
        {label}
      </text>
    </g>
  );
}
