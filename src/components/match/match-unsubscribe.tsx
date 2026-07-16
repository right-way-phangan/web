"use client";

import { useState, useTransition } from "react";
import { BellOff } from "lucide-react";
import { unsubscribeMatchProfile } from "@/lib/actions/match-save";

/** Кнопка отписки от уведомлений на странице «Мои совпадения». */
export function MatchUnsubscribe({
  token,
  labels,
}: {
  token: string;
  labels: { unsub: string; done: string };
}) {
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) return <p className="text-sm text-forest-500/60">{labels.done}</p>;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await unsubscribeMatchProfile(token);
          if (res.ok) setDone(true);
        })
      }
      className="inline-flex items-center gap-1.5 text-sm text-forest-500/60 transition-colors hover:text-forest-900 disabled:opacity-50"
    >
      <BellOff className="h-4 w-4" />
      {labels.unsub}
    </button>
  );
}
