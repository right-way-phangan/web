"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { importLeadsAction, type ImportResult } from "@/lib/actions/import-leads";

/** CSV upload → bulk lead import with a result summary. */
export function ImportLeadsForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  function submit(formData: FormData) {
    setResult(null);
    start(async () => {
      setResult(await importLeadsAction(formData));
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <form action={submit} className="rounded-xl border border-forest-900/10 bg-cream-50/60 p-4">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm text-forest-900/70 file:mr-3 file:rounded-full file:border-0 file:bg-panel file:px-4 file:py-2 file:text-sm file:font-medium file:text-panel-fg hover:file:bg-panel/90"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-full bg-panel px-5 py-2 text-sm font-medium text-panel-fg hover:bg-panel/90 disabled:opacity-50"
        >
          {pending ? "Импортирую…" : "Импортировать"}
        </button>
      </form>

      {result && (
        <div
          className={
            "rounded-xl border p-4 text-sm " +
            (result.ok
              ? "border-emerald-500/30 bg-emerald-500/5 text-forest-900"
              : "border-red-500/30 bg-red-500/5 text-red-800")
          }
        >
          {result.ok ? (
            <>
              <p className="font-medium">
                ✅ Создано: {result.created} · дубли: {result.skippedDuplicates} · пропущено:{" "}
                {result.skippedInvalid}
              </p>
              {result.notes.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-forest-900/60">
                  {result.notes.map((n, i) => (
                    <li key={i}>· {n}</li>
                  ))}
                </ul>
              )}
              {result.created > 0 && (
                <Link
                  href={{ pathname: "/admin/crm" }}
                  className="mt-2 inline-block text-xs font-medium text-brass-600 underline"
                >
                  → К доске лидов
                </Link>
              )}
            </>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
