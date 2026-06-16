"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { mergeContactsAction } from "@/lib/actions/triage-actions";

/** One-click merge: pours the duplicate into the primary and deletes it. */
export function MergeButton({ keepId, mergeId }: { keepId: number; mergeId: number }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState(false);
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await mergeContactsAction(keepId, mergeId);
          setError(!r.ok);
          router.refresh();
        })
      }
      className="rounded-full bg-panel px-3 py-1 text-xs font-medium text-panel-fg hover:bg-panel/90 disabled:opacity-40"
    >
      {pending ? "…" : error ? "ошибка ↻" : `слить в #${keepId}`}
    </button>
  );
}
