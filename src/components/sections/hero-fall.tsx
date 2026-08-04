"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ChevronDown } from "lucide-react";
import {
  segmentOpacity,
  shouldEnableFlight,
  type FadeWindow,
} from "@/lib/motion/scrub";

/**
 * Скролл-падение «с неба в бухту» — «вау»-надстройка над обычным hero.
 * Обёртка на 320svh + sticky-вьюпорт: скролл ведёт камеру по четырём
 * курируемым кадрам public/hero/ (закатное небо → джунгли строго сверху →
 * прорыв сквозь листву → бухта), по ходу всплывают три титра-фишки,
 * «приземление» гасит слои и раскрывает настоящий hero (заголовок, чипы, CTA,
 * тикер), который приходит как children и рендерится сервером. Финальный кадр
 * = LCP-фото самого hero (/hero-phangan.jpg), поэтому стык бесшовный.
 *
 * Прогрессивное улучшение (архитектура hero-flight, PR#195, но без видео):
 * пока гейты не пройдены и сцены не декодированы, рендерит ровно children в
 * обычном потоке — SSR/no-JS/reduced-motion/мобильные/медленный канал получают
 * сегодняшнюю страницу. Сцены не трогают канал до window.load + паузы + idle,
 * чтобы не конкурировать с LCP-картинкой hero.
 */

const MIN_DESKTOP_WIDTH = 1024;

// Кадры пролёта — те же курируемые фото, что крутит слайдшоу героя
// (public/images/CREDITS.md). BAY намеренно равен LCP-фону статичного hero.
const SKY = "/hero/scene-3.jpg";
const CANOPY = "/hero/scene-2.jpg";
const LEAVES = "/hero/scene-6.jpg";
const BAY = "/hero-phangan.jpg";

// Окна титров [появление, начало плато, конец плато, исчезновение] по прогрессу.
const CHECKPOINT_WINDOWS: FadeWindow[] = [
  [0.1, 0.14, 0.24, 0.3],
  [0.36, 0.4, 0.5, 0.56],
  [0.6, 0.64, 0.74, 0.8],
];

type HeroFallDict = {
  scrollCue: string;
  skip: string;
  checkpoints: { title: string; text: string }[];
};

