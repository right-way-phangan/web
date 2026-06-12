"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveLead } from "@/lib/actions/move-lead";
import { LostReasonDialog } from "@/components/crm/lost-reason-dialog";

/** Quick close buttons on the lead card — mark the deal Won or Lost in one tap.
 * Losing asks for a reason first (loss analytics on the dashboard). */
export function LeadWonLost({
  leadId,
  status,
  contactName,
}: {
  leadId: number;
  status: string;
  contactName?: string | null;
}) {
  const [pending, start] = useTransition();
  const [askLost, setAskLost] = useState(false);
  const router = useRouter();

  function close(stageKey: "won" | "lost", lostReason?: string) {
    start(async () => {
      await moveLead(leadId, stageKey, lostReason);
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
        🏆 Победа
      </button>
      <button
        type="button"
        disabled={pending || status === "lost"}
        onClick={() => setAskLost(true)}
        className="flex-1 rounded-md bg-forest-900/5 px-3 py-1.5 text-sm font-medium text-forest-900/55 hover:bg-forest-900/10 disabled:opacity-40"
      >
        ✕ Потеряно
      </button>
      {askLost && (
        <LostReasonDialog
          contactName={contactName}
          onConfirm={(reason) => {
            setAskLost(false);
            close("lost", reason);
          }}
          onCancel={() => setAskLost(false)}
        />
      )}
    </div>
  );
}
