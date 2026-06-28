/**
 * External STR trackers — a sanity range around our own measured median.
 *
 * These are NOT pipeline data: nobody scrapes them. They're public market
 * figures from independent trackers, hand-curated (~quarterly) so /insights can
 * show that our number sits inside the independent range. Trackers диверге by
 * design — different sampling, "active" rules, channels (Airbnb-only vs +Vrbo) —
 * which is exactly why we show the range and anchor our own transparent sample,
 * never blend theirs into our median.
 *
 * USD figures normalised to THB at ~36.5 (snapshot FX). To refresh: re-read each
 * source page, update the numbers + asOf + BENCHMARKS_REFRESHED. Sources:
 *  - Airbtics: https://airbtics.com/annual-airbnb-revenue-in-ko-pha-ngan-thailand/
 *  - AirDNA:   https://www.airdna.co/vacation-rental-data/app/th/default/ko-pha-ngan/overview
 *  - AirROI:   https://www.airroi.com/report/world/thailand/surat-thani/ko-pha-ngan
 */

export interface ExternalBenchmark {
  key: string;
  label: string;
  /** Median/avg nightly rate as the tracker reports it, normalised to THB. */
  adrThb: number;
  /** Listings the tracker bases its market figures on (their "active" count). */
  listings: number;
  /** Occupancy as the tracker reports it (their methodology), %. */
  occupancyPct: number | null;
  /** Coverage window / as-of of the figures. */
  asOf: string;
  /** Short caveat surfaced to the reader (channel mix, sample caveats). */
  note?: string;
}

export const EXTERNAL_BENCHMARKS: ExternalBenchmark[] = [
  {
    key: "airbtics",
    label: "Airbtics",
    adrThb: 2816,
    listings: 1666,
    occupancyPct: 68,
    asOf: "Mar 2026",
    note: "Airbnb",
  },
  {
    key: "airdna",
    label: "AirDNA",
    adrThb: 4599,
    listings: 3576,
    occupancyPct: 54,
    asOf: "T12M 2026",
    note: "incl. Vrbo",
  },
  {
    key: "airroi",
    label: "AirROI",
    adrThb: 6972,
    listings: 171,
    occupancyPct: 40,
    asOf: "Jun’25–May’26",
    note: "narrow sample",
  },
];

/** Last time the figures above were re-read from source pages. */
export const BENCHMARKS_REFRESHED = "2026-06-28";
