import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og";

// English card on purpose: the OG renderer (Satori) ships no Cyrillic-capable
// font, so a Russian card would render as missing glyphs. A branded English
// share card is the safe, image-present preview for /ru/tools/estimate.
export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Right Way Phangan — free property valuation";

export default function Image() {
  return renderOg({
    eyebrow: "Free valuation · Koh Phangan",
    title: "What's your property worth?",
    subtitle:
      "An honest, data-backed estimate for your land or villa — in a couple of minutes.",
  });
}
