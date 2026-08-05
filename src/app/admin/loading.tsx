/**
 * Скелет между разделами админки: все страницы force-dynamic, без него каждый
 * переход — белый экран до конца серверного рендера.
 */
export default function AdminLoading() {
  return (
    <section className="px-4 py-8 md:px-8" aria-busy="true" aria-label="Загрузка раздела">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded-lg bg-forest-900/10" />
        <div className="h-4 w-96 max-w-full rounded bg-forest-900/5" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-28 rounded-xl bg-forest-900/5" />
          <div className="h-28 rounded-xl bg-forest-900/5" />
          <div className="h-28 rounded-xl bg-forest-900/5" />
        </div>
        <div className="h-72 rounded-xl bg-forest-900/5" />
      </div>
    </section>
  );
}
