"use client";

import { useEffect, useState, type ComponentProps } from "react";
import type { HeroFall } from "./hero-fall";

type Props = ComponentProps<typeof HeroFall>;

/**
 * Клиентская калитка для HeroFall. Чанк hero-fall (+motion, ~45 КБ gzip)
 * загружается только когда обёртка реально отрендерена: и статический импорт,
 * и next/dynamic в серверном компоненте кладут client reference в скрипты
 * страницы независимо от того, отрисован ли он. До загрузки — ровно children,
 * как и сам HeroFall до своего решения включаться.
 */
export function HeroFallLazy({ children, ...props }: Props) {
  const [Comp, setComp] = useState<typeof HeroFall | null>(null);

  useEffect(() => {
    let alive = true;
    import("./hero-fall").then((m) => {
      if (alive) setComp(() => m.HeroFall);
    });
    return () => {
      alive = false;
    };
  }, []);

  return Comp ? <Comp {...props}>{children}</Comp> : <>{children}</>;
}
