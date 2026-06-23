import type { Config } from "tailwindcss";
import containerQueries from "@tailwindcss/container-queries";

/**
 * RW palette — "Coastal Twilight" (redesign 2026-06).
 *
 * The Tailwind token NAMES (`forest` / `cream` / `brass`) are retained on
 * purpose: hundreds of class occurrences live across the app and a live site
 * with parallel work in flight is the wrong place for a risky 300-site rename.
 * Instead the token VALUES are remapped to the new direction, so the whole
 * surface shifts palette consistently with zero per-file churn. A dedicated
 * rename pass can follow later. See skill `brand-style`.
 *
 *   forest  → deep teal → ink   (dark brand colour: text, header/footer, buttons)
 *   cream   → sand / bone        (light surfaces, page background)
 *   brass   → warm amber          (single accent — sunset/coral, dosed)
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Light surfaces — warm sand / parchment (was "cream"). Clearly beige
        // (hue ~38°), never plain white, so light sections read as "sand".
        cream: {
          DEFAULT: "#F6EFE2",
          50: "#FCF8F1", // lightest — elevated cards, stat strip
          100: "#F6EFE2", // page background (body)
          200: "#EDE1CC", // subtle panels / hairline fills
          300: "#DCCBAB", // dividers, stone borders
          400: "#C2A776", // deeper stone neutral
        },
        // Dark brand colour — deep PETROL TEAL resolving to ink (was "forest").
        // High-chroma cold teal (hue ~185–191°, sat ~84%): full-bleed in the
        // hero/footer it reads unmistakably as ocean-at-dusk, never near-black
        // green. THIS is the shade that signals the new palette.
        forest: {
          DEFAULT: "#085860",
          50: "#E6F3F3", // lightest teal tint — light borders/bg
          100: "#C6E6E7", // light teal
          400: "#15A8A8", // luminous cyan-teal — hover / bright accents
          500: "#0A6E74", // strong teal — primary button base, links
          600: "#085860", // deep petrol teal
          700: "#06434B", // deeper
          900: "#04262E", // ink — darkest petrol (hero/footer, dark sections)
        },
        // Accent — warm amber / sunset (was "brass"). The VIVID amber lives at
        // 300/400 for use on DARK teal-ink (hero, CTA band) where it glows like
        // a sunset; the workhorse 500 is a DEEP amber tuned to clear AA both as
        // small text on the light sand surface AND with light text on it as a
        // fill — so the ~240 existing `*-brass-500` usages stay accessible with
        // zero per-file churn. Use 300 on dark, 500/600/700 on light.
        brass: {
          DEFAULT: "#985A0C",
          200: "#F7D292", // lightest — decor / display accent on dark
          300: "#F4BE5C", // glowing sunset GOLD — eyebrow/text on DARK sections
          400: "#D98A1E", // vivid amber — fills/large text on dark
          500: "#985A0C", // deep amber — AA as text on light + light text on fill
          600: "#7F4E0B", // hover / stronger on light
          700: "#5E3A08", // deepest — text on light (extra safe)
        },
      },
      fontFamily: {
        // loaded via next/font in layout.tsx
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "65ch",
        container: "1280px",
      },
      letterSpacing: {
        eyebrow: "0.3em",
      },
      transitionTimingFunction: {
        // Premium spring-ish curves — never raw linear/ease-in-out (high-end craft).
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)", // gentle decel — entrances
        silk: "cubic-bezier(0.32, 0.72, 0, 1)", // long luxurious ease — large moves
      },
      boxShadow: {
        // Soft, diffuse, never harsh — ambient elevation for the light surface.
        soft: "0 1px 2px rgba(12, 27, 30, 0.04), 0 8px 24px -12px rgba(12, 27, 30, 0.18)",
        lift: "0 2px 6px rgba(12, 27, 30, 0.05), 0 24px 48px -20px rgba(12, 27, 30, 0.28)",
        // Inner top highlight for the double-bezel "inner core".
        bezel: "inset 0 1px 1px rgba(255, 255, 255, 0.12)",
      },
      borderRadius: {
        // Exaggerated squircles for the double-bezel architecture.
        bezel: "1.75rem",
        core: "1.375rem", // ~ bezel − p-1.5, concentric curves
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [containerQueries],
};

export default config;
