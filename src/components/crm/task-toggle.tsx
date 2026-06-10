"use client";

import { useTransition } from "react";
import { toggleTaskAction } from "@/lib/actions/lead-actions";

/** Checkbox that toggles a task done/undone via server action. */
export function TaskToggle({
  taskId,
  leadId,
  done,
}: {
  taskId: number;
  leadId: number;
  done: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <input
      type="checkbox"
      defaultChecked={done}
      disabled={pending}
      onChange={(e) => start(() => toggleTaskAction(taskId, leadId, e.target.checked))}
      className="h-4 w-4 shrink-0 cursor-pointer rounded border-forest-900/30 accent-brass-500 disabled:opacity-50"
      aria-label="Toggle task done"
    />
  );
}
