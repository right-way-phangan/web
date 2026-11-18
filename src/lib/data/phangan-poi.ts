/**
 * Static landmark coordinates on Koh Phangan for "distance from this plot"
 * chips on the object card. Straight-line (as-the-crow-flies) distances —
 * good enough for orientation, labelled approximate in the UI. Coordinates are
 * hand-placed at each landmark's centre; precise to a few tens of metres.
 */

export interface Poi {
  en: string;
  ru: string;
  th: string;
  lat: number;
  lng: number;
}

/** Main beaches — the chip shows the nearest one by name. */
export const PHANGAN_BEACHES: Poi[] = [
  { en: "Haad Rin", ru: "Хаад Рин", th: "หาดริ้น", lat: 9.6776, lng: 100.068 },
  { en: "Haad Yuan", ru: "Хаад Юан", th: "หาดยวน", lat: 9.69, lng: 100.064 },
  { en: "Than Sadet", ru: "Тан Садет", th: "ธารเสด็จ", lat: 9.756, lng: 100.064 },
  { en: "Thong Nai Pan", ru: "Тонг Най Пан", th: "ท้องนายปาน", lat: 9.782, lng: 100.054 },
  { en: "Bottle Beach", ru: "Боттл-Бич", th: "หาดขวด", lat: 9.796, lng: 100.018 },
  { en: "Chaloklum", ru: "Чалоклам", th: "โฉลกหลำ", lat: 9.788, lng: 99.993 },
  { en: "Haad Khom", ru: "Хаад Кхом", th: "หาดขอม", lat: 9.7905, lng: 99.9995 },
  { en: "Mae Haad", ru: "Маэ Хаад", th: "แม่หาด", lat: 9.779, lng: 99.975 },
  { en: "Haad Salad", ru: "Хаад Салад", th: "หาดสลัด", lat: 9.764, lng: 99.967 },
  { en: "Haad Yao", ru: "Хаад Яо", th: "หาดยาว", lat: 9.756, lng: 99.962 },
  { en: "Srithanu / Zen Beach", ru: "Шритану / Зен-Бич", th: "ศรีธนู / Zen Beach", lat: 9.743, lng: 99.964 },
  { en: "Haad Chao Phao", ru: "Хаад Чао Пао", th: "หาดเจ้าเภา", lat: 9.732, lng: 99.967 },
  { en: "Baan Tai", ru: "Баан Тай", th: "บ้านใต้", lat: 9.708, lng: 100.025 },
  { en: "Baan Kai", ru: "Баан Кай", th: "บ้านค่าย", lat: 9.702, lng: 100.011 },
];

/** Thong Sala — the main town and ferry pier, the island's reference hub. */
export const THONG_SALA: Poi = {
  en: "Thong Sala",
  ru: "Тонгсала",
  th: "ท้องศาลา",
  lat: 9.7106,
  lng: 99.9864,
};

/** Amenity categories for the optional "Nearby" marker layer. */
export type AmenityCat = "pier" | "hospital" | "school" | "shop" | "atm";

export interface Amenity extends Poi {
  cat: AmenityCat;
}

/**
 * Everyday-amenity landmarks shown as an optional "Nearby" overlay on the maps —
 * orientation context for a buyer (ferry off the island, the hospital, the big
 * supermarket, the bank cluster, a school). Hand-placed at each landmark's
 * centre, accurate to ~a couple hundred metres; kept to a small set of stable,
 * well-known points so the layer reads as orientation, not a directory.
 */
export const PHANGAN_AMENITIES: Amenity[] = [
  // Ferry piers — the way on and off the island (to Samui / the mainland).
  { cat: "pier", en: "Thong Sala Pier", ru: "Пирс Тонгсала", th: "ท่าเรือท้องศาลา", lat: 9.7085, lng: 99.9835 },
  { cat: "pier", en: "Haad Rin Pier", ru: "Пирс Хаад Рин", th: "ท่าเรือหาดริ้น", lat: 9.6739, lng: 100.0632 },
  // Hospital — the island's main (government) hospital, north of Thong Sala.
  { cat: "hospital", en: "Koh Phangan Hospital", ru: "Госпиталь Ко Панган", th: "โรงพยาบาลเกาะพะงัน", lat: 9.7363, lng: 99.9907 },
  // School — Koh Phangan School (Ko Pha-ngan Suksa), east of Thong Sala on the Ban Kai road.
  { cat: "school", en: "Koh Phangan School", ru: "Школа Ко Панган", th: "โรงเรียนเกาะพะงัน", lat: 9.7069, lng: 100.0053 },
  // Shops — the island's big-box supermarket + the Thong Sala convenience hub.
  { cat: "shop", en: "Makro", ru: "Makro", th: "Makro", lat: 9.7091, lng: 99.9964 },
  { cat: "shop", en: "Big C (Thong Sala)", ru: "Big C (Тонгсала)", th: "Big C (ท้องศาลา)", lat: 9.7092, lng: 100.0007 },
  // Banks & ATMs — the Thong Sala cluster (Bangkok Bank / Kasikorn / SCB).
  { cat: "atm", en: "Banks & ATMs (Thong Sala)", ru: "Банки и банкоматы (Тонгсала)", th: "ธนาคารและตู้ ATM (ท้องศาลา)", lat: 9.7123, lng: 99.9866 },
];
