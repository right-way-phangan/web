import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMatch } from "@/components/admin/admin-match";
import { getAllObjects } from "@/lib/data/objects";
import { deriveFilterOptions } from "@/lib/filters/listings";

export const metadata: Metadata = {
  title: "Подбор · Match",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /admin/match — админ-twin ИИ-подбора: агент заполняет профиль walk-in клиента,
 * получает ранжированные объекты (вкл. Hold) и заводит лид. Тот же движок, что
 * и на публичной /match.
 */
export default async function AdminMatchPage() {
  const objects = await getAllObjects();
  const { districts } = deriveFilterOptions(objects);

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="match" />
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · Подбор
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">
          ИИ-подбор под клиента
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-forest-900/60">
          Заполните, что ищет клиент — движок вернёт ранжированные объекты
          (включая придержанные) с причиной фита и даст завести лид с профилем в
          CRM.
        </p>
      </div>
      <AdminMatch districts={districts} />
    </section>
  );
}
