import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// Raw hex is required here (no Tailwind at manifest level): cream-100 (sand) /
// forest-900 (petrol ink) from the Coastal Twilight palette — see skill brand-style.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Right Way",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F6EFE2",
    theme_color: "#04262E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
