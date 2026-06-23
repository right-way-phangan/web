import Image from "next/image";

interface Props {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Optional background photo (path under /public). When set, renders a photo banner. */
  image?: string;
  /** Alt text for the background photo. */
  imageAlt?: string;
}

export function PageHero({ eyebrow, title, lede, image, imageAlt }: Props) {
  if (image) {
    return (
      <header className="container-prose pt-6 md:pt-8">
        <div className="relative isolate overflow-hidden rounded-bezel bg-forest-900">
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-forest-900/92 via-forest-900/60 to-forest-900/30"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-forest-900/80 via-forest-900/35 to-transparent"
            aria-hidden
          />
          {/* Warm horizon glow — ties the amber accent into the dark teal banner */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_15%_120%,rgba(217,138,30,0.18),transparent_60%)]"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-[40vh] flex-col justify-end p-7 md:min-h-[46vh] md:p-12">
            <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-eyebrow text-brass-300">
              <span className="h-px w-10 bg-brass-300/70" aria-hidden />
              {eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-balance text-cream-50">{title}</h1>
            {lede ? (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-cream-100/85 md:text-xl">
                {lede}
              </p>
            ) : null}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="container-prose pt-16 md:pt-24">
      <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-eyebrow text-brass-700">
        <span className="h-px w-10 bg-brass-600/60" aria-hidden />
        {eyebrow}
      </p>
      <h1 className="mt-5 max-w-3xl text-balance">{title}</h1>
      {lede ? (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-forest-500/75 md:text-xl">
          {lede}
        </p>
      ) : null}
    </header>
  );
}