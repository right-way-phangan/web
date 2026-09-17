"use client";

import dynamic from "next/dynamic";
import type { ComponentType, JSX } from "react";
import { retryChunk } from "@/lib/lazy-chunk";
import { reportClientError } from "@/lib/report-client-error";
import { MapSkeleton, MapUnavailable } from "./map-skeleton";

/**
 * Ленивая Leaflet-карта, которая не роняет страницу.
 *
 * `next/dynamic` сам по себе не повторяет загрузку и не ловит отказ: оборванный
 * чанк уходил в error boundary и заменял всю страницу на «We hit an unexpected
 * error» — из-за карты, без которой каталог прекрасно читается. Здесь три
 * попытки (retryChunk), а если и они не помогли — на месте карты заглушка, и
 * один внятный маячок вместо «Loading chunk NNNN failed» без адреса.
 */
export function lazyMap<P extends object>(
  name: string,
  load: () => Promise<{ default: ComponentType<P> }>,
  loading: () => JSX.Element = () => <MapSkeleton />,
) {
  return dynamic<P>(
    () =>
      retryChunk(load).catch(() => {
        reportClientError(new Error(`Leaflet map "${name}" failed to load after 3 attempts`), "promise");
        return { default: MapUnavailable as ComponentType<P> };
      }),
    { ssr: false, loading },
  );
}
