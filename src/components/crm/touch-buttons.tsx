"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { touchLeadAction } from "@/lib/actions/triage-actions";

const KINDS = [
  { kind: "call", label: "📞 Позвонил" },
  { kind: "message", label: "💬 Написал" },
  { kind: "meet", label: "🤝 Встретился" },
] as const;

/** One-tap touch log — records a real contact moment into the timeline and
 * resets the staleness clock («остывающие» считаются от касания). */
export function TouchButtons({
  leadId,
  lastTouchAt,
}: {
  leadId: number;
  lastTouchAt?: string | null;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const days = lastTouchAt
    ? Math.floor((Date.now() - new Date(lastTouchAt).getTime()) / 86_400_000)
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {KINDS.map(({ kind, label }) => (
        <button
          key={kind}
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await touchLeadAction(leadId, kind);
              router.refresh();
            })
          }
          className="rounded-full bg-forest-900/5 px-3 py-1.5 text-sm font-medium text-forest-900/70 hover:bg-forest-900/10 disabled:opacity-40"
        >
          {label}
        </button>
      ))}
      <span className="text-xs text-forest-900/45">
        {days == null
          ? "касаний ещё не было"
          : days === 0
            ? "касание сегодня"
            : `последнее касание ${days} дн назад`}
      </span>
    </div>
  );
}
