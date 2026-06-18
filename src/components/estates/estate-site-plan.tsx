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

/**
 * Брендовые цвета инлайном (Tailwind fill-цвет с opacity для SVG ненадёжен —
 * проданные уходили в чёрный). Заливки лотов — через градиенты в <defs>.
 */
type Meta = { stroke: string; text: string };
const META: Record<PlotStatus, Meta> = {
  available: { stroke: "#B5651D", text: "#1F3A2E" },
  reserved: { stroke: "#C77929", text: "#965318" },
  sold: { stroke: "rgba(31,58,46,0.22)", text: "rgba(31,58,46,0.5)" },
  rented: { stroke: "rgba(31,58,46,0.3)", text: "rgba(31,58,46,0.6)" },
};

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
 * Интерактивная схема разбивки участка «в стиле RW»: контуры лотов из plotShape
 * примыкают друг к другу (тесселяция по реальному мастер-плану), дороги —
 * коридорами (двойная обводка), мягкие тени и градиентные заливки по статусу,
 * у свободных — лейбл-чип с кодом и площадью. Стрелка-солнце указывает на
 * закатную/морскую сторону. Наведение/клик синхронизированы с таблицей.
 * Геометрия — стилизованная схема (не кадастр).
 */
export function EstateSitePlan({ estate, locale, hovered, onHover, onSelect }: Props) {
  const t = getEstatesDict(locale);
  const plan = estate.plan;
  const lots = estate.plots.filter((p) => p.plotShape && p.plotShape.length >= 3);

  // Хуки — ДО любого раннего return (rules-of-hooks). Каскадное проявление лотов
  // при выходе схемы в кадр. SSR/no-JS: "ready" = всё видимо сразу (как в
  // <Appear>), скрываем и анимируем только после гидрации.
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
  // Стиль проявления для i-го элемента (opacity-only — безопасно в SVG-координатах).
  const reveal = (i: number): React.CSSProperties =>
    phase === "ready"
      ? {}
      : phase === "hidden"
        ? { opacity: 0 }
        : { opacity: 1, transition: `opacity 0.5s ease ${0.04 * i}s` };

  if (!plan || lots.length === 0) return null;

  const seaSide = plan.seaSide ?? "left";
  const statusesPresent = (["available", "reserved", "sold", "rented"] as PlotStatus[]).filter(
    (s) => estate.plots.some((p) => p.status === s),
  );

  return (
    <figure ref={figRef} className="overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50 shadow-sm">
      <svg
        viewBox={plan.viewBox}
        className="block w-full select-none"
        role="img"
        aria-label={t.sections.plan}
      >
        <defs>
          <radialGradient id="esp-bg" cx="32%" cy="24%" r="95%">
            <stop offset="0%" stopColor="#FCF8F0" />
            <stop offset="55%" stopColor="#F2EADB" />
            <stop offset="100%" stopColor="#E6DCC8" />
          </radialGradient>
          <linearGradient id="esp-avail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E4B07A" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#B5651D" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="esp-availH" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8A864" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#B5651D" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id="esp-reserved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C77929" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C77929" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="esp-sold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2C4A3A" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#1F3A2E" stopOpacity="0.06" />
          </linearGradient>
          <filter id="esp-lotsh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0.5" stdDeviation="0.7" floodColor="#1F3A2E" floodOpacity="0.2" />
          </filter>
          <filter id="esp-chipsh" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0.3" stdDeviation="0.5" floodColor="#1F3A2E" floodOpacity="0.22" />
          </filter>
          <radialGradient id="esp-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F4C879" />
            <stop offset="60%" stopColor="#E0922F" />
            <stop offset="100%" stopColor="#E0922F" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Подложка-склон + горизонтали рельефа */}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#esp-bg)" />
        {CONTOURS.map((d, i) => (
          <path key={`c${i}`} d={d} fill="none" stroke="#1F3A2E" strokeOpacity={0.06} strokeWidth={0.5} />
        ))}

        {/* Дороги — коридором (тёмная обочина + светлая середина) */}
        {plan.roads?.map((d, i) => (
          <path key={`rc${i}`} d={d} fill="none" stroke="#D8CDB4" strokeWidth={4.6} strokeLinecap="round" strokeLinejoin="round" style={reveal(0)} />
        ))}
        {plan.roads?.map((d, i) => (
          <path key={`rm${i}`} d={d} fill="none" stroke="#F3ECDD" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" style={reveal(0)} />
        ))}

        {/* Лоты */}
        {lots.map((p, idx) => {
          const pts = p.plotShape!;
          const [cx, cy] = centroid(pts);
          const isHover = hovered === p.code;
          const m = META[p.status];
          const pointsAttr = pts.map((pt) => pt.join(",")).join(" ");
          const fill =
            p.status === "available"
              ? isHover
                ? "url(#esp-availH)"
                : "url(#esp-avail)"
              : p.status === "reserved"
                ? "url(#esp-reserved)"
                : p.status === "sold"
                  ? "url(#esp-sold)"
                  : "url(#esp-sold)";
          const showChip = p.status === "available" || p.status === "reserved";
          const chipW = 14;
          const chipH = p.areaSqm ? 9.2 : 6;
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
                filter="url(#esp-lotsh)"
                style={{
                  fill,
                  stroke: isHover ? "#B5651D" : m.stroke,
                  strokeWidth: isHover ? 1.4 : p.status === "available" ? 0.7 : 0.5,
                  strokeLinejoin: "round",
                  ...(p.status === "reserved" ? { strokeDasharray: "2 1.4" } : {}),
                  transition: "fill 140ms, stroke 140ms, stroke-width 140ms",
                }}
              />
              {showChip ? (
                <>
                  <g filter="url(#esp-chipsh)">
                    <rect
                      x={cx - chipW / 2}
                      y={cy - chipH / 2}
                      width={chipW}
                      height={chipH}
                      rx={1.6}
                      style={{
                        fill: isHover ? "#FFFDF8" : "#FCF8F0",
                        stroke: "#B5651D",
                        strokeOpacity: isHover ? 0.6 : 0.35,
                        strokeWidth: 0.3,
                        transition: "fill 140ms",
                      }}
                    />
                  </g>
                  <text
                    x={cx}
                    y={p.areaSqm ? cy - 0.6 : cy + 1.4}
                    textAnchor="middle"
                    style={{ fill: m.text, fontSize: 4, fontWeight: 700 }}
                  >
                    {p.code}
                  </text>
                  {p.areaSqm ? (
                    <text x={cx} y={cy + 3.6} textAnchor="middle" style={{ fill: "#7A6A4A", fontSize: 2.5 }}>
                      {p.areaSqm.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")} m²
                    </text>
                  ) : null}
                </>
              ) : (
                <>
                  <text x={cx} y={cy - 0.8} textAnchor="middle" style={{ fill: m.text, fontSize: 4, fontWeight: 700 }}>
                    {p.code}
                  </text>
                  <text x={cx} y={cy + 3.2} textAnchor="middle" style={{ fill: "rgba(31,58,46,0.42)", fontSize: 2.3, letterSpacing: 0.5 }}>
                    {t.status[p.status].toUpperCase()}
                  </text>
                </>
              )}
            </g>
          );
        })}

        <Sun side={seaSide} viewBox={plan.viewBox} label={locale === "ru" ? "закат · море" : "sunset · sea"} />
      </svg>

      {/* Легенда */}
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-forest-500/10 px-4 py-2.5 text-[11px] text-forest-500/70">
        {statusesPresent.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[2px]"
              style={{
                backgroundColor:
                  s === "available" ? "rgba(199,121,41,0.32)" : s === "reserved" ? "rgba(199,121,41,0.12)" : "rgba(31,58,46,0.1)",
                outline: `1px solid ${META[s].stroke}`,
              }}
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
function Sun({ side, viewBox, label }: { side: string; viewBox: string; label: string }) {
  const [, , w, h] = viewBox.split(/\s+/).map(Number);
  const pos =
    side === "left"
      ? { x: 12, y: 19, lx: 21, ly: 20, anchor: "start" as const }
      : side === "right"
        ? { x: w - 12, y: 19, lx: w - 21, ly: 20, anchor: "end" as const }
        : side === "top"
          ? { x: w * 0.5, y: 12, lx: w * 0.5, ly: 26, anchor: "middle" as const }
          : { x: w * 0.5, y: h - 12, lx: w * 0.5, ly: h - 24, anchor: "middle" as const };
  const rays = [];
  for (let a = 0; a < 360; a += 45) {
    const rad = (a * Math.PI) / 180, r0 = 4.4, r1 = 6.2;
    rays.push(
      <line
        key={a}
        x1={pos.x + r0 * Math.cos(rad)}
        y1={pos.y + r0 * Math.sin(rad)}
        x2={pos.x + r1 * Math.cos(rad)}
        y2={pos.y + r1 * Math.sin(rad)}
        stroke="#E0922F"
        strokeWidth={0.8}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <g aria-hidden>
      <circle cx={pos.x} cy={pos.y} r={11} fill="url(#esp-sun)" />
      <circle cx={pos.x} cy={pos.y} r={3.1} fill="#E0922F" />
      {rays}
      <text x={pos.lx} y={pos.ly} textAnchor={pos.anchor} style={{ fill: "#965318", fontSize: 3.1, fontWeight: 600 }}>
        {label}
      </text>
    </g>
  );
}
