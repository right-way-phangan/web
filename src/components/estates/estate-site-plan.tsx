"use client";

import { useEffect, useRef, useState } from "react";
import type { LandEstate, PlotStatus } from "@/content/land-estates";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getEstatesDict } from "@/lib/i18n/dictionaries";

interface Props {
  estate: LandEstate;
  locale: Locale;
  hovered: string | null;
  /** Выбранный лот (открыт драуэр) — подсвечивается, остальные приглушаются. */
  selected?: string | null;
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
 * настоящий мастер-план: мягкая текстура полога (feTurbulence) подложкой-склоном,
 * тонкие тёплые контуры лотов, аккуратные лейбл-чипы, дороги-коридоры, стрелка
 * севера, солнце на закатной/морской стороне и картуш с названием. Цвета — через
 * <defs>-градиенты (Tailwind fill-opacity для SVG ненадёжен). Наведение/выбор
 * синхронизированы с таблицей/драуэром: выбранный лот подсвечивается брасс-
 * свечением, остальные деликатно приглушаются (спот-эффект). Браузерный фокус-
 * ринг подавлен — рисуем собственную индикацию. Геометрия — схема (не кадастр).
 */
export function EstateSitePlan({ estate, locale, hovered, selected, onHover, onSelect }: Props) {
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

  if (!plan || lots.length === 0) return null;

  const [, , vbW, vbH] = plan.viewBox.split(/\s+/).map(Number);
  const seaSide = plan.seaSide ?? "left";
  const title = estate.name[locale].split("—")[0].trim();
  const anySel = Boolean(selected);
  const statusesPresent = (["available", "reserved", "sold", "rented"] as PlotStatus[]).filter(
    (s) => estate.plots.some((p) => p.status === s),
  );
  const legendFill: Record<PlotStatus, string> = {
    available: "rgba(199,121,41,0.42)",
    reserved: "rgba(199,121,41,0.18)",
    sold: "rgba(31,58,46,0.32)",
    rented: "rgba(31,58,46,0.44)",
  };

  // Стиль группы лота: проявление каскадом + приглушение невыбранных (спот).
  const groupStyle = (i: number, dimmed: boolean): React.CSSProperties => {
    if (phase === "hidden") return { opacity: 0, outline: "none" };
    const op = dimmed ? 0.4 : 1;
    if (phase === "ready") return { opacity: op, outline: "none" };
    return { opacity: op, transition: `opacity 0.45s ease ${Math.min(i, 9) * 0.04}s`, outline: "none" };
  };

  return (
    <figure ref={figRef} className="overflow-hidden rounded-sm border border-forest-500/15 bg-cream-50 shadow-md">
      <svg viewBox={plan.viewBox} className="block w-full select-none" role="img" aria-label={t.sections.plan}>
        <defs>
          <radialGradient id="esp-bg" cx="33%" cy="20%" r="105%">
            <stop offset="0%" stopColor="#F6EFDF" />
            <stop offset="58%" stopColor="#E9DEC9" />
            <stop offset="100%" stopColor="#D7CBB0" />
          </radialGradient>
          {/* Мягкая процедурная текстура полога/склона — «аэро» без растра. */}
          <filter id="esp-canopy" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.021 0.036" numOctaves="4" seed="11" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.23  0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0.16 0" />
            <feGaussianBlur stdDeviation="0.45" />
          </filter>
          <linearGradient id="esp-avail" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="#E9B981" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#BB6C22" stopOpacity="0.24" />
          </linearGradient>
          <linearGradient id="esp-availH" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="#F1B468" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#BB6C22" stopOpacity="0.56" />
          </linearGradient>
          <linearGradient id="esp-reserved" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="#C77929" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#C77929" stopOpacity="0.13" />
          </linearGradient>
          <linearGradient id="esp-sold" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="#33543F" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#1F3A2E" stopOpacity="0.2" />
          </linearGradient>
          {/* Тончайшая тень лотов */}
          <filter id="esp-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0.3" stdDeviation="0.38" floodColor="#16271E" floodOpacity="0.18" />
          </filter>
          {/* Свечение выбранного лота (брасс) */}
          <filter id="esp-sel" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.15" floodColor="#C77929" floodOpacity="0.6" />
          </filter>
          <filter id="esp-csh" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.22" stdDeviation="0.35" floodColor="#16271E" floodOpacity="0.2" />
          </filter>
          <radialGradient id="esp-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6CE84" />
            <stop offset="55%" stopColor="#E0922F" />
            <stop offset="100%" stopColor="#E0922F" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Подложка-склон: градиент + мягкая текстура полога + горизонтали рельефа */}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#esp-bg)" />
        <rect x="0" y="0" width="100%" height="100%" fill="#3a5a40" filter="url(#esp-canopy)" />
        {CONTOURS.map((d, i) => (
          <path key={`c${i}`} d={d} fill="none" stroke="#1F3A2E" strokeOpacity={0.06} strokeWidth={0.4} />
        ))}

        {/* Дороги — тонким коридором (мягкая обочина + светлая сплошная середина) */}
        {plan.roads?.map((d, i) => (
          <path key={`rc${i}`} d={d} fill="none" stroke="#C7BB9C" strokeOpacity={0.62} strokeWidth={3.1} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {plan.roads?.map((d, i) => (
          <path key={`rm${i}`} d={d} fill="none" stroke="#F2ECDB" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Лоты */}
        {lots.map((p, idx) => {
          const pts = p.plotShape!;
          const [cx, cy] = centroid(pts);
          const isHover = hovered === p.code;
          const isSel = selected === p.code;
          const isActive = isHover || isSel;
          const dimmed = anySel && !isSel;
          const pointsAttr = pts.map((pt) => pt.join(",")).join(" ");
          const fill =
            p.status === "available"
              ? isActive ? "url(#esp-availH)" : "url(#esp-avail)"
              : p.status === "reserved" ? "url(#esp-reserved)" : "url(#esp-sold)";
          const stroke = isSel ? "#C77929" : isHover ? "#FFFFFF" : "#FBF7EE";
          const strokeWidth = isSel ? 0.6 : isHover ? 0.46 : 0.26;
          const showChip = p.status === "available" || p.status === "reserved";
          const chipW = 11.8;
          const chipH = p.areaSqm ? 7.4 : 4.8;
          return (
            <g
              key={p.code}
              className="cursor-pointer [outline:none] focus:outline-none focus-visible:outline-none"
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
              style={groupStyle(idx, dimmed)}
            >
              <polygon
                points={pointsAttr}
                filter={isSel ? "url(#esp-sel)" : "url(#esp-sh)"}
                style={{
                  fill,
                  stroke,
                  strokeWidth,
                  strokeOpacity: p.status === "sold" ? 0.45 : isActive ? 1 : 0.8,
                  strokeLinejoin: "round",
                  ...(p.status === "reserved" ? { strokeDasharray: "1.4 1.1" } : {}),
                  transition: "fill 160ms, stroke 160ms, stroke-width 160ms, stroke-opacity 160ms",
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
                      rx={1.4}
                      style={{
                        fill: isSel ? "#FBEFD9" : isHover ? "#FFFDF8" : "#FCF9F2",
                        fillOpacity: 0.97,
                        stroke: isSel ? "#C77929" : "#1F3A2E",
                        strokeOpacity: isSel ? 0.5 : 0.14,
                        strokeWidth: 0.16,
                        transition: "fill 160ms, stroke 160ms",
                      }}
                    />
                  </g>
                  <text x={cx} y={p.areaSqm ? cy - 0.4 : cy + 1.1} textAnchor="middle" style={{ fill: isSel ? "#8A5418" : "#1F3A2E", fontSize: 3.3, fontWeight: 600, letterSpacing: 0.2 }}>
                    {p.code}
                  </text>
                  {p.areaSqm ? (
                    <text x={cx} y={cy + 2.9} textAnchor="middle" style={{ fill: "#9B7A47", fontSize: 1.95, fontWeight: 400, letterSpacing: 0.1 }}>
                      {p.areaSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²
                    </text>
                  ) : null}
                </>
              ) : (
                <>
                  <text x={cx} y={cy - 0.4} textAnchor="middle" style={{ fill: "#EDF2ED", fontSize: 3.3, fontWeight: 600, opacity: 0.82 }}>
                    {p.code}
                  </text>
                  <text x={cx} y={cy + 2.7} textAnchor="middle" style={{ fill: "#EDF2ED", fontSize: 1.85, letterSpacing: 0.7, opacity: 0.6 }}>
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
          <polygon points="0,-5 -1.9,1.6 0,0.3 1.9,1.6" fill="#1F3A2E" fillOpacity={0.8} />
          <text x={0} y={5.8} textAnchor="middle" style={{ fill: "#1F3A2E", fillOpacity: 0.8, fontSize: 2.8, fontWeight: 600 }}>
            N
          </text>
        </g>

        {/* Картуш с названием (левый низ) */}
        <g aria-hidden>
          <g filter="url(#esp-csh)">
            <rect x={5} y={vbH - 12} width={52} height={8.2} rx={1.4} fill="#1F3A2E" opacity={0.9} />
          </g>
          <text x={8} y={vbH - 7.8} className="font-serif" style={{ fill: "#F4C879", fontSize: 3, letterSpacing: 0.4 }}>
            {title}
          </text>
          <text x={8} y={vbH - 4.8} style={{ fill: "#E8E0CF", fontSize: 1.85, opacity: 0.76 }}>
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
    const rad = (a * Math.PI) / 180, r0 = 3.6, r1 = 5;
    rays.push(
      <line
        key={a}
        x1={pos.x + r0 * Math.cos(rad)}
        y1={pos.y + r0 * Math.sin(rad)}
        x2={pos.x + r1 * Math.cos(rad)}
        y2={pos.y + r1 * Math.sin(rad)}
        stroke="#E0922F"
        strokeWidth={0.5}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <g aria-hidden>
      <circle cx={pos.x} cy={pos.y} r={9} fill="url(#esp-sun)" />
      <circle cx={pos.x} cy={pos.y} r={2.4} fill="#E0922F" />
      {rays}
      <text x={pos.lx} y={pos.ly} textAnchor={pos.anchor} style={{ fill: "#7A4E18", fontSize: 2.8, fontWeight: 600, letterSpacing: 0.2 }}>
        {label}
      </text>
    </g>
  );
}
