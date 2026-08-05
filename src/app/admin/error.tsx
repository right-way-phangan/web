"use client";

/**
 * Граница ошибки админки: раньше сбой раздела падал в глобальный error сайта
 * (публичная страница «что-то пошло не так» без пути назад в админку).
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-md text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900">Раздел не загрузился</h1>
        <p className="mt-2 text-sm text-forest-900/60">
          {error.digest ? `Код: ${error.digest}. ` : null}
          Обычно помогает повторить запрос; если ошибка повторяется — смотреть логи Vercel.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-panel px-5 py-2 text-sm font-medium text-panel-fg hover:bg-panel/90"
        >
          Повторить
        </button>
      </div>
    </section>
  );
}
