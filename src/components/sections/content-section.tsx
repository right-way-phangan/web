interface Props {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  /** Top padding override. Defaults to py-16 md:py-20 */
  spacing?: "tight" | "default" | "loose";
}

export function ContentSection({
  title,
  eyebrow,
  children,
  spacing = "default",
}: Props) {
  const padding =
    spacing === "tight"
      ? "py-10 md:py-12"
      : spacing === "loose"
        ? "py-20 md:py-28"
        : "py-16 md:py-20";

  return (
    <section className={`container-prose ${padding}`}>
      {eyebrow ? (
        <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-eyebrow text-brass-700">
          <span className="h-px w-10 bg-brass-600/60" aria-hidden />
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-5 max-w-3xl text-balance font-serif text-3xl text-forest-900 md:text-4xl">
          {title}
        </h2>
      ) : null}
      <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-forest-500/85 md:text-lg">
        {children}
      </div>
    </section>
  );
}
