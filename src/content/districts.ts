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
  {
    slug: "thong-sala",
    amoName: "Nai Wok (Thong Sala)",
    title: "Thong Sala — main town & port, south coast",
    short:
      "The island's commercial heart — ferry port, banks, hospital, the night market. Convenience over the beach.",
    paragraphs: [
      "Thong Sala is the main town of Koh Phangan and the arrival point for almost everyone — the ferry piers, the banks, the hospital, the immigration office, the big supermarkets, and the Saturday walking-street night market are all here. If a district can be called the island's centre of gravity, this is it.",
      "Property in and around Thong Sala — including the Nai Wok stretch just west along the coast — is the most mixed-use on the island: shophouses and commercial frontage alongside residential plots and small condo projects. Buyers here choose convenience over seclusion, and the west-facing Nai Wok coast still gives sunset views without leaving town.",
    ],
    audience:
      "Business owners, commercial-plot and shophouse buyers, long-stay residents who want everything within five minutes, and rental investors targeting year-round tenants rather than seasonal tourists.",
    expect: [
      "Mostly flat terrain",
      "Best infrastructure on the island — utilities, internet, services",
      "0 min to town, piers, hospital, banks (this is the reference point)",
      "Town / commercial zoning in places — mixed-use allowed",
      "Busiest, densest district — convenience over quiet",
    ],
  },
  {
    slug: "wok-tum",
    amoName: "Wok Tum",
    title: "Wok Tum — west coast, quiet sunset strip",
    short:
      "A calm residential coast just north of town — sunsets, long-term homes, and Thong Sala still minutes away.",
    paragraphs: [
      "Wok Tum runs along the west coast just north of Nai Wok, between Thong Sala and Hin Kong. It's a quiet, low-key residential strip — shoreline and mangrove rather than a swimming beach, but with open west-facing sunset views and a settled community of long-term residents.",
      "The appeal here is balance: you keep Thong Sala's services within a five-to-ten-minute drive while stepping out of its bustle. The land market is modest and residential, with both coastal positions and gently rising plots inland.",
    ],
    audience:
      "Long-term residents who want quiet and sunset views without losing proximity to town. Practical buyers, often a second-time Phangan purchaser who knows they want the west coast but not the tourist beaches.",
    expect: [
      "Flat along the coast, gentle hills inland",
      "All utilities available",
      "5–10 min drive to Thong Sala",
      "West-facing — open sunset views",
      "Shoreline rather than a primary swimming beach",
    ],
  },
  {
    slug: "hin-kong",
    amoName: "Hin Kong",
    title: "Hin Kong — west coast, long beach & families",
    short:
      "A long, calm west-coast beach with a growing residential community and an international school nearby.",
    paragraphs: [
      "Hin Kong sits on the west coast between Wok Tum and Sri Thanu, with one of the longest, calmest beaches on this side of the island. It has slowly grown from farmland into a residential area, helped by good road access and the presence of one of the island's international schools nearby.",
      "The character is unhurried and family-oriented rather than tourist-driven — a handful of beachfront restaurants, west-facing sunsets, and shallow water good for swimming. A practical middle ground between Thong Sala's convenience and Sri Thanu's wellness scene.",
    ],
    audience:
      "Families (school proximity), long-term residents who want a real beach without the wellness-community framing, and buyers who value calm water and easy road access.",
    expect: [
      "Mostly flat, some gentle slope inland",
      "All utilities available",
      "10–15 min drive to Thong Sala",
      "Long, shallow, calm west-coast beach",
      "International school nearby",
    ],
  },
  {
    slug: "mae-haad",
    amoName: "Mae Haad",
    title: "Mae Haad — north-west tip, Koh Ma & the sandbar",
    short:
      "Home to the island's iconic snorkelling sandbar to Koh Ma — a small northern community with the clearest water on Phangan.",
    paragraphs: [
      "Mae Haad sits on the north-western tip of the island and is best known for Koh Ma — a tiny islet joined to the beach by a natural sandbar at low tide, and the island's premier snorkelling spot inside a protected marine area. The water here is among the clearest on Phangan.",
      "The community is small and oriented around diving, snorkelling, and a relaxed northern-beach lifestyle. The land market is limited; coastal positions are scarce and prized, while plots in the hills behind offer sea views over the bay.",
    ],
    audience:
      "Divers and snorkellers, sea-view buyers, and residents who want a striking beach and a small community over convenience. Typically second-time Phangan buyers.",
    expect: [
      "Flat at the shore, steep hills behind",
      "Utilities available in the village",
      "30–40 min drive to Thong Sala",
      "Best snorkelling on the island (Koh Ma marine area)",
      "Scarce coastal plots — hillside sea-view plots more common",
    ],
  },
  {
    slug: "bottle-beach",
    amoName: "Bottle Beach",
    title: "Bottle Beach (Haad Khuat) — remote north shore",
    short:
      "One of the island's most beautiful and least reachable beaches — boat or 4×4 access only, off-grid by nature.",
    paragraphs: [
      "Bottle Beach — Haad Khuat — is a remote bay on the northern shore, reached only by longtail boat from Chaloklum or a rough 4×4 track and hike over the hills. There is no proper road, and that is precisely the point: it remains one of the most pristine and undeveloped beaches on Koh Phangan.",
      "The land market here is tiny and specialised. Building is constrained by access and by the off-grid reality — power and water are not a given, and logistics are a real factor. For the right buyer, the seclusion is unmatched on the island.",
    ],
    audience:
      "Off-grid and extreme-seclusion buyers who treat remoteness as the feature, not the obstacle. A very small niche — usually people building a private retreat rather than a conventional home.",
    expect: [
      "Steep hills meeting a flat beach",
      "Off-grid — utilities not guaranteed, plan for solar / water",
      "Access by boat or 4×4 only — no paved road",
      "Among the most pristine beaches on the island",
      "Very limited, specialised land market",
    ],
  },
  {
    slug: "thong-nai-pan",
    amoName: "Thong Nai Pan",
    title: "Thong Nai Pan — north-east, the upscale east coast",
    short:
      "Two beautiful east-coast bays — Yai and Noi — the most developed and upscale corner of the quiet side of the island.",
    paragraphs: [
      "Thong Nai Pan is a pair of twin bays on the north-east coast — Thong Nai Pan Yai, the larger and livelier, and Thong Nai Pan Noi, smaller and more exclusive, home to the island's most established luxury resort. It's the most developed beach on the otherwise-quiet east coast, now reached by a paved mountain road.",
      "Sunrise rather than sunset, fine white sand, and a more upscale feel set it apart. The land market is small and skews premium — beachfront is rare, and the surrounding hills offer dramatic sea-view positions for villas.",
    ],
    audience:
      "Premium and beachfront buyers, sea-view villa builders, and those drawn to the east coast's sunrise and upscale, resort-adjacent atmosphere. Often buyers prioritising setting over proximity to town.",
    expect: [
      "Flat bays framed by steep hills",
      "Utilities available in the developed areas",
      "40–50 min drive to Thong Sala over the mountain road",
      "Sunrise coast, fine white-sand beaches",
      "Premium, low-inventory market",
    ],
  },
  {
    slug: "than-sadet",
    amoName: "Than Sadet",
    title: "Than Sadet — east coast, national park & waterfall",
    short:
      "A protected jungle valley with a royal-history waterfall and river — remote, green, and barely developed.",
    paragraphs: [
      "Than Sadet lies on the east coast, set around a national-park river and the Than Sadet waterfall — a place with royal history, visited and inscribed by Thai kings. It's deep jungle, river, and a small beach, with limited access by a rough road or by boat.",
      "Development is light and constrained by the protected setting. This is a district for buyers who want immersion in nature and water over convenience, and who understand that access and infrastructure require planning.",
    ],
    audience:
      "Nature-first buyers seeking jungle, river, and seclusion. A small niche, often building a private off-grid or semi-off-grid retreat.",
    expect: [
      "Steep jungle terrain, river valley",
      "Off-grid or partial utilities — plan ahead",
      "Access by rough road or boat",
      "National-park setting — building constraints apply",
      "Very limited land market",
    ],
  },
  {
    slug: "haad-rin",
    amoName: "Haad Rin",
    title: "Haad Rin — south-east tip, the Full Moon beach",
    short:
      "The island's tourism and nightlife hub — Sunrise Beach hosts the Full Moon Party; the quieter Sunset side sits minutes away.",
    paragraphs: [
      "Haad Rin occupies the south-eastern tip of the island and is the best-known name on Phangan thanks to the Full Moon Party, held on Haad Rin Nok — Sunrise Beach. It's the island's densest tourism and nightlife zone, with hotels, bars, and the most seasonal economy on Phangan. Haad Rin Nai — the Sunset side — is noticeably calmer.",
      "Property here is driven by tourism and rental yield rather than residential lifestyle. The peninsula is reached by a steep road over the hills or by boat from Thong Sala. It suits investors who understand the seasonality and the party-economy dynamics.",
    ],
    audience:
      "Rental and commercial investors targeting tourism, and buyers comfortable with a busy, seasonal, nightlife-driven environment. Less suited to families or quiet-lifestyle buyers.",
    expect: [
      "Hilly peninsula, two beaches (Sunrise / Sunset)",
      "Full utilities and dense infrastructure",
      "30–40 min drive over a steep road, or boat from Thong Sala",
      "Most seasonal, tourism-driven economy on the island",
      "Investment / rental focus over residential calm",
    ],
  },
  {
    slug: "haad-yuan-tien",
    amoName: "Haad Yuan",
    title: "Haad Yuan & Haad Tien — secluded south-east beaches",
    short:
      "Boat-access wellness coves between Haad Rin and Than Sadet — bohemian, off-grid, with long-running retreat communities.",
    paragraphs: [
      "Haad Yuan, Haad Tien, and neighbouring Why Nam are a string of secluded coves on the south-east coast, between Haad Rin and Than Sadet. Most are reached primarily by longtail boat or a rough 4×4 track — there's no easy road in. Haad Tien is home to a long-established wellness and detox community.",
      "The atmosphere is bohemian, barefoot, and off-grid. The land market is thin and unconventional, shaped by access constraints and the retreat-oriented culture of the area. It rewards buyers who want a beach community deliberately cut off from the road network.",
    ],
    audience:
      "Wellness-minded and off-grid buyers, retreat operators, and people who want a barefoot beach community over convenience. A specialised, lifestyle-driven niche.",
    expect: [
      "Steep hills dropping to small coves",
      "Off-grid — solar / water planning expected",
      "Access mainly by boat or 4×4 — limited road",
      "Established wellness / retreat community",
      "Thin, unconventional land market",
    ],
  },
  {
    slug: "khao-khao-haeng",
    amoName: "Khao Khao Haeng",
    title: "Khao Khao Haeng — inland hills, panoramic views",
    short:
      "An elevated inland area where the draw is altitude — cooler air, jungle, and wide sea-and-island views from the slopes.",
    paragraphs: [
      "Khao Khao Haeng is an elevated, inland-hill area — \"khao\" means hill or mountain — where the land rises high enough to open up panoramic views across the island and out to sea. It's jungle, cooler air, and quiet, away from the beaches and the traffic.",
      "Buyers come here specifically for the view and the elevation. The trade-offs are steeper terrain and steeper access roads, and a drive to reach the coast — but few districts can match the outlook from a well-positioned plot.",
    ],
    audience:
      "Sea-view and panorama seekers, villa builders willing to work with slope for the payoff of the view, and residents who value cooler, elevated quiet over beach proximity.",
    expect: [
      "Moderate to steep slope — view-driven plots",
      "Utilities reachable, but access can be demanding",
      "Drive to the nearest beach required",
      "Cooler, elevated, jungle setting",
      "Panoramic sea and island views",
    ],
  },
  {
    slug: "ban-nai-suan",
    amoName: "Ban Nai Suan",
    title: "Ban Nai Suan — central inland, space & value",
    short:
      "A quiet inland village of orchards and gardens near the island's centre — central access, more room, no beach.",
    paragraphs: [
      "Ban Nai Suan — literally \"the village in the gardens\" — is a quiet inland area near the centre of the island, historically orchard and garden land gradually turning residential. It's green, settled, and away from both the coast and the tourist routes.",
      "The appeal is central access in every direction combined with more space than the coastal districts, and a quieter, more local feel. A practical choice for residents building a permanent home who don't need the beach at the doorstep.",
    ],
    audience:
      "Value-conscious and long-term resident buyers who want central location, more land, and a quiet, local setting over beachfront. Often families or those building a permanent base.",
    expect: [
      "Gentle, mostly flat to rolling terrain",
      "All utilities available",
      "Central — short drive to most parts of the island",
      "Green, orchard-and-garden setting",
      "More space, quieter, local atmosphere",
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
  // Verified against Vladimir's Google Maps pins (2026-06-10).
  "sri-thanu": { lat: 9.755319, lng: 99.963667 },
  "haad-salad": { lat: 9.786226, lng: 99.972714 },
  "madeau-wan": { lat: 9.78, lng: 99.97 },
  "ban-tai": { lat: 9.702, lng: 100.028 },
  chaloklum: { lat: 9.786872, lng: 100.005647 },
  "haad-yao": { lat: 9.775439, lng: 99.966582 },
  "ban-khai": { lat: 9.706, lng: 100.048 },
  "thong-sala": { lat: 9.712127, lng: 99.986647 },
  "wok-tum": { lat: 9.734378, lng: 99.985756 },
  "hin-kong": { lat: 9.74554, lng: 99.976033 },
  "mae-haad": { lat: 9.795681, lng: 99.982017 },
  "bottle-beach": { lat: 9.792198, lng: 100.036228 },
  "thong-nai-pan": { lat: 9.779995, lng: 100.055668 },
  "than-sadet": { lat: 9.74942, lng: 100.074696 },
  "haad-rin": { lat: 9.677, lng: 100.067 },
  "haad-yuan-tien": { lat: 9.69219, lng: 100.073389 },
  "khao-khao-haeng": { lat: 9.713898, lng: 100.016843 },
  "ban-nai-suan": { lat: 9.745, lng: 100.02 },
};

/**
 * Slugs that have a hero photo at /public/images/districts/{slug}.jpg.
 * Districts not in this set render a branded forest-green panel instead of a
 * broken <Image>, until a photo is added (then add the slug here).
 * All 18 districts currently have representative Pexels imagery — see
 * web/public/images/CREDITS.md.
 */
export const DISTRICT_HERO_SLUGS = new Set<string>([
  "sri-thanu",
  "haad-salad",
  "madeau-wan",
  "ban-tai",
  "chaloklum",
  "haad-yao",
  "ban-khai",
  "thong-sala",
  "wok-tum",
  "hin-kong",
  "mae-haad",
  "bottle-beach",
  "thong-nai-pan",
  "than-sadet",
  "haad-rin",
  "haad-yuan-tien",
  "khao-khao-haeng",
  "ban-nai-suan",
]);

export function districtHasHero(slug: string): boolean {
  return DISTRICT_HERO_SLUGS.has(slug);
}
