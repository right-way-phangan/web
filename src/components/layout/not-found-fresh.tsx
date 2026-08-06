"use client";

import { ObjectCard } from "@/components/objects/object-card";
import { useNotFoundCopy } from "@/components/layout/not-found-content";
import type { RealEstateObject } from "@/types/object";

/**
 * Подборка живых объектов под 404. Отделена от NotFoundContent, чтобы заголовок
 * ехал вместе с данными: под Suspense пустой заголовок без карточек выглядел бы
 * как ещё одна поломка. Клиентский — берёт локаль из того же URL-хука.
 */
export function NotFoundFresh({ fresh }: { fresh: RealEstateObject[] }) {
  const { t } = useNotFoundCopy();

  return (
    <div className="mt-16">
      <h2 className="font-serif text-2xl text-forest-900 md:text-3xl">{t.fresh}</h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {fresh.map((o) => (
          <ObjectCard key={o.id} object={o} />
        ))}
      </div>
    </div>
  );
}
