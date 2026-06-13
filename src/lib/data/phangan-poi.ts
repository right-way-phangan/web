/**
 * Static landmark coordinates on Koh Phangan for "distance from this plot"
 * chips on the object card. Straight-line (as-the-crow-flies) distances —
 * good enough for orientation, labelled approximate in the UI. Coordinates are
 * hand-placed at each landmark's centre; precise to a few tens of metres.
 */

export interface Poi {
  en: string;
  ru: string;
  lat: number;
  lng: number;
}

/** Main beaches — the chip shows the nearest one by name. */
export const PHANGAN_BEACHES: Poi[] = [
  { en: "Haad Rin", ru: "Хаад Рин", lat: 9.6776, lng: 100.068 },
  { en: "Haad Yuan", ru: "Хаад Юан", lat: 9.69, lng: 100.064 },
  { en: "Than Sadet", ru: "Тан Садет", lat: 9.756, lng: 100.064 },
  { en: "Thong Nai Pan", ru: "Тонг Най Пан", lat: 9.782, lng: 100.054 },
  { en: "Bottle Beach", ru: "Боттл-Бич", lat: 9.796, lng: 100.018 },
  { en: "Chaloklum", ru: "Чалоклам", lat: 9.788, lng: 99.993 },
  { en: "Haad Khom", ru: "Хаад Кхом", lat: 9.7905, lng: 99.9995 },
  { en: "Mae Haad", ru: "Маэ Хаад", lat: 9.779, lng: 99.975 },
  { en: "Haad Salad", ru: "Хаад Салад", lat: 9.764, lng: 99.967 },
  { en: "Haad Yao", ru: "Хаад Яо", lat: 9.756, lng: 99.962 },
  { en: "Srithanu / Zen Beach", ru: "Шритану / Зен-Бич", lat: 9.743, lng: 99.964 },
  { en: "Haad Chao Phao", ru: "Хаад Чао Пао", lat: 9.732, lng: 99.967 },
  { en: "Baan Tai", ru: "Баан Тай", lat: 9.708, lng: 100.025 },
  { en: "Baan Kai", ru: "Баан Кай", lat: 9.702, lng: 100.011 },
];

/** Thong Sala — the main town and ferry pier, the island's reference hub. */
export const THONG_SALA: Poi = {
  en: "Thong Sala",
  ru: "Тонгсала",
  lat: 9.7095,
  lng: 100.013,
};
