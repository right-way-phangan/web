"use client";

import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

/** Floor plans / masterplan grid with a full-screen lightbox. Plans render
 * object-contain (never cropped). Plain <img> since plan URLs may live on
 * arbitrary (non-allowlisted) hosts. */
export function Floorplans({ urls }: { urls: string[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + urls.length) % urls.length),
    [urls.length],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % urls.length), [urls.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {urls.map((url, i) => (
          <button
            type="button"
            key={url}
            onClick={() => openAt(i)}
            className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm border border-forest-500/10 bg-cream-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Floor plan ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute right-2 top-2 rounded-sm bg-cream-50/90 p-1.5 text-forest-500 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-panel/90 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex flex-col focus:outline-none"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Floor plan {index + 1}</Dialog.Title>
            <div className="flex items-center justify-between px-4 py-4 text-panel-fg md:px-8">
              <span className="text-sm tabular-nums text-panel-fg/80">
                {index + 1} / {urls.length}
              </span>
              <Dialog.Close className="rounded-sm p-2 opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-panel-fg/60">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 md:px-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urls[index]}
                alt={`Floor plan ${index + 1}`}
                className="max-h-full max-w-full object-contain"
              />
              {urls.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-panel/40 p-2 text-panel-fg transition-colors hover:bg-panel/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-panel-fg/60 md:left-6 md:p-3"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-panel/40 p-2 text-panel-fg transition-colors hover:bg-panel/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-panel-fg/60 md:right-6 md:p-3"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
