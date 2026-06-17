import type { RealEstateObject } from "@/types/object";
import { getObjectDict, type Locale } from "@/lib/i18n/dictionaries";
import { buildObjectDescription } from "@/lib/generate/object-description";

/**
 * «About this property» — описание объекта. По умолчанию собирается
 * автоматически из структурных полей (buildObjectDescription, EN+RU). Ручной
 * текст `descriptionRaw` (если заполнен в админке) перебивает авто — это
 * «override-lock». Server-компонент.
 */
export function ObjectDescription({
  object,
  locale,
}: {
  object: RealEstateObject;
  locale: Locale;
}) {
  const t = getObjectDict(locale);
  const manual = object.descriptionRaw?.trim();

  return (
    <section>
      <h2 className="font-serif text-3xl text-forest-900">{t.aboutProperty}</h2>

      {manual ? (
        <div className="dropcap mt-6 max-w-prose space-y-4 whitespace-pre-line text-base leading-relaxed text-forest-500/85">
          {manual}
        </div>
      ) : (
        <GeneratedBody object={object} locale={locale} />
      )}
    </section>
  );
}

function GeneratedBody({ object, locale }: { object: RealEstateObject; locale: Locale }) {
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
