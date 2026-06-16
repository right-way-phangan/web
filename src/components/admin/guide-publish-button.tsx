"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishGuidePage, unpublishGuidePage } from "@/lib/actions/guide";

/**
 * Кнопка согласования страницы справочника: снимает черновик (или возвращает
 * обратно). Состояние хранится оверрайдом в app_settings — без правки .md и без
 * редеплоя. Показывается на странице-черновике после прочтения.
 */
export function GuidePublishButton({
  slug,
  published,
}: {
  slug: string;
  published: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState(false);

  function run(fn: () => Promise<boolean>) {
    setErr(false);
    start(async () => {
      const ok = await fn();
      if (ok) router.refresh();
      else setErr(true);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {published ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => unpublishGuidePage(slug))}
          className="rounded-lg border border-forest-500/30 px-3 py-1.5 text-xs font-medium text-forest-600 transition-colors hover:bg-forest-500/5 disabled:opacity-50"
        >
          {pending ? "…" : "Вернуть в черновик"}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => publishGuidePage(slug))}
          className="rounded-lg bg-forest-500 px-4 py-1.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-forest-400 disabled:opacity-50"
        >
          {pending ? "Публикую…" : "Опубликовать — снять черновик"}
        </button>
      )}
      {err && (
        <span className="text-xs text-red-600">
          Не получилось — бэкенд недоступен?
        </span>
      )}
    </div>
  );
}
