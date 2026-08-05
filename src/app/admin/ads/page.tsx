import type { Metadata } from "next";
import { AdsGenerator, type AdsObjectOption } from "@/components/admin/ads-generator";
import { getAllObjects } from "@/lib/data/objects";

export const metadata: Metadata = {
  title: "Реклама",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Генератор рекламных офферов — Фаза 1 маркетингового агента (playbook §4.1).
 *
 * Пока нет Marketing API (упирается в Business verification → юрлицо), кампании
 * собираются руками в Ads Manager. Здесь закрывается то, что действительно
 * съедает время: тексты EN+RU по фактам карточки, ссылка с UTM и файл под
 * bulk-импорт. Ничего не публикуется — страница только готовит материал.
 */
export default async function AdminAdsPage() {
  const all = await getAllObjects();

  // Рекламировать можно только то, что реально открыто на сайте: Active и с фото
  // (безфотные скрыты гейтом каталога, объявление вело бы в пустоту).
  const options: AdsObjectOption[] = all
    .filter((o) => o.status === "Active" && Boolean(o.coverImage))
    .sort((a, b) => a.rwNumber.localeCompare(b.rwNumber))
    .map((o) => ({
      rwNumber: o.rwNumber,
      title: o.titleEn,
      type: o.type,
      district: o.district ?? "—",
      leasehold: (o.tenure ?? []).includes("Leasehold"),
    }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · Маркетинг
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-forest-900 dark:text-cream-100">
          Генератор офферов
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-forest-700/70 dark:text-cream-100/60">
          Тексты объявлений по фактам карточки — сразу парой EN+RU, с готовой ссылкой и UTM.
          Без цен и ценового сегмента, leasehold — как долгосрочная регистрируемая аренда.
          Проверь глазами и забирай в Ads Manager: копированием или файлом CSV.
        </p>
      </div>

      <AdsGenerator options={options} />
    </main>
  );
}
