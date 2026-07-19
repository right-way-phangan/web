"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ChevronDown } from "lucide-react";
import { R2_PUBLIC_BASE } from "@/lib/storage/r2-public";
import {
  progressToTime,
  quantizeToFrame,
  segmentOpacity,
  shouldEnableFlight,
  type FadeWindow,
} from "@/lib/motion/scrub";

/**
 * Скраб-пролёт острова с пикированием — «вау»-надстройка над обычным hero.
 * Обёртка на 320svh + sticky-вьюпорт: скролл гонит таймлайн видео (пролёт над
 * Панганом → пике к берегу → торможение над виллами), по ходу всплывают три
 * титра-фишки, «приземление» гасит видео и раскрывает настоящий hero (заголовок,
 * чипы, CTA, тикер), который приходит как children и рендерится сервером.
 *
 * Прогрессивное улучшение: пока гейты не пройдены и видео не загружено, рендерит
 * ровно children в обычном потоке — то есть сегодняшнюю страницу. SSR/no-JS/
 * reduced-motion/мобильные/медленный канал получают именно её. Дисциплина
 * загрузки повторяет hero-background.tsx: видео не трогает канал до window.load
 * + паузы + idle, чтобы не конкурировать с LCP-картинкой hero.
 */

const FPS = 24;
const MIN_DESKTOP_WIDTH = 1024;
// Файл в R2. Пока dev-плейсхолдер; после утверждения ролика — hero/flight-v1-1080.mp4.
const VIDEO_KEY = "hero/flight-dev-1080.mp4";
const R2_DIRECT = `${R2_PUBLIC_BASE}${VIDEO_KEY}`;
const R2_PROXY = `/media/r2/${VIDEO_KEY}`;

// Окна титров [появление, начало плато, конец плато, исчезновение] по прогрессу.
const CHECKPOINT_WINDOWS: FadeWindow[] = [
  [0.1, 0.14, 0.24, 0.3],
  [0.36, 0.4, 0.5, 0.56],
  [0.6, 0.64, 0.74, 0.8],
];

type HeroFlightDict = {
  scrollCue: string;
  skip: string;
  checkpoints: { title: string; text: string }[];
};

