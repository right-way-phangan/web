import { useLayoutEffect, type RefObject } from "react";

type LeafletContainer = HTMLElement & { _leaflet_id?: number };

/**
 * Makes react-leaflet survive React StrictMode's dev double-mount.
 *
 * react-leaflet v4 re-initialises the map inside a container ref callback (a
 * *layout*-phase effect) but tears it down with `map.remove()` inside a
 * `useEffect` (*passive* phase). Under StrictMode the disappear→reappear cycle
 * runs the layout re-attach before the passive teardown, so a fresh `L.Map` is
 * created on a container that still carries `_leaflet_id` → "Map container is
 * already initialized". Clearing that id synchronously in a layout cleanup —
 * ahead of the re-attach — lets the re-init start from a clean node.
 *
 * Pass a ref to the element wrapping <MapContainer>.
 */
export function useLeafletStrictModeFix(wrapperRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    return () => {
      const el = wrapper?.querySelector(".leaflet-container") as LeafletContainer | null;
      if (el && el._leaflet_id != null) delete el._leaflet_id;
    };
  }, [wrapperRef]);
}
