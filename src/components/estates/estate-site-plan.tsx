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

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

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
 * севера и закатное солнце на морской стороне. Ориентация схемы сверена с
 * кадастровыми lat/lng лотов: север — вверх, запад (закат, море) — слева, поэтому
 * солнце стоит ровно на западной кромке, а не в углу.
 *
 * Цвета — через CSS-переменные `--esp-*` (класс `.site-plan` в globals.css):
 * светлая тема = пергаментный мастер-план, тёмная = ночная карта. Наведение/выбор
 * синхронизированы с панелью/таблицей/драуэром: выбранный лот подсвечивается,
 * остальные деликатно приглушаются (спот-эффект). Браузерный фокус-ринг подавлен —
 * рисуем собственную индикацию. Геометрия — схема (не кадастр).
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
    available: "var(--esp-avail-a)",
    reserved: "var(--esp-res-a)",
    sold: "var(--esp-sold-a)",
    rented: "var(--esp-sold-a)",
  };

  // Стиль группы лота: проявление каскадом + приглушение невыбранных (спот).
  const groupStyle = (i: number, dimmed: boolean): React.CSSProperties => {
    if (phase === "hidden") return { opacity: 0, outline: "none" };
    const op = dimmed ? 0.4 : 1;
    if (phase === "ready") return { opacity: op, outline: "none" };
    return { opacity: op, transition: `opacity 0.45s ease ${Math.min(i, 9) * 0.04}s`, outline: "none" };
  };

  return (
    <figure
      ref={figRef}
      // -mx-6 + w-calc — край-в-край на мобильном; на sm+ обычная ширина колонки.
      // Именно w-*, а не mx-auto: auto-поля у grid-элемента отключают растяжение,
      // и фигура схлопывается до ширины содержимого легенды.
      className="site-plan -mx-6 w-[calc(100%+3rem)] overflow-hidden border-y border-forest-500/15 bg-cream-50 shadow-md sm:mx-0 sm:w-full sm:rounded-sm sm:border"
      // Ограничение по высоте окна — чтобы вытянутая схема целиком помещалась в
      // экран и не приходилось скроллить её кусками. Ширина следует из пропорций;
      // нижний порог — чтобы в низком окне (ландшафт) схема не схлопнулась в полоску.
      style={{ maxWidth: `max(17rem, calc((100dvh - 15rem) * ${vbW} / ${vbH}))` }}
    >
      {/* Шапка-картуш: раньше был плашкой поверх нижних лотов и перекрывал их. */}
      <figcaption className="flex flex-wrap items-baseline gap-x-2 border-b border-forest-500/10 bg-forest-900/[0.04] px-4 py-2 dark:bg-cream-100/[0.04]">
        <span className="font-serif text-sm text-forest-900">{title}</span>
        <span className="text-[11px] text-forest-500/55">{t.planUi.caption}</span>
      </figcaption>

      <svg viewBox={plan.viewBox} className="block w-full select-none" role="img" aria-label={t.sections.plan}>
        <defs>
          <radialGradient id="esp-bg" cx="33%" cy="20%" r="105%">
            <stop offset="0%" stopColor="var(--esp-p1)" />
            <stop offset="58%" stopColor="var(--esp-p2)" />
            <stop offset="100%" stopColor="var(--esp-p3)" />
          </radialGradient>
          {/* Мягкая процедурная текстура полога/склона — «аэро» без растра.
              Цвет шума задаётся матрицей, поэтому у светлой и тёмной темы свой. */}
          <filter id="esp-canopy" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.021 0.036" numOctaves="4" seed="11" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.23  0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0.16 0" />
            <feGaussianBlur stdDeviation="0.45" />
          </filter>
          <filter id="esp-canopy-dark" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.021 0.036" numOctaves="4" seed="11" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.72  0 0 0 0 0.85  0 0 0 0 0.74  0 0 0 0.07 0" />
            <feGaussianBlur stdDeviation="0.45" />
          </filter>
          <linearGradient id="esp-avail" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="var(--esp-avail-a)" />
            <stop offset="100%" stopColor="var(--esp-avail-b)" />
          </linearGradient>
          <linearGradient id="esp-availH" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="var(--esp-availh-a)" />
            <stop offset="100%" stopColor="var(--esp-availh-b)" />
          </linearGradient>
          <linearGradient id="esp-reserved" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="var(--esp-res-a)" />
            <stop offset="100%" stopColor="var(--esp-res-b)" />
          </linearGradient>
          <linearGradient id="esp-sold" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="var(--esp-sold-a)" />
            <stop offset="100%" stopColor="var(--esp-sold-b)" />
          </linearGradient>
          {/* Закатный свет с морской стороны — тёплая заря вдоль всей кромки. */}
          <linearGradient id="esp-westglow" {...glowDirection(seaSide)}>
            <stop offset="0%" stopColor="var(--esp-glow)" />
            <stop offset="42%" stopColor="var(--esp-glow)" stopOpacity="0" />
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
            <stop offset="0%" stopColor="var(--esp-sun-1)" />
            <stop offset="52%" stopColor="var(--esp-sun-2)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--esp-sun-2)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Подложка-склон: градиент + мягкая текстура полога + горизонтали рельефа */}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#esp-bg)" />
        <rect x="0" y="0" width="100%" height="100%" filter="url(#esp-canopy)" className="dark:hidden" />
        <rect x="0" y="0" width="100%" height="100%" filter="url(#esp-canopy-dark)" className="hidden dark:block" />
        {CONTOURS.map((d, i) => (
          <path key={`c${i}`} d={d} fill="none" stroke="var(--esp-contour)" strokeWidth={0.4} />
        ))}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#esp-westglow)" />

        {/* Дороги — тонким коридором (мягкая обочина + светлая сплошная середина) */}
        {plan.roads?.map((d, i) => (
          <path key={`rc${i}`} d={d} fill="none" stroke="var(--esp-road)" strokeWidth={3.1} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {plan.roads?.map((d, i) => (
          <path key={`rm${i}`} d={d} fill="none" stroke="var(--esp-road-mid)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Лоты */}
        {lots.map((p, idx) => {
          const pts = p.plotShape!;
          const [rawX, rawY] = centroid(pts);
          const isHover = hovered === p.code;
          const isSel = selected === p.code;
          const isActive = isHover || isSel;
          const dimmed = anySel && !isSel;
          const pointsAttr = pts.map((pt) => pt.join(",")).join(" ");
          const fill =
            p.status === "available"
              ? isActive ? "url(#esp-availH)" : "url(#esp-avail)"
              : p.status === "reserved" ? "url(#esp-reserved)" : "url(#esp-sold)";
          const stroke = isSel ? "var(--esp-sel)" : isHover ? "var(--esp-line-hover)" : "var(--esp-line)";
          const strokeWidth = isSel ? 0.6 : isHover ? 0.46 : 0.26;
          const showChip = p.status === "available" || p.status === "reserved";
          const chipW = 13.4;
          const chipH = p.areaSqm ? 8.2 : 5.4;
          // Держим лейбл внутри полотна — иначе у краевых лотов (M8/M9/R6) чип
          // и подписи уезжают под обрез.
          const cx = clamp(rawX, chipW / 2 + 0.8, vbW - chipW / 2 - 0.8);
          const cy = clamp(rawY, chipH / 2 + 0.8, vbH - chipH / 2 - 0.8);
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
                      rx={1.5}
                      style={{
                        fill: isSel ? "var(--esp-chip-sel)" : isHover ? "var(--esp-chip-hover)" : "var(--esp-chip)",
                        stroke: isSel ? "var(--esp-sel)" : "var(--esp-chip-line)",
                        strokeWidth: isSel ? 0.24 : 0.16,
                        transition: "fill 160ms, stroke 160ms",
                      }}
                    />
                  </g>
                  <text
                    x={cx}
                    y={p.areaSqm ? cy - 0.35 : cy + 1.25}
                    textAnchor="middle"
                    style={{
                      fill: isSel ? "var(--esp-chip-ink-sel)" : "var(--esp-chip-ink)",
                      fontSize: 3.9,
                      fontWeight: 600,
                      letterSpacing: 0.2,
                    }}
                  >
                    {p.code}
                  </text>
                  {p.areaSqm ? (
                    <text x={cx} y={cy + 3.15} textAnchor="middle" style={{ fill: "var(--esp-chip-sub)", fontSize: 2.4, letterSpacing: 0.1 }}>
                      {p.areaSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²
                    </text>
                  ) : null}
                </>
              ) : (
                <>
                  <text x={cx} y={cy - 0.4} textAnchor="middle" style={{ fill: "var(--esp-sold-ink)", fontSize: 3.6, fontWeight: 600, opacity: 0.85 }}>
                    {p.code}
                  </text>
                  <text x={cx} y={cy + 2.9} textAnchor="middle" style={{ fill: "var(--esp-sold-ink)", fontSize: 2.1, letterSpacing: 0.7, opacity: 0.62 }}>
                    {t.status[p.status].toUpperCase()}
                  </text>
                </>
              )}
            </g>
          );
        })}

        <Sun side={seaSide} vbW={vbW} vbH={vbH} label={t.planUi.west} />

        {/* Стрелка севера (правый верх) */}
        <g aria-hidden transform={`translate(${vbW - 7.5}, 11)`}>
          <polygon points="0,-5 -1.9,1.6 0,0.3 1.9,1.6" fill="var(--esp-ink)" fillOpacity={0.85} />
          <text x={0} y={6.2} textAnchor="middle" style={{ fill: "var(--esp-ink)", fontSize: 3.2, fontWeight: 600 }}>
            N
          </text>
        </g>
      </svg>

      {/* Легенда */}
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-forest-500/10 px-4 py-2.5 text-[11px] text-forest-500/70">
        {statusesPresent.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[2px] ring-1 ring-inset ring-forest-500/20"
              style={{ backgroundColor: legendFill[s] }}
              aria-hidden
            />
            {t.status[s]}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/** Направление закатного света: от морской кромки внутрь схемы. */
function glowDirection(side: string) {
  if (side === "right") return { x1: "1", y1: "0", x2: "0", y2: "0" };
  if (side === "top") return { x1: "0", y1: "0", x2: "0", y2: "1" };
  if (side === "bottom") return { x1: "0", y1: "1", x2: "0", y2: "0" };
  return { x1: "0", y1: "0", x2: "1", y2: "0" };
}

/**
 * Закатное солнце — ровно на морской кромке, по её середине (запад = левый край
 * при севере сверху), а не в углу: сторона света читается однозначно. Диск
 * наполовину уходит за обрез — «садится за горизонт»; лучи идут только внутрь схемы.
 */
function Sun({ side, vbW, vbH, label }: { side: string; vbW: number; vbH: number; label: string }) {
  // Подпись идёт вдоль кромки (повёрнута на боковых сторонах) — так она не
  // ложится поверх лейблов лотов у края.
  const pos =
    side === "left"
      ? { x: 0.5, y: vbH / 2, lx: 11.5, ly: vbH / 2, rotate: -90, from: -78, to: 78 }
      : side === "right"
        ? { x: vbW - 0.5, y: vbH / 2, lx: vbW - 11.5, ly: vbH / 2, rotate: 90, from: 102, to: 258 }
        : side === "top"
          ? { x: vbW / 2, y: 0.5, lx: vbW / 2, ly: 13, rotate: 0, from: 12, to: 168 }
          : { x: vbW / 2, y: vbH - 0.5, lx: vbW / 2, ly: vbH - 11, rotate: 0, from: 192, to: 348 };
  const rays = [];
  for (let a = pos.from; a <= pos.to; a += 26) {
    const rad = (a * Math.PI) / 180, r0 = 6.4, r1 = 8.6;
    rays.push(
      <line
        key={a}
        x1={pos.x + r0 * Math.cos(rad)}
        y1={pos.y + r0 * Math.sin(rad)}
        x2={pos.x + r1 * Math.cos(rad)}
        y2={pos.y + r1 * Math.sin(rad)}
        stroke="var(--esp-sun-2)"
        strokeWidth={0.5}
        strokeOpacity={0.75}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <g aria-hidden>
      <circle cx={pos.x} cy={pos.y} r={15} fill="url(#esp-sun)" />
      <circle cx={pos.x} cy={pos.y} r={5} fill="var(--esp-sun-2)" fillOpacity={0.92} />
      {rays}
      <text
        transform={`translate(${pos.lx} ${pos.ly}) rotate(${pos.rotate})`}
        textAnchor="middle"
        style={{
          fill: "var(--esp-west-ink)",
          fontSize: 3.2,
          fontWeight: 600,
          letterSpacing: 0.45,
          stroke: "var(--esp-west-halo)",
          strokeWidth: 0.7,
          paintOrder: "stroke",
        }}
      >
        {label}
      </text>
    </g>
  );
}
