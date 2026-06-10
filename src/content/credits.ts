/**
 * Photo-credit data for /credits (+ /ru/credits), rendered into the footer-linked
 * credits page. Wikimedia Commons photos under CC BY / CC BY-SA require visible
 * attribution; CC0 does not, but we list it anyway. Pexels needs no attribution.
 * Keep in sync with web/public/images/CREDITS.md.
 */

export interface PhotoCredit {
  district: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  fileUrl: string;
}

/** Real location photographs from Wikimedia Commons (attribution-bearing). */
export const COMMONS_CREDITS: PhotoCredit[] = [
  {
    district: "Bottle Beach (Haad Khuat)",
    title: "View to Bottle Beach, Koh Phangan",
    author: "kaaist",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    fileUrl:
      "https://commons.wikimedia.org/wiki/File:View_to_Bottle_Beach,_Koh_Phangan.jpg",
  },
  {
    district: "Mae Haad",
    title: "Ko Ma & Mae Haad (aerial)",
    author: "Mmarkin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Островок_Koh_Ma_в_прилив.jpg",
  },
  {
    district: "Thong Sala",
    title: "Thong Sala pier & village (aerial)",
    author: "Mmarkin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Пирс_и_деревня_Thong_Sala.jpg",
  },
  {
    district: "Hin Kong",
    title: "Hin Kong Beach",
    author: "Christophe95",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Hin_Kong_Beach.jpg",
  },
  {
    district: "Haad Rin",
    title: "Hat Rin from above",
    author: "zhaffsky (Flickr)",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Hat_Rin_from_above.jpg",
  },
];

export const PEXELS_LICENSE_URL = "https://www.pexels.com/license/";
