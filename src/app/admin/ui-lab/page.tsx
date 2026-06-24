"use client";

import type { RealEstateObject } from "@/types/object";
import { MagicCard } from "@/components/ui/magic-card";
import { ObjectCardMagic } from "@/components/objects/object-card-magic";

/**
 * /admin/ui-lab — витрина UI-примитивов для предпросмотра перед интеграцией.
 * Не в навигации и не в реестре admin-sections (это dev-инструмент, не
 * продуктовый раздел) — открывать по прямому URL. Auth наследуется от
 * admin/layout. Сейчас тут демо brand-адаптированного MagicCard (21st.dev).
 */

// Общая база обязательных полей RealEstateObject (view-флаги и пр.).
const base = {
  status: "Active",
  seaView: false,
  beachfront: false,
  mountainView: false,
  jungleView: false,
  flatLand: false,
  quiet: false,
  electricity: false,
} satisfies Partial<RealEstateObject>;

const SAMPLES: RealEstateObject[] = [
  {
    ...base,
    id: 1,
    rwNumber: "RW-V0007",
    type: "Villa",
    titleEn: "Sea-View Pool Villa · Haad Salad Ridge",
    district: "Haad Salad",
    priceThb: 18_500_000,
    areaRai: 0.75,
    documentType: "Chanote",
    seaView: true,
  },
  {
    ...base,
    id: 2,
    rwNumber: "RW-L0042",
    type: "Land",
    titleEn: "Elevated Leasehold Plot · Chaloklum Bay",
    district: "Chaloklum",
    pricePerRai: 4_200_000,
    areaRai: 2.5,
    documentType: "NS3K",
  },
  {
    ...base,
    id: 3,
    rwNumber: "RW-P0001",
    type: "Project",
    titleEn: "Atmos Residences · Off-plan Units",
    district: "Sri Thanu",
    priceThb: 9_900_000,
    documentType: "Chanote",
  },
];

export default function UiLabPage() {
  return (
    <div className="mx-auto max-w-container px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-forest-900">UI Lab</h1>
        <p className="mt-2 max-w-prose text-sm text-forest-500/80">
          Предпросмотр UI-примитивов перед интеграцией. Наведите курсор на
          карточку — brass-подсветка рамки следует за указателем (MagicCard,
          адаптировано из 21st.dev). Переключите тему ☀️/🌙 — цвета берутся из
          палитры и инвертируются сами.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-forest-500/70">
          MagicCard · карточка объекта
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLES.map((o) => (
            <div key={o.id} className="h-56">
              <ObjectCardMagic object={o} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-forest-500/70">
          MagicCard · пустой примитив
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <MagicCard className="h-40">
            <div className="flex h-full items-center justify-center p-6 text-center font-serif text-lg text-forest-900">
              Наведите курсор
            </div>
          </MagicCard>
          <MagicCard
            className="h-40"
            gradientSize={160}
            gradientColor="rgb(var(--c-forest-500) / 0.08)"
          >
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-forest-500/80">
              forest-заливка, узкое пятно
            </div>
          </MagicCard>
          <MagicCard className="h-40" gradientOpacity={0}>
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-forest-500/80">
              только рамка-spotlight
            </div>
          </MagicCard>
        </div>
      </section>
    </div>
  );
}
