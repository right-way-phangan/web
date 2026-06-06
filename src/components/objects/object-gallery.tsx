"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import {
  TreePine,
  Home,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Images,
} from "lucide-react";
import type { ObjectType } from "@/types/object";

const TYPE_ICON: Record<ObjectType, typeof Home> = {
  Land: TreePine,
  Villa: Home,
  House: Home,
  Apartment: Building2,
  Townhouse: Home,
  Hotel: Building2,
  Business: Building2,
  Project: Building2,
};

function hueFor(seed: string, offset = 0): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h + offset) % 360;
}

interface Props {
  rwNumber: string;
  type: ObjectType;
  gallery?: string[];
}

/**
 * Airbnb-style 1+4 layout backed by real photos (migrated Drive → Vercel Blob,
 * see bot/scripts/migrate_photos_to_blob.py). Clicking any tile opens a
 * full-screen lightbox with keyboard / arrow navigation. Falls back to
 * deterministic gradient panels when an object has no photos yet.
 */
export function ObjectGallery({ rwNumber, type, gallery }: Props) {
  const Icon = TYPE_ICON[type];
  const photos = (gallery ?? []).filter(Boolean);
  const hasPhotos = photos.length > 0;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  // ---- No photos: deterministic gradient placeholder grid ----
  if (!hasPhotos) {
    const tiles = [0, 60, 120, 180, 240].map((offset, i) => ({
      key: i,
      style: {
        backgroundImage: `linear-gradient(135deg, hsl(${hueFor(rwNumber, offset)} 30% 86%) 0%, hsl(${hueFor(rwNumber, offset + 40)} 25% 76%) 100%)`,
      },
    }));
    return (
      <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-sm bg-forest-500/5 md:col-span-2 md:row-span-2 md:aspect-auto"
          style={tiles[0].style}
        >
          <div className="absolute inset-0 flex items-center justify-center text-forest-500/25">
            <Icon className="h-24 w-24" strokeWidth={0.8} />
          </div>
        </div>
        {tiles.slice(1).map((tile) => (
          <div
            key={tile.key}
            className="relative hidden aspect-[4/3] overflow-hidden rounded-sm bg-forest-500/5 md:block"
            style={tile.style}
          >
            <div className="absolute inset-0 flex items-center justify-center text-forest-500/15">
              <Icon className="h-10 w-10" strokeWidth={0.8} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---- Real photos ----
  const sideTiles = photos.slice(1, 5);
  const heroSpansFull = sideTiles.length === 0;

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <>
      <div className="relative grid gap-2 md:grid-cols-4 md:grid-rows-2">
        {/* Hero */}
        <button
          type="button"
          onClick={() => openAt(0)}
          className={`group relative aspect-[4/3] overflow-hidden rounded-sm bg-forest-500/5 md:row-span-2 md:aspect-auto ${
            heroSpansFull ? "md:col-span-4" : "md:col-span-2"
          }`}
        >
          <Image
            src={photos[0]}
            alt={`${rwNumber} — photo 1`}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>

        {sideTiles.map((url, i) => {
          const photoIndex = i + 1;
          const isLastVisible = i === sideTiles.length - 1;
          const remaining = photos.length - 5;
          return (
            <button
              type="button"
              key={photoIndex}
              onClick={() => openAt(photoIndex)}
              className="group relative hidden aspect-[4/3] overflow-hidden rounded-sm bg-forest-500/5 md:block"
            >
              <Image
                src={url}
                alt={`${rwNumber} — photo ${photoIndex + 1}`}
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {isLastVisible && remaining > 0 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-forest-900/55 text-lg font-medium text-cream-50">
                  +{remaining}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Show-all button (mobile + desktop) */}
        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-sm bg-cream-50/90 px-3 py-1.5 text-xs font-medium text-forest-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-cream-50 md:bottom-5 md:right-5"
        >
          <Images className="h-4 w-4" />
          {photos.length} photo{photos.length === 1 ? "" : "s"}
        </button>
      </div>

      {/* Lightbox */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-forest-900/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex flex-col focus:outline-none"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">
              {rwNumber} photos — {index + 1} of {photos.length}
            </Dialog.Title>

            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-4 text-cream-50 md:px-8">
              <span className="text-sm tabular-nums text-cream-50/80">
                {index + 1} / {photos.length}
              </span>
              <Dialog.Close className="rounded-sm p-2 opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/40">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>

            {/* Stage */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 md:px-16">
              <div className="relative h-full w-full">
                <Image
                  key={photos[index]}
                  src={photos[index]}
                  alt={`${rwNumber} — photo ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous photo"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-forest-900/40 p-2 text-cream-50 transition-colors hover:bg-forest-900/70 md:left-6 md:p-3"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next photo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-forest-900/40 p-2 text-cream-50 transition-colors hover:bg-forest-900/70 md:right-6 md:p-3"
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
