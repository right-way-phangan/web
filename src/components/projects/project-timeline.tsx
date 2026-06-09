/** Vertical construction timeline ("date | event" rows). */
export function ProjectTimeline({ items }: { items: Array<{ date: string; event: string }> }) {
  return (
    <ol className="relative ml-2 space-y-6 border-l border-forest-500/15 pl-6">
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[1.69rem] top-1 h-3 w-3 rounded-full border-2 border-cream-100 bg-brass-500" />
          {it.date ? (
            <div className="text-xs font-medium uppercase tracking-[0.15em] text-brass-500">
              {it.date}
            </div>
          ) : null}
          <div className="mt-0.5 text-sm text-forest-500/85">{it.event || it.date}</div>
        </li>
      ))}
    </ol>
  );
}
