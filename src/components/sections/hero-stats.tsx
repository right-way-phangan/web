import { getPublicObjects } from "@/lib/data/objects";
import { getHomeDict, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Thin proof strip under the hero: live counts from the catalog plus our
 * reply-time promise. Counts only — no prices and no segment narrowing
 * (see the public-copy rule). Renders nothing if the catalog is unreachable.
 */
export async function HeroStats({ locale }: { locale: Locale }) {
  const t = getHomeDict(locale).stats;

  let listings = 0;
  let districts = 0;
  try {
    const objects = await getPublicObjects();
    listings = objects.length;
    districts = new Set(objects.map((o) => o.district).filter(Boolean)).size;
  } catch {
    return null;
  }
  if (listings === 0) return null;

  const stats: Array<{ value: string; label: string }> = [
    { value: String(listings), label: t.listings },
    { value: String(districts), label: t.districts },
    { value: t.replyValue, label: t.reply },
  ];

  return (
    <div className="border-b border-forest-500/10 bg-cream-50">
      <div className="container-prose flex flex-wrap items-start justify-center gap-x-14 gap-y-4 py-6 md:py-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="num text-2xl text-forest-900 md:text-3xl">{s.value}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-forest-500/70">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
