import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// Raw hex is required here (no Tailwind at manifest level): forest-500 /
// cream-100 from the brand palette — see .claude/skills/brand-style.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Right Way",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#1F3A2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
