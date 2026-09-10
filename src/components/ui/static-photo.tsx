import { cn } from "@/lib/utils/cn";

/**
 * Статичное фото из /public с готовыми WebP-вариантами (scripts/static-webp.mjs).
 *
 * next/image тут бесполезен: при `images.unoptimized` (квота Hobby) он отдаёт
 * исходный JPEG без srcset, и телефон грузит 1600px-кадр на 375px экран —
 * Lighthouse ставил 0 за uses-responsive-images и modern-image-formats.
 * Варианты лежат рядом с оригиналом, JPEG остаётся fallback-`src`.
 * Заполняет родителя как `fill` у next/image — родитель должен быть `relative`.
 */
export const PHOTO_VARIANTS = [
  ["-sm", 640],
  ["-md", 1280],
] as const;
export const HERO_VARIANTS = [
  ["-sm", 960],
  ["-lg", 1800],
] as const;

type Variant = readonly [suffix: string, width: number];

export function StaticPhoto({
  src,
  alt,
  sizes,
  priority = false,
  className,
  variants = PHOTO_VARIANTS,
  onError,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  variants?: readonly Variant[];
  /** Только из клиентских компонентов (слайдшоу hero прячет битую сцену). */
  onError?: () => void;
}) {
  const base = src.replace(/\.[a-z]+$/i, "");
  const srcSet = variants.map(([suffix, width]) => `${base}${suffix}.webp ${width}w`).join(", ");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статика с готовыми вариантами, см. docblock
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      aria-hidden={alt === "" ? true : undefined}
      onError={onError}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
