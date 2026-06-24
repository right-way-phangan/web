import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { PhotoAudit } from "@/components/admin/photo-audit";

export const metadata: Metadata = {
  title: "Проверка фото",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /admin/photo-audit — система контроля утечек: повторный аудит уже
 * опубликованных фото объектов на скрытые внутренние документы (чаноты, прайсы,
 * скрины LandsMaps/застройщика). Первый рубеж — гейт интейка (фото-документы
 * не публикуются при заведении объекта); здесь — второй проход vision-сканером
 * по живому каталогу. Ответственный отдел — Гефест (сисадмин / безопасность).
 */
export default function AdminPhotoAuditPage() {
  return (
    <main className="px-4 py-8 md:px-8">
      <AdminNav active="photo-audit" />
      <h1 className="text-2xl font-semibold text-forest-900">Проверка фото на документы</h1>
      <p className="mt-3 max-w-2xl text-sm text-forest-900/70">
        Система контроля утечек. Ответственный отдел — <strong>Гефест</strong> (сисадмин /
        безопасность). При заведении объекта фото-документы отклоняются автоматически (гейт
        интейка). Здесь — повторный аудит уже опубликованных фото: vision-сканер ищет чаноты,
        прайсы застройщика, расчётные листы и скрины LandsMaps, которые могли просочиться в
        публичную галерею.
      </p>
      <div className="mt-6">
        <PhotoAudit />
      </div>
    </main>
  );
}
