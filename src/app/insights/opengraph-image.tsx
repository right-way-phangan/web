import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";
import { getRentalMarket } from "@/lib/data/rental-market";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — rental market insights";

export default function Image() {
  const m = getRentalMarket();
  const top = m.districts[0]?.name;
  const subtitle = top
    ? `Nightly rates by district · top market: ${top} · ${m.meta.sample} listings analysed`
    : "Nightly rates by district, what drives price, and what to build for rental.";

  return renderOg({
    eyebrow: "Market insights · Koh Phangan",
    title: "What to build for rental — the data.",
    subtitle,
  });
}
