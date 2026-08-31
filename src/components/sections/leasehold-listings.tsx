import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectCard } from "@/components/objects/object-card";
import { Appear } from "@/components/motion/appear";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { normalizeTenure } from "@/lib/utils/tenure";
import { offersLeasehold } from "@/lib/filters/listings";
import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Live leasehold inventory on the /leasehold explainer — every published object
 * that offers a leasehold option (tenure includes "Leasehold", incl. Freehold-or-
 * leasehold deals) rendered as server-side ObjectCards, so the pieces are both
 * crawlable from the dedicated leasehold page (SEO) and one click away for buyers.
 * normalizeTenure() catches raw DB labels ("Leasehold 30 years", "Mixed / N.A.").
 * Renders nothing when nothing qualifies, so the page degrades cleanly.
 * Rule: any object with a leasehold option must surface here + in the /listings
 * ?tenure=Leasehold filter (memory feedback_leasehold_everywhere).
 */
const COPY = {
  en: {
    heading: "Available now on leasehold",
    lede: "These homes can be held on a registered long lease — the building in your name, the land leased, no nominee, no Thai shell company.",
    all: "See all leasehold listings",
  },
  ru: {
    heading: "Доступно в лизинг",
    lede: "Эти объекты можно оформить в долгосрочный лизинг — строение на вас, земля в аренде, без номиналов и тайской компании-прокладки.",
    all: "Все объекты в лизинге",
  },
} as const;

export async function LeaseholdListings({ locale = "en" }: { locale?: Locale }) {
  const all = await getPublicObjects();
  const leasehold = all
    .filter((o) => offersLeasehold({ ...o, tenure: normalizeTenure(o.tenure) }))
    .map(slimObjectForCard);
  if (leasehold.length === 0) return null;

  const t = COPY[locale === "ru" ? "ru" : "en"];
  const base = locale === "ru" ? "/ru" : "";
  const allHref = `${base}/listings?tenure=Leasehold` as Route;

  return (
    <div className="mt-16 md:mt-20">
      <h2 className="font-serif text-3xl text-forest-900">{t.heading}</h2>
      <p className="mt-4 max-w-prose text-base leading-relaxed text-forest-500/75">{t.lede}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {leasehold.map((object, i) => (
          <Appear key={object.id} delay={(i % 3) * 0.08} className="h-full">
            <ObjectCard object={object} />
          </Appear>
        ))}
      </div>

      <div className="mt-8">
        <Button asChild variant="outline" size="md">
          <Link href={allHref}>
            {t.all}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
