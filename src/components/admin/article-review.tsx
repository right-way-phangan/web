"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Trash2, Eye } from "lucide-react";
import {
  approveArticle,
  rejectArticle,
  unpublishArticle,
  deleteArticle,
} from "@/lib/actions/article-actions";

type Status = "pending" | "published" | "rejected";

/** Review action bar on the article detail page — approve / return / unpublish / delete. */
export function ArticleReview({
  id,
  status,
  publicHref,
}: {
  id: number;
  status: Status;
  /** Public URL once published — shown as "open on site". */
  publicHref: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  function run(fn: () => Promise<void>) {
    start(async () => {
      await fn();
      setRejecting(false);
      setNote("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-forest-900/10 bg-white p-5">
      <div className="flex flex-wrap items-center gap-3">
        {status !== "published" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => approveArticle(id))}
            className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-forest-900/90 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {status === "rejected" ? "Опубликовать" : "Согласовать и опубликовать"}
          </button>
        ) : (
          <>
            <a
              href={publicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brass-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brass-500/90"
            >
              <Eye className="h-4 w-4" />
              Открыть на сайте
            </a>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => unpublishArticle(id))}
              className="inline-flex items-center gap-2 rounded-full bg-forest-900/5 px-4 py-2 text-sm font-medium text-forest-900/70 transition hover:bg-forest-900/10 disabled:opacity-50"
            >
              Снять с публикации
            </button>
          </>
        )}

        {status !== "rejected" && status !== "published" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setRejecting((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-forest-900/5 px-4 py-2 text-sm font-medium text-forest-900/70 transition hover:bg-forest-900/10 disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            На доработку
          </button>
        ) : null}

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("Удалить статью безвозвратно?")) run(() => deleteArticle(id));
          }}
          className="ml-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-red-700/80 transition hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Удалить
        </button>
      </div>

      {rejecting ? (
        <div className="mt-4 border-t border-forest-900/10 pt-4">
          <label className="text-sm font-medium text-forest-900/80">
            Что поправить? (комментарий вернётся в работу)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Например: уточнить про leasehold, убрать абзац про цены…"
            className="mt-2 w-full rounded-lg border border-forest-900/15 bg-cream-50 p-3 text-sm text-forest-900 outline-none focus:border-brass-500"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => rejectArticle(id, note))}
              className="rounded-full bg-forest-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-forest-900/90 disabled:opacity-50"
            >
              Вернуть на доработку
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="rounded-full px-4 py-2 text-sm font-medium text-forest-900/60 hover:bg-forest-900/5"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : null}

      {pending ? <p className="mt-3 text-xs text-forest-900/50">Сохраняю…</p> : null}
    </div>
  );
}
