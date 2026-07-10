"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveLeadPipeline } from "@/lib/actions/move-pipeline";

/** Pipeline selector on a lead card — changing it moves the lead to another
 * pipeline (server action), then refreshes so the stage list, SLA and next
 * step re-seed from the new pipeline. */
export function MovePipelineSelect({
  leadId,
  pipelines,
  currentPipelineKey,
}: {
  leadId: number;
  pipelines: Array<{ key: string; name: string }>;
  currentPipelineKey?: string | null;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <select
      defaultValue={currentPipelineKey ?? ""}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await moveLeadPipeline(leadId, e.target.value);
          router.refresh();
        })
      }
      className="w-full rounded-md border border-forest-900/15 bg-cream-50 px-2 py-1 text-xs text-forest-900 outline-none focus:border-brass-500 disabled:opacity-50"
      aria-label="Move to pipeline"
    >
      {pipelines.map((p) => (
        <option key={p.key} value={p.key}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
