"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignLeadAction } from "@/lib/actions/users";

/** Admin-only: which agent works this lead (they then see it in their CRM). */
export function AssignAgentSelect({
  leadId,
  agents,
  currentId,
}: {
  leadId: number;
  agents: Array<{ id: number; label: string }>;
  currentId: number | null;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <select
      defaultValue={currentId ?? ""}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const res = await assignLeadAction(leadId, e.target.value ? Number(e.target.value) : null);
          if (!res.ok) alert(res.error);
          router.refresh();
        })
      }
      className="w-full rounded-md border border-forest-900/15 bg-cream-50 px-2 py-1 text-xs text-forest-900 outline-none focus:border-brass-500 disabled:opacity-50"
      aria-label="Assign agent"
    >
      <option value="">— не назначен</option>
      {agents.map((a) => (
        <option key={a.id} value={a.id}>
          {a.label}
        </option>
      ))}
    </select>
  );
}
