import Image from "next/image";
import { SectionEyebrow } from "./section-eyebrow";

interface Props {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Optional right-column content (plain variant, lg+ only) — fills the empty half. */
  aside?: React.ReactNode;
  /** Optional background photo (path under /public). When set, renders a photo banner. */
  image?: string;
  /** Alt text for the background photo. */
  imageAlt?: string;
}

export function PageHero({ eyebrow, title, lede, image, imageAlt, aside }: Props) {
  if (image) {
    return (
      <header className="container-prose pt-6 md:pt-8">
        <div className="relative isolate overflow-hidden rounded-bezel bg-panel">
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
          {/* Warm horizon glow — ties the amber accent into the dark teal banner */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_15%_120%,rgba(217,138,30,0.18),transparent_60%)]"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-[40vh] flex-col justify-end p-7 md:min-h-[46vh] md:p-12">
            <SectionEyebrow tone="dark">{eyebrow}</SectionEyebrow>
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
    <header className="container-prose relative isolate pt-16 md:pt-24">
      {/* Тихий teal-перелив за заголовком — общий приём внутренних страниц,
          парный к янтарному glow фото-варианта выше. */}
      <div
        className="pointer-events-none absolute -inset-x-12 -top-8 bottom-0 -z-10 bg-[radial-gradient(55%_100%_at_10%_0%,rgba(21,168,168,0.08),transparent_65%)]"
        aria-hidden
      />
      <div className={aside ? "grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]" : undefined}>
        <div>
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
          <h1 className="mt-5 max-w-3xl text-balance">{title}</h1>
          {lede ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-forest-500/75 md:text-xl">
              {lede}
            </p>
          ) : null}
        </div>
        {aside ? <div className="hidden lg:block">{aside}</div> : null}
      </div>
    </header>
  );
}