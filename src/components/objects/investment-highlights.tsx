import type { RealEstateObject } from "@/types/object";

interface Highlight {
  title: string;
  text: string;
}

/**
 * Auto-generate 2-5 investment highlights from object fields.
 * No prices, no exaggeration — facts that genuinely affect value.
 */
function deriveHighlights(o: RealEstateObject): Highlight[] {
  const out: Highlight[] = [];

  if (o.beachfront) {
    out.push({
      title: "Beachfront access",
      text: "Direct frontage to the sea — a rare and quickly disappearing category on Phangan.",
    });
  } else if (o.seaView) {
    out.push({
      title: "Sea view",
      text: "Unobstructed view of the Gulf — a durable premium driver on resale.",
    });
  }

  if (o.documentType === "Chanote") {
    out.push({
      title: "Chanote title",
      text: "The strongest form of land title in Thailand. Boundaries are GPS-surveyed and registered with the Land Department.",
    });
  } else if (o.documentType === "NS3K") {
    out.push({
      title: "NS3K title",
      text: "Confirmed ownership with surveyed boundaries — upgradeable to Chanote in many cases.",
    });
  }

  if (o.areaRai && o.areaRai >= 3) {
    out.push({
      title: `${o.areaRai.toLocaleString(undefined, { maximumFractionDigits: 1 })}-rai plot`,
      text: "Enough land for a multi-building project, a private villa with full grounds, or sub-division upside.",
    });
  }

  if (o.tenure?.includes("Freehold")) {
    out.push({
      title: "Freehold-eligible",
      text: "Available for direct ownership via Thai company or transfer to qualifying buyers — clean exit path.",
    });
  }

  if (o.condition === "New") {
    out.push({
      title: "Move-in ready",
      text: "Recently completed — no renovation, no permits, no waiting.",
    });
  }

  if (o.altitude !== undefined && o.altitude >= 80) {
    out.push({
      title: `Elevation ${o.altitude} m`,
      text: "High enough for cooler nights, year-round breeze, and panoramic sightlines.",
    });
  }

  if (o.quiet && out.length < 5) {
    out.push({
      title: "Quiet location",
      text: "Away from nightlife and through-traffic — the kind of plot people buy for retirement or family.",
    });
  }

  return out.slice(0, 5);
}

export function InvestmentHighlights({ object }: { object: RealEstateObject }) {
  const items = deriveHighlights(object);
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="font-serif text-3xl text-forest-900">Why this one</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-sm border border-forest-500/10 bg-cream-50 p-6"
          >
            <h3 className="font-serif text-xl text-forest-900">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-forest-500/75">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
