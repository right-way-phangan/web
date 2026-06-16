"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Scene = { src: string; alt: string };

/**
 * Hero backdrop: a slow crossfade through a handful of Phangan scenes, with a
 * subtle Ken-Burns drift on the active frame so a single image never feels
 * static. Scenes come from /scenes.json, rebuilt weekly by a GitHub Action from
 * our own catalog (scripts/build-scenes.mjs) — so the hero refreshes itself as
 * inventory turns over, with zero manual edits.
 *
 * The static fallback ships in the HTML as the LCP image (priority) so the hero
 * paints instantly even before the manifest loads or if it's empty/unreachable.
 * Scene layers fade in over it. Honours prefers-reduced-motion (no auto-rotate).
 */
export function HeroBackground({
  fallbackSrc,
  fallbackAlt,
}: {
  fallbackSrc: string;
  fallbackAlt: string;
}) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [idx, setIdx] = useState(0);
  // Какие сцены уже монтировались: рендерим только показанные + следующую.
  // Монтировать все шесть сразу — это ~400KB полноэкранных AVIF, душивших
  // канал и оттягивавших LCP-отрисовку fallback'а до ~6s на мобильном 4G.
  const [warm, setWarm] = useState<number[]>([]);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Манифест — только после window.load и паузы: слайдшоу — украшение,
    // оно не имеет права конкурировать за канал с LCP-картинкой.
    let alive = true;
    let timer: number | undefined;
    const load = () => {
      fetch("/scenes.json", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!alive) return;
          const list = Array.isArray(data?.scenes) ? data.scenes : [];
          const clean = list
            .filter((s: Scene) => s && typeof s.src === "string")
            .slice(0, 6);
          if (clean.length) setScenes(clean);
        })
        .catch(() => {
          /* manifest missing/unreachable — fallback already on screen */
        });
    };
    const arm = () => {
      timer = window.setTimeout(load, 2500);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      alive = false;
      window.clearTimeout(timer);
      window.removeEventListener("load", arm);
    };
  }, []);

  // Текущая сцена + следующая (прогревается за кадром все 6.5s показа).
  useEffect(() => {
    if (!scenes.length) return;
    setWarm((m) => {
      const want = new Set(m);
      want.add(idx);
      want.add((idx + 1) % scenes.length);
      return want.size === m.length ? m : [...want];
    });
  }, [idx, scenes.length]);

  useEffect(() => {
    if (scenes.length < 2 || reducedMotion.current) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % scenes.length),
      6500,
    );
    return () => clearInterval(t);
  }, [scenes.length]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-panel">
      {/* One continuous Ken-Burns drift on the whole image stack — never a
          per-frame transform toggle (that snapped scale back on the fading
          frame and caused a visible jerk just before each crossfade). The
          crossfade is opacity-only; the slow zoom rides underneath it. */}
      <div className="absolute inset-0 motion-safe:animate-[heroDrift_28s_ease-in-out_infinite_alternate]">
        {/* Fallback / LCP layer — always present underneath the scene crossfade. */}
        <Image
          src={fallbackSrc}
          alt={fallbackAlt}
          fill
          priority
          sizes="100vw"
          quality={65}
          className="object-cover"
        />

        {scenes.map((scene, i) =>
          warm.includes(i) ? (
            <Image
              key={scene.src}
              src={scene.src}
              alt={scene.alt || fallbackAlt}
              fill
              sizes="100vw"
              quality={60}
              aria-hidden={i !== idx}
              className={[
                "object-cover transition-opacity duration-[1200ms] ease-in-out",
                i === idx ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
          ) : null,
        )}
      </div>

      {/* Dot indicators — quietly clickable, hidden when there's nothing to cycle. */}
      {scenes.length > 1 ? (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 md:bottom-8 md:right-8">
          {scenes.map((scene, i) => (
            <button
              key={scene.src}
              type="button"
              aria-label={`Show scene ${i + 1}`}
              aria-current={i === idx}
              onClick={() => setIdx(i)}
              // 24×24 tap target (WCAG 2.5.8) via the flex box; the visible dot
              // stays small inside it.
              className="group/dot flex h-6 w-6 items-center justify-center"
            >
              <span
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  i === idx
                    ? "w-6 bg-cream-50"
                    : "w-1.5 bg-cream-50/40 group-hover/dot:bg-cream-50/70",
                ].join(" ")}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
