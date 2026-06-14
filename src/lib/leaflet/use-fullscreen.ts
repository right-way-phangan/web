import { useCallback, useEffect, useState, type RefObject } from "react";
import type { Map as LeafletMap } from "leaflet";

/**
 * Native-Fullscreen toggle for a Leaflet map. Requests fullscreen on the map's
 * wrapper element (so controls + legend come along), and re-fits the map after
 * the viewport changes (`invalidateSize`) so tiles fill the new size.
 *
 * `supported` is false where the element Fullscreen API is missing — notably
 * iPhone Safari, which only fullscreens <video>. Callers hide the button there.
 */
export function useFullscreen(
  wrapperRef: RefObject<HTMLElement | null>,
  mapRef: RefObject<LeafletMap | null>,
) {
  const [isFull, setIsFull] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof document !== "undefined" &&
        typeof document.documentElement.requestFullscreen === "function",
    );
    function onChange() {
      setIsFull(document.fullscreenElement === wrapperRef.current);
      // Let the browser settle the new box, then fix Leaflet's tile layout.
      window.setTimeout(() => mapRef.current?.invalidateSize(), 120);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [wrapperRef, mapRef]);

  const toggle = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void el.requestFullscreen?.();
  }, [wrapperRef]);

  return { isFull, supported, toggle };
}
