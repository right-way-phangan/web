import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { ZoneChecker } from "@/components/tools/zone-checker";

export const metadata: Metadata = {
  title: "Зоны застройки · RW",
  robots: { index: false, follow: false },
};

// City-plan tile lookups hit the network; keep the page itself dynamic.
export const dynamic = "force-dynamic";

/**
 * «Зоны застройки» — вставь локацию (координаты / ссылку Google Maps) или
 * кликни точку на карте → получи индикативные правила застройки по цвету
 * городского плана (ผังเมือง). Обёртка над server action lookupZoneRules; своих
 * данных нет. Всегда индикативно — точные цифры в Transaction DD.
 */
export default function AdminZoningPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <AdminNav active="zoning" />

      <header className="mt-6">
        <h1 className="font-serif text-3xl text-forest-900">Зоны застройки</h1>
        <p className="mt-2 max-w-prose text-base leading-relaxed text-forest-500/75">
          Вставьте координаты или ссылку Google Maps — либо кликните участок на карте. Инструмент читает
          цвет городского плана Таиланда (ผังเมือง) в точке и выдаёт индикативные правила: разрешённое
          использование, типовую застройку и что проверить до стройки. Точные высота, отступы и пятно
          застройки подтверждаются в Transaction DD.
        </p>
      </header>

      <div className="mt-6">
        <ZoneChecker locale="ru" />
      </div>
    </div>
  );
}
