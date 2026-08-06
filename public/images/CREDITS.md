# Image credits & licensing

Stock imagery — three sources, all free for commercial use. **Photographs only — no 3D
renders / digital art.** Developer-supplied project photography is a separate case, see
the section at the bottom.

1. **Pexels** (https://www.pexels.com/license/) — no attribution required. Used for
   *representative* Koh Phangan / Gulf-of-Thailand atmosphere (not a specific plot).
2. **Wikimedia Commons** — used for *actual photographs of named places* (Bottle Beach,
   Ko Ma, Thong Sala pier, Haad Rin). CC licenses require attribution — see the Commons
   table below; this public credits page satisfies CC BY / CC BY-SA. CC0 needs none.
3. **Unsplash** (https://unsplash.com/license) — no attribution required; author credited
   below anyway. Same *representative* use as Pexels.

Self-hosted copies, resized to ~1400–1800px wide.

## District cards (`districts/<slug>.jpg`)

Representative imagery (Pexels, no attribution):

| File | Pexels ID | Original caption |
|------|-----------|------------------|
| haad-salad.jpg  | 3822201  | Secluded beach cove (Gulf of Thailand) |
| madeau-wan.jpg  | 4023503  | Coconut palm grove, Surat Thani, Thailand (inland, no beach) |
| ban-tai.jpg     | 33853025 | Aerial of a long tropical coastline + turquoise water |
| chaloklum.jpg   | 27962372 | Aerial of a coastal town + long beach + hills (big bay) |
| haad-yao.jpg    | 1907087  | Evening bay — sunset over calm water, islet + boat silhouette |
| ban-khai.jpg    | 32107710 | Beach villas under palms, Koh Phangan |
| wok-tum.jpg         | 9936468  | Tranquil tropical sunset, calm waves (quiet sunset strip) |
| thong-nai-pan.jpg   | 8300614  | Aerial of a tropical bay + village + hills (upscale bay) |
| than-sadet.jpg      | 5134473  | Jungle river with cascading waterfalls + roots (national park) |
| haad-yuan-tien.jpg  | 15734463 | Serene palm-lined tropical cove (secluded SE coves) |
| khao-khao-haeng.jpg | 14784801 | Verdant forested hills, Thailand (inland elevation/views) |
| ban-nai-suan.jpg    | 9650263  | Vibrant coconut grove, Thailand (inland gardens) |

Actual photographs of the named place (Wikimedia Commons — **attribution required**):

| File | Commons file | Author | License |
|------|--------------|--------|---------|
| thong-sala.jpg   | Пирс и деревня Thong Sala.jpg | Mmarkin | CC BY-SA 4.0 |
| mae-haad.jpg     | Островок Koh Ma в прилив.jpg | Mmarkin | CC BY-SA 4.0 |
| hin-kong.jpg     | Hin Kong Beach.jpg | Christophe95 | CC BY-SA 4.0 |
| bottle-beach.jpg | View to Bottle Beach, Koh Phangan.jpg | kaaist | CC0 (no attribution needed) |
| haad-rin.jpg     | Hat Rin from above.jpg | zhaffsky (Flickr) | CC BY-SA 2.0 |

Representative imagery (Unsplash, attribution optional):

| File | Unsplash ID | Author | Original caption |
|------|-------------|--------|------------------|
| sri-thanu.jpg | D_wuiyj2kXc | Arvydas Arnasius (@arvydasseventyone) | Aerial of a palm-lined coastline, turquoise shallows + headland |

## Scenes (`scenes/*.jpg`) — one unique image per page, no repeats

| File | Pexels ID | Original caption | Used for |
|------|-----------|------------------|----------|
| coast-aerial.jpg     | 1647064  | Aerial coastline, pink sky | /about hero |
| turquoise-aerial.jpg | 1139041  | Drone turquoise water + boats | /services hero |
| process.jpg          | 8300659  | Golden-hour aerial cove | /process hero |
| faq.jpg              | 15249164 | Palm beach at dusk | /faq hero |
| contact.jpg          | 30852253 | Coastal villas above the sea | /contact hero |
| home-closing.jpg     | 8300613  | Tropical islet at sunset (Gulf of Thailand) | homepage closing CTA band |
| cove-portrait.jpg    | 5282255  | Sunlit jungle cove (portrait) | spare (unused) |
| phangan-sign.jpg     | 11963508 | "Koh Phangan" beach sign | spare (unused) |

## Homepage hero — crossfading drone scenes (`/hero/scene-*.jpg` + `/hero-phangan.jpg`)

Hand-curated premium aerial/drone photography of Koh Phangan & the Gulf-of-Thailand
archipelago (Pexels, free for commercial use, no attribution required). *Representative
island atmosphere — not a specific listed plot.* Replaces the old self-refreshing
catalog manifest, which surfaced watermarked land-plot aerials. The weekly
`refresh-scenes.yml` Action is now manual-only so this curation persists.

| File | Pexels ID | Caption | Location |
|------|-----------|---------|----------|
| scene-1.jpg + hero-phangan.jpg (LCP) | 29496453 | Emerald cove with granite boulders | Gulf of Thailand |
| scene-2.jpg | 8300817  | Turquoise sandbar beach | **Ko Pha-ngan** (tagged) |
| scene-3.jpg | 37914438 | Island panorama at sunset | Gulf of Thailand |
| scene-4.jpg | 8300656  | Horseshoe bay, turquoise water | Gulf of Thailand |
| scene-5.jpg | 29496454 | Turquoise reef bay | Gulf of Thailand |
| scene-6.jpg | 32107700 | Secluded jungle beach (Bottle Beach) | **Koh Phangan** (tagged) |

## Developer project photography (`developers/arqa/*.jpg`)

Not stock — the developer's own photography of **delivered** objects, handed over by
ARQA Development (Denis Butuzov) in August 2026 for use on their profile page. No
renders, no confidential material (price lists / internal calculations never go into
`public/`). Lifestyle frames with recognisable people are deliberately left out: no
model release, and the developer has not yet confirmed publication in writing — that
confirmation is still an open item with him.

Sized for direct delivery — `images.unoptimized` is on (Vercel's optimizer is off, see
`next.config.ts`), so what is committed is what the browser downloads: hero 2000px,
every other frame 1400px JPEG q82 plus a `-sm.webp` 760px sibling (the carousel loads
the thumb, the lightbox the full frame).

People in frame: the lifestyle set (`phangaia-poolside`, `phangaia-reading`,
`phangaia-breakfast`) is published with the developer's written go-ahead (Aug 2026).

| Prefix | Project | Status shown |
|--------|---------|--------------|
| `phangaia-*` (15) | Phangaia Garden Resort, phases I–II (Nai Wok) | delivered, in rental use |
| `demaya-*` (9) | Demaya Resort, one-bedroom villa | delivered, furnished |
| `verana-*` (9) | Verana Villas (phase III) — completed villa of the same type | under construction |