export function HeroFlight({
  dict,
  children,
}: {
  dict: HeroFlightDict;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [landed, setLanded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  // Пружина сглаживает скролл — прячет квантизацию seek и рывки.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 34,
    mass: 0.4,
  });

  const videoOpacity = useTransform(smooth, [0, 0.03, 0.84, 0.96], [0, 1, 1, 0]);
  const videoScale = useTransform(smooth, [0.84, 1], [1, 1.06]);
  const cueOpacity = useTransform(smooth, [0, 0.05, 0.09], [1, 1, 0]);

  // Загрузка видео: только после load + пауза + idle, только если гейты прошли.
  useEffect(() => {
    if (reduce) return;
    let alive = true;
    let objectUrl: string | undefined;
    let armTimer: number | undefined;
    let idleId: number | undefined;
    const controller = new AbortController();

    const gate = () => ({
      reduce: false,
      pointerFine: window.matchMedia?.("(pointer: fine)").matches ?? false,
      viewportWidth: window.innerWidth,
      minWidth: MIN_DESKTOP_WIDTH,
      saveData: Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } })
          .connection?.saveData,
      ),
      effectiveType: (
        navigator as Navigator & { connection?: { effectiveType?: string } }
      ).connection?.effectiveType,
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
    });

    const begin = async () => {
      if (!alive || !shouldEnableFlight(gate())) return;
      const video = videoRef.current;
      if (!video) return;
      try {
        const res = await fetchVideo(controller.signal);
        if (!alive || !res) return;
        const blob = await res.blob();
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        video.load();
        await once(video, "loadedmetadata", controller.signal);
        if (!alive) return;
        durationRef.current = video.duration || 0;
        if (!durationRef.current) return;
        // Повторный гейт: пока грузилось, пользователь мог уйти вниз.
        if (!shouldEnableFlight(gate())) return;
        setEnabled(true);
      } catch {
        /* dormant — hero уже на экране, ничего не ломаем */
      }
    };

    const arm = () => {
      armTimer = window.setTimeout(() => {
        const ric = window.requestIdleCallback;
        idleId = ric
          ? ric(() => void begin(), { timeout: 2000 })
          : window.setTimeout(() => void begin(), 0);
      }, 2500);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    // Не висим в fetching вечно (мёртвый/медленный blob).
    const abortTimer = window.setTimeout(() => controller.abort(), 20000);

    return () => {
      alive = false;
      controller.abort();
      window.clearTimeout(armTimer);
      window.clearTimeout(abortTimer);
      window.removeEventListener("load", arm);
      if (idleId != null) window.cancelIdleCallback?.(idleId);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reduce]);

  // Единый tick пружины: seek видео + inert на hero-контент + флаг «приземлились».
  useMotionValueEvent(smooth, "change", (p) => {
    // inert, пока видео визуально закрывает hero — иначе фокус уходит на
    // невидимые CTA (WCAG 2.4.3/2.4.7). Снимаем на приземлении.
    contentRef.current?.toggleAttribute("inert", enabled && p < 0.82);
    setLanded(enabled && p >= 0.84);

    const v = videoRef.current;
    const d = durationRef.current;
    if (!enabled || !v || v.seeking || !d) return; // один seek в полёте (Safari копит очередь)
    const t = quantizeToFrame(progressToTime(p, d), FPS);
    if (Math.abs(t - v.currentTime) < 1 / (2 * FPS)) return; // тот же кадр
    try {
      v.currentTime = t;
    } catch {
      /* seek до готовности — пропускаем кадр */
    }
  });

  // Выключились (сбой/анмаунт enabled) — гарантированно снять inert.
  useEffect(() => {
    if (!enabled) contentRef.current?.toggleAttribute("inert", false);
  }, [enabled]);

  const skip = () => {
    const el = wrapRef.current;
    if (!el) return;
    window.scrollTo({
      top: el.offsetTop + el.offsetHeight - window.innerHeight,
      behavior: "auto",
    });
  };

  return (
    <div
      ref={wrapRef}
      className="relative bg-panel"
      style={enabled ? { height: "320svh" } : undefined}
    >
      <div className={enabled ? "sticky top-0 h-svh overflow-hidden" : undefined}>
        {/* Настоящий hero — SSR, всегда в DOM. Под видео он скрыт визуально и
            помечается inert; на приземлении раскрывается как есть. */}
        <div ref={contentRef}>{children}</div>

        {/* Видео монтируем всегда (грузим blob до enabled), но прячем display'ем,
            пока пролёт не включён — display:none не мешает буферизации. */}
        <motion.video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 h-full w-full object-cover"
          style={{
            opacity: videoOpacity,
            scale: videoScale,
            display: enabled ? undefined : "none",
          }}
        />

        {enabled ? (
          <>
            {/* Teal-скрим для читабельности титров, гаснет вместе с видео. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-panel/85 via-panel/40 to-panel/20"
              style={{ opacity: videoOpacity }}
            />

            {dict.checkpoints.slice(0, 3).map((c, i) => (
              <Checkpoint
                key={c.title}
                smooth={smooth}
                window={CHECKPOINT_WINDOWS[i]}
                title={c.title}
                text={c.text}
              />
            ))}

            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-10 z-30 flex flex-col items-center gap-2 text-panel-fg/70"
              style={{ opacity: cueOpacity }}
            >
              <span className="text-xs uppercase tracking-[0.2em]">
                {dict.scrollCue}
              </span>
              <ChevronDown className="h-5 w-5 motion-safe:animate-bounce" />
            </motion.div>

            {!landed ? (
              <button
                type="button"
                onClick={skip}
                className="absolute right-5 top-24 z-40 rounded-full border border-panel-fg/30 bg-panel/40 px-4 py-2 text-xs uppercase tracking-[0.15em] text-panel-fg/80 backdrop-blur transition-colors hover:border-brass-300/60 hover:text-brass-200"
              >
                {dict.skip}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function Checkpoint({
  smooth,
  window: win,
  title,
  text,
}: {
  smooth: MotionValue<number>;
  window: FadeWindow;
  title: string;
  text: string;
}) {
  const opacity = useTransform(smooth, (p: number) => segmentOpacity(p, win));
  // Лёгкий подъём при появлении: 16px внизу, когда невидим.
  const y = useTransform(smooth, (p: number) => (1 - segmentOpacity(p, win)) * 16);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
      style={{ opacity, y }}
    >
      <span className="h-px w-12 bg-brass-300/70" />
      <h2 className="mt-6 max-w-2xl text-4xl leading-tight text-panel-fg md:text-6xl md:leading-[1.05]">
        {title}
      </h2>
      <p className="mt-4 max-w-md text-base text-panel-fg/80 md:text-lg">{text}</p>
    </motion.div>
  );
}

/** Прямой R2 (бесплатный egress) → при CORS/блокировке региона same-origin прокси. */
async function fetchVideo(signal: AbortSignal): Promise<Response | null> {
  try {
    const r = await fetch(R2_DIRECT, { signal, mode: "cors" });
    if (r.ok) return r;
  } catch {
    /* CORS/блокировка → прокси */
  }
  const p = await fetch(R2_PROXY, { signal });
  return p.ok ? p : null;
}

/** Одноразовое ожидание media-события с отменой по signal и отказом по 'error'. */
function once(
  el: HTMLVideoElement,
  event: string,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      el.removeEventListener(event, onDone);
      el.removeEventListener("error", onFail);
      signal.removeEventListener("abort", onAbort);
    };
    const onDone = () => {
      cleanup();
      resolve();
    };
    const onFail = () => {
      cleanup();
      reject(new Error(event));
    };
    const onAbort = () => {
      cleanup();
      reject(new Error("abort"));
    };
    el.addEventListener(event, onDone, { once: true });
    el.addEventListener("error", onFail, { once: true });
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
