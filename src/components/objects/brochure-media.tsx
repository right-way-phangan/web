"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Deferred, print-only media grid for the listing brochure. These images load
 * straight from storage (no next/image — a lazily-optimized photo that never
 * entered the viewport would print blank), so mounting them on every page view
 * fetched up to 4 full-size originals + a static map from blob on *every* visit
 * and bot crawl. That direct, un-cached traffic is what exhausted the Blob
 * transfer quota and got the store blocked (403). → memory
 * project_image_optimization_limit
 *
 * Fix: render nothing until a print is actually requested. The brochure button
 * dispatches `rw:brochure`; we preload the media, then open the print dialog so
 * the photos are present in the printout. Native Cmd/Ctrl+P (beforeprint)
 * mounts them best-effort for the next print.
 */
export function BrochureMedia({
  photos,
  mapUrl,
  altPrefix,
}: {
  photos: string[];
  mapUrl: string | null;
  altPrefix: string;
}) {
  const [armed, setArmed] = useState(false);
  const printing = useRef(false);

  useEffect(() => {
    const arm = () => setArmed(true);
    // Native print (Cmd/Ctrl+P): mount best-effort — can't preload-then-print,
    // so the very first native print may show blank tiles; subsequent ones are
    // cached. Most users print via the brochure button below.
    window.addEventListener("beforeprint", arm);

    const onRequest = () => {
      if (printing.current) return;
      printing.current = true;
      setArmed(true);
      const urls = [...photos, ...(mapUrl ? [mapUrl] : [])];
      Promise.all(
        urls.map(
          (u) =>
            new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = img.onerror = () => resolve();
              img.src = u;
            }),
        ),
      ).finally(() => {
        // Let React flush the mounted <img>s before the (blocking) print dialog.
        requestAnimationFrame(() => {
          window.print();
          printing.current = false;
        });
      });
    };
    window.addEventListener("rw:brochure", onRequest);

    return () => {
      window.removeEventListener("beforeprint", arm);
      window.removeEventListener("rw:brochure", onRequest);
    };
  }, [photos, mapUrl]);

  if (!armed) return null;

  return (
    <>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`${altPrefix} — photo ${i + 1}`}
              className="aspect-[4/3] w-full object-cover"
              loading="eager"
            />
          ))}
        </div>
      ) : null}
      {mapUrl ? (
        <div className="mt-2">
          {/* Server-composed static map (interactive Leaflet is print-hidden). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapUrl}
            alt={`Location of ${altPrefix} on Koh Phangan`}
            className="aspect-[12/5] w-full object-cover"
            loading="eager"
          />
        </div>
      ) : null}
    </>
  );
}
