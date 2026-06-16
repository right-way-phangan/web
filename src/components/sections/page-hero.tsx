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
        <div className="relative isolate overflow-hidden rounded-sm bg-panel">
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-panel/92 via-panel/60 to-panel/30"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-panel/80 via-panel/35 to-transparent"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-[40vh] flex-col justify-end p-7 md:min-h-[46vh] md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-300">
              {eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-balance text-panel-fg">{title}</h1>
            {lede ? (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-panel-fg/85 md:text-xl">
                {lede}
              </p>
            ) : null}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="container-prose pt-16 md:pt-24 aura">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
        {eyebrow}
      </p>
      <h1 className="mt-4 max-w-3xl text-balance">{title}</h1>
      {lede ? (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-forest-500/75 md:text-xl">
          {lede}
        </p>
      ) : null}
    </header>
  );
}