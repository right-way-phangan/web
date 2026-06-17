import type { RealEstateObject } from "@/types/object";
import { getObjectDict, type Locale } from "@/lib/i18n/dictionaries";
import { buildObjectDescription } from "@/lib/generate/object-description";

/**
 * «About this property» — описание листинга. Всегда собирается автоматически из
 * структурных полей (buildObjectDescription, EN+RU). Старые amoCRM-заметки в
 * `object.descriptionRaw` сознательно НЕ показываются (решение 2026-06-17 «авто
 * везде, заметки в архив») — поле остаётся в БД, но на листинг-страницу не идёт.
 * Кураторская копия проектов живёт отдельно на /projects/[slug] (там
 * descriptionRaw продолжает использоваться). Server-компонент.
 *
 * Deliberate override: `descriptionManualEn/Ru` (заданные в админке) перебивают
 * авто — это намеренная копия под конкретный объект, НЕ legacy-заметка.
 */
export function ObjectDescription({
  object,
  locale,
}: {
  object: RealEstateObject;
  locale: Locale;
}) {
  const t = getObjectDict(locale);
  const manual = (locale === "ru" ? object.descriptionManualRu : object.descriptionManualEn)?.trim();

  return (
    <section>
      <h2 className="font-serif text-3xl text-forest-900">{t.aboutProperty}</h2>

      {manual ? (
        <div className="dropcap mt-6 max-w-prose space-y-4 whitespace-pre-line text-base leading-relaxed text-forest-500/85">
          {manual}
        </div>
      ) : (
        <AutoBody object={object} locale={locale} />
      )}
    </section>
  );
}

function AutoBody({ object, locale }: { object: RealEstateObject; locale: Locale }) {
  const { lead, body, bullets } = buildObjectDescription(object, locale);
  return (
    <div className="mt-6 max-w-prose">
      <p className="text-lg leading-relaxed text-forest-900">{lead}</p>
      {body ? (
        <p className="mt-4 text-base leading-relaxed text-forest-500/85">{body}</p>
      ) : null}
      {bullets.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-forest-500/85">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
              {b}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
