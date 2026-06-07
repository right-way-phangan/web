/**
 * Content for /districts. Adapted from `Right Way — Districts (контент сайта).md`.
 * Per public-copy-no-prices rule, original 'What's available now' price/inventory
 * blocks are intentionally omitted. The 'See listings' CTA on each page does
 * the inventory-revelation lazily, via the live catalog filter.
 *
 * amoName must match the DISTRICT field value in amoCRM exactly, since it's
 * passed to /listings?district=... and filtered server-side.
 */

export interface DistrictContent {
  slug: string;
  amoName: string;
  title: string;
  short: string;
  paragraphs: string[];
  audience: string;
  expect: string[];
}

export const DISTRICTS: DistrictContent[] = [
  {
    slug: "sri-thanu",
    amoName: "Sri Thanu",
    title: "Sri Thanu — wellness district, west coast",
    short:
      "The spiritual and wellness centre of the island — yoga studios, meditation, long-established expat community.",
    paragraphs: [
      "Sri Thanu is the spiritual and wellness centre of Koh Phangan. Yoga studios, meditation centres, raw food cafes, and a long-established community of expat practitioners give the area its character.",
      "Property here attracts people who want quiet, presence, and community — not nightlife or tourism. The land market has matured into two distinct sub-markets: inland plots away from the beach, and plots within walking distance of Sri Thanu beach or close to the established retreat centres.",
    ],
    audience:
      "Long-term residents, yoga teachers, wellness business owners, families seeking a quiet lifestyle. Typically 35–55 years old, often relocators from Europe, North America, or Russia.",
    expect: [
      "Mostly flat to gentle terrain",
      "All utilities available — electricity, water",
      "Good road access on paved country roads",
      "Phangan Zone 2 regulations — max 6 m building height",
      "15 min drive to Thong Sala, 7 min to Sri Thanu pier",
    ],
  },
  {
    slug: "haad-salad",
    amoName: "Haad Salad",
    title: "Haad Salad — quiet northern beach",
    short:
      "Small bay on the north-western coast — one of the most undeveloped quality beaches still accessible by paved road.",
    paragraphs: [
      "Haad Salad is a small bay on the north-western coast — one of the most undeveloped quality beaches still accessible by paved road. The community is small, residential, and not tourist-oriented.",
      "Property turnover is low: plots that come on the market are often held by the same family for 15–20 years before sale. This is a niche district with limited inventory but high quality — if a Haad Salad plot is available and matches your criteria, it's worth considering quickly.",
    ],
    audience:
      "People who want a beach within walking distance, low neighbour density, and don't need amenities at the doorstep. Often a second-home buyer or someone choosing for permanent residence after living elsewhere on Phangan.",
    expect: [
      "Mostly gentle to moderate slope (5–15°)",
      "Limited new construction — preservation rules in effect",
      "Drive to Thong Sala: 25–30 minutes",
      "One restaurant, no shops — supplies come from Sri Thanu (10 min by scooter)",
    ],
  },
  {
    slug: "madeau-wan",
    amoName: "Madeau Wan",
    title: "Madeau Wan — quiet inland, west-of-centre",
    short:
      "Established residential district away from beaches — villas in jungle settings, no through-traffic, no tourists.",
    paragraphs: [
      "Madeau Wan is one of the most popular districts in our portfolio — and one of the least known to first-time visitors. Located west of the island centre, away from beaches, it's where established residents have been building villas in jungle settings for the past 10–15 years.",
      "The terrain is gentle hill, with mature vegetation. No through-traffic, no parties, no tourists. The trade-off: you're 7–10 minutes drive from any beach.",
    ],
    audience:
      "Architects, design-conscious families, established residents looking for a permanent home (not a beach holiday). Often clients who lived in Sri Thanu first, then moved to Madeau Wan for more space and privacy.",
    expect: [
      "Gentle to moderate hill terrain",
      "Mature jungle landscape preserved",
      "Excellent road infrastructure (Tessaban-maintained roads)",
      "Phangan Zone 2 — strict residential rules apply",
      "Designer villas a common pattern",
    ],
  },
  {
    slug: "ban-tai",
    amoName: "Ban Tai",
    title: "Ban Tai — south coast, accessible",
    short:
      "The most accessible district — 5 min from Thong Sala, 8 min from the pier. Heterogeneous market from inland to beachfront.",
    paragraphs: [
      "Ban Tai is the most accessible district on Koh Phangan — 5 minutes from Thong Sala (the main town) and 8 minutes from the pier where boats arrive. The Ban Tai stretch has a long beach popular with the local Thai community and longer-stay expats. It's not a party-zone, but it's not isolated either.",
      "The land market in Ban Tai is the most heterogeneous on the island. The same district contains both inland positions and premium beachfront — the spread reflects entirely on location within the district.",
    ],
    audience:
      "Two distinct buyer types. First: practical buyers who want easy access to amenities and the pier (for travel). Second: premium beachfront buyers who want a one-of-a-kind position. Few in between.",
    expect: [
      "Mostly flat terrain",
      "Excellent infrastructure",
      "Highest road traffic of all our districts (this is the main route)",
      "8 min walk to Ban Tai beach (inland plots) or direct beachfront",
      "Easiest district for first-time Phangan buyers",
    ],
  },
  {
    slug: "chaloklum",
    amoName: "Chaloklum",
    title: "Chaloklum — north coast, fishing village",
    short:
      "Working fishing village on the north coast — diving, seafood, a small but stable residential community.",
    paragraphs: [
      "Chaloklum sits on the northern coast of Koh Phangan, around the calm waters of Chaloklum Bay. It's a working fishing village with a growing residential community. Diving is the main local industry, plus seafood, plus a small but stable retreat scene.",
      "The character here is different from the western coast — less yoga, more fishermen and ocean people. The bay is one of the only swimmable spots on the north coast, and it's home to several long-running restaurants directly on the water.",
    ],
    audience:
      "Divers, fishermen, people who want connection with the working community of the island. Long-term residents, not weekend buyers. Often second-time Phangan purchasers who tried the west coast first.",
    expect: [
      "Mostly flat terrain near the coast, hills inland",
      "All utilities available in the village area",
      "35–40 min drive to Thong Sala",
      "Slower pace, more authentic Thai daily life",
      "Some plots have direct beach access",
    ],
  },
  {
    slug: "haad-yao",
    amoName: "Haad Yao",
    title: "Haad Yao — west coast, tourist-residential mix",
    short:
      "One of the longest west-coast beaches — tourist infrastructure plus a residential community in the surrounding hills.",
    paragraphs: [
      "Haad Yao is one of the longest and most popular beaches on the west coast — \"haad yao\" literally means \"long beach\". It combines tourist infrastructure (a couple of restaurants, dive shops, a few boutique resorts) with a residential community in the surrounding hills.",
      "The character is more casual than Sri Thanu, more accessible than Haad Salad, less developed than Ban Tai — a good middle-ground district for someone who wants the beach experience without being in the heart of tourism.",
    ],
    audience:
      "People who want beach proximity but not isolation, who appreciate having a few cafes within walking distance, and who don't need a yoga-community lifestyle. Often families with children (school proximity is good) or couples in their 40s–50s.",
    expect: [
      "Mix of flat and hill terrain",
      "Strong utilities and infrastructure",
      "15–20 min drive to Thong Sala",
      "Walking distance to beach from most plots",
      "Some construction activity — boutique villa developments",
    ],
  },
  {
    slug: "ban-khai",
    amoName: "Ban Khai",
    title: "Ban Khai — south-east, beachfront residential",
    short:
      "Emerging residential alternative to the popular west coast — wide sandy beach, quieter atmosphere, family-friendly.",
    paragraphs: [
      "Ban Khai sits east of Ban Tai on the southern coast. It's quieter than Ban Tai, less touristy than Haad Rin, and has been emerging in the past 3–4 years as a residential alternative to the more popular west coast areas.",
      "The beach itself is wide, sandy, and shallow — popular for swimming with children. This is a smaller market with less inventory but with a clear value proposition: beach access without the west-coast positioning.",
    ],
    audience:
      "Families with children (the beach is the safest swimming on the island), people who want value at the cost of being further from Thong Sala. Older buyers (50+) appreciating the quiet south-eastern atmosphere.",
    expect: [
      "Flat terrain",
      "All utilities",
      "20–25 min drive to Thong Sala",
      "Beach within 5–10 min walk from most plots",
      "Less established community than west coast — quieter trade-off",
    ],
  },
];

export function getDistrictBySlug(slug: string): DistrictContent | undefined {
  return DISTRICTS.find((d) => d.slug === slug);
}

/**
 * Approximate centre coordinates per district — fallback for the islands map
 * when the live catalog has no mapped objects in that district yet. When the
 * catalog does have pins, their centroid is used instead (more accurate).
 */
export const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  "sri-thanu": { lat: 9.745, lng: 99.978 },
  "haad-salad": { lat: 9.788, lng: 99.985 },
  "madeau-wan": { lat: 9.78, lng: 99.97 },
  "ban-tai": { lat: 9.702, lng: 100.028 },
  chaloklum: { lat: 9.808, lng: 100.012 },
  "haad-yao": { lat: 9.766, lng: 99.972 },
  "ban-khai": { lat: 9.706, lng: 100.048 },
};
