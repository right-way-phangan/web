"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveLead } from "@/lib/actions/move-lead";

/** Quick close buttons on the lead card — mark the deal Won or Lost in one tap. */
export function LeadWonLost({ leadId, status }: { leadId: number; status: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function close(stageKey: "won" | "lost") {
    start(async () => {
      await moveLead(leadId, stageKey);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending || status === "won"}
        onClick={() => close("won")}
        className="flex-1 rounded-md bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-500/25 disabled:opacity-40"
      >
        🏆 Выиграно
      </button>
      <button
        type="button"
        disabled={pending || status === "lost"}
        onClick={() => close("lost")}
        className="flex-1 rounded-md bg-forest-900/5 px-3 py-1.5 text-sm font-medium text-forest-900/55 hover:bg-forest-900/10 disabled:opacity-40"
      >
        ✕ Потеряно
      </button>
    </div>
  );
}