export function HeroFall({
  dict,
  children,
}: {
  dict: HeroFallDict;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [landed, setLanded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  // Пружина сглаживает скролл — колесо мыши шагает, а камера летит плавно.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 34,
    mass: 0.4,
  });

  // Мастер-прозрачность всей сцены: мягкий вход на первых пикселях скролла
  // (hero успевает побыть LCP-кадром), полный уход на «приземлении».
  const master = useTransform(smooth, [0, 0.02, 0.86, 0.96], [0, 1, 1, 0]);
  const cueOpacity = useTransform(smooth, [0, 0.05, 0.09], [1, 1, 0]);

  // Акт 1 — небо: висим в облаках, потом кадр «проваливается» к острову.
  const skyOpacity = useTransform(smooth, [0, 0.26, 0.34], [1, 1, 0]);
  const skyScale = useTransform(smooth, [0, 0.34], [1.35, 2.05]);
  const skyY = useTransform(smooth, [0, 0.34], ["4%", "-12%"]);

  // Акт 2 — джунгли строго сверху: земля летит навстречу (зум = падение).
  const canopyOpacity = useTransform(
    smooth,
    [0.24, 0.32, 0.55, 0.64],
    [0, 1, 1, 0],
  );
  const canopyScale = useTransform(smooth, [0.24, 0.64], [1, 2.7]);
  const canopyBlurPx = useTransform(smooth, [0.48, 0.64], [0, 6]);
  const canopyFilter = useMotionTemplate`blur(${canopyBlurPx}px)`;

  // Акт 3 — прорыв сквозь листву: сильный зум в гущу веток + смаз по краям.
  const leavesOpacity = useTransform(
    smooth,
    [0.55, 0.63, 0.73, 0.8],
    [0, 1, 1, 0],
  );
  const leavesScale = useTransform(smooth, [0.55, 0.8], [1.1, 3.4]);
  const leavesBlurPx = useTransform(smooth, [0.64, 0.8], [0.5, 9]);
  const leavesFilter = useMotionTemplate`blur(${leavesBlurPx}px)`;

  // Акт 4 — бухта: торможение (зум откатывается к 1) и подъём яркости; дальше
  // мастер-фейд открывает под слоем настоящий hero с тем же фото.
  const bayOpacity = useTransform(smooth, [0.73, 0.81], [0, 1]);
  const bayScale = useTransform(smooth, [0.73, 0.96], [1.3, 1.02]);
  const bayBrightness = useTransform(smooth, [0.73, 0.9], [0.72, 1]);
  const bayFilter = useMotionTemplate`brightness(${bayBrightness})`;

  // Включение: только после load + пауза + idle, только если гейты прошли и
  // все четыре кадра декодированы (иначе первый скролл показал бы белые слои).
  useEffect(() => {
    if (reduce) return;
    let alive = true;
    let armTimer: number | undefined;
    let idleId: number | undefined;

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

    let removeRetry: (() => void) | undefined;

    const begin = async () => {
      // Статические гейты (указатель/ширина/reduce/канал) — здесь; позиционный
      // «у верха страницы» переигрывается ниже, чтобы улистнувший вниз
      // пользователь получил пролёт при возврате наверх, а не пустоту.
      if (!alive || !shouldEnableFlight({ ...gate(), scrollY: 0 })) return;
      try {
        await Promise.all([SKY, CANOPY, LEAVES, BAY].map(preloadImage));
      } catch {
        return; /* dormant — hero уже на экране, ничего не ломаем */
      }
      if (!alive) return;
      // Включаем только у самого верха: там сцена при p≈0 прозрачна, поэтому
      // рост обёртки 100svh→320svh и появление слоёв не дают видимого скачка.
      const tryEnable = () => {
        if (!alive) return true;
        if (window.scrollY > 4 || !shouldEnableFlight(gate())) return false;
        setEnabled(true);
        return true;
      };
      if (tryEnable()) return;
      const onScroll = () => {
        if (tryEnable()) removeRetry?.();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      removeRetry = () => {
        window.removeEventListener("scroll", onScroll);
        removeRetry = undefined;
      };
    };

    const arm = () => {
      armTimer = window.setTimeout(() => {
        const ric = window.requestIdleCallback;
        idleId = ric
          ? ric(() => void begin(), { timeout: 1200 })
          : window.setTimeout(() => void begin(), 0);
      }, 600);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    return () => {
      alive = false;
      window.clearTimeout(armTimer);
      window.removeEventListener("load", arm);
      if (idleId != null) window.cancelIdleCallback?.(idleId);
      removeRetry?.();
    };
  }, [reduce]);

  // Единый tick пружины: inert на hero-контент + флаг «приземлились».
  // inert, пока сцена визуально закрывает hero — иначе фокус уходит на
  // невидимые CTA (WCAG 2.4.3/2.4.7). Снимаем на приземлении.
  useMotionValueEvent(smooth, "change", (p) => {
    contentRef.current?.toggleAttribute("inert", enabled && p < 0.82);
    setLanded(enabled && p >= 0.84);
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
        {/* Настоящий hero — SSR, всегда в DOM. Под сценой он скрыт визуально и
            помечается inert; на приземлении раскрывается как есть. */}
        <div ref={contentRef}>{children}</div>

        {enabled ? (
          <>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 overflow-hidden bg-panel"
              style={{ opacity: master }}
            >
              <SceneLayer
                src={SKY}
                origin="50% 28%"
                style={{ opacity: skyOpacity, scale: skyScale, y: skyY }}
              />
              <SceneLayer
                src={CANOPY}
                origin="52% 45%"
                style={{
                  opacity: canopyOpacity,
                  scale: canopyScale,
                  filter: canopyFilter,
                }}
              />
              <SceneLayer
                src={LEAVES}
                origin="66% 60%"
                style={{
                  opacity: leavesOpacity,
                  scale: leavesScale,
                  filter: leavesFilter,
                }}
              />
              <SceneLayer
                src={BAY}
                origin="50% 50%"
                style={{
                  opacity: bayOpacity,
                  scale: bayScale,
                  filter: bayFilter,
                }}
              />

              {/* Teal-скрим для читабельности титров поверх пёстрых кадров. */}
              <div className="absolute inset-0 bg-gradient-to-tr from-panel/70 via-panel/30 to-panel/15" />
            </motion.div>

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

/** Полноэкранный кадр пролёта: transform/opacity/filter — только на обёртке. */
function SceneLayer({
  src,
  origin,
  style,
}: {
  src: string;
  origin: string;
  style: React.ComponentProps<typeof motion.div>["style"];
}) {
  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{ transformOrigin: origin, ...style }}
    >
      {/* Кадры декоративны (смысловой alt несёт hero под ними) — пустой alt. */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
      />
    </motion.div>
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

/** Загрузка + декод кадра до включения сцены (без сетевого приоритета LCP). */
function preloadImage(src: string): Promise<void> {
  const img = new Image();
  img.src = src;
  const loaded = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`preload failed: ${src}`));
  });
  // decode() дожидается и загрузки, и декода; где его нет — хватит onload.
  return img.decode ? img.decode().catch(() => loaded) : loaded;
}
