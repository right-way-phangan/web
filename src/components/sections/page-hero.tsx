interface Props {
  eyebrow: string;
  title: string;
  lede?: string;
}

export function PageHero({ eyebrow, title, lede }: Props) {
  return (
    <header className="container-prose pt-16 md:pt-24">
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
