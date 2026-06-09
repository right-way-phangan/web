/** Developer team / accountability block ("role | name" rows). */
export function ProjectTeam({ members }: { members: Array<{ role: string; name: string }> }) {
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {members.map((m, i) => (
        <div key={i} className="border-l-2 border-brass-500/40 pl-4">
          <dt className="text-xs uppercase tracking-[0.15em] text-forest-500/55">{m.role}</dt>
          <dd className="mt-0.5 text-sm font-medium text-forest-900">{m.name || m.role}</dd>
        </div>
      ))}
    </dl>
  );
}
