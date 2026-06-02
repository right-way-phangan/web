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
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-3 max-w-3xl text-balance font-serif text-3xl text-forest-900 md:text-4xl">
          {title}
        </h2>
      ) : null}
      <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-forest-500/85 md:text-lg">
        {children}
      </div>
    </section>
  );
}
