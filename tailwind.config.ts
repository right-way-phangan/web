import type { Config } from "tailwindcss";
import containerQueries from "@tailwindcss/container-queries";

// Palette tokens resolve through CSS variables (see globals.css) so a single
// `.dark` class on <html> repaints the whole site. The variables hold RGB
// triplets and feed `rgb(var(--x) / <alpha-value>)`, so every existing alpha
// utility (text-forest-900/50, bg-forest-900/5, …) keeps working unchanged and
// flips with the theme.
//
// Light theme keeps the exact warm-premium hexes. Dark theme *inverts* the
// roles: `forest` (text/borders/tints) goes light, `cream` (surfaces/fills)
// goes dark, `brass` (accent) goes a touch brighter. The one combo inversion
// can't express — a deliberately dark surface with light text (header overlay,
// dark sections, solid buttons) — uses the non-inverting `panel` / `panel-fg`
// tokens instead.
const withVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: withVar("--c-cream-100"),
          50: withVar("--c-cream-50"),
          100: withVar("--c-cream-100"),
          200: withVar("--c-cream-200"),
          300: withVar("--c-cream-300"),
        },
        forest: {
          DEFAULT: withVar("--c-forest-500"),
          50: withVar("--c-forest-50"),
          100: withVar("--c-forest-100"),
          400: withVar("--c-forest-400"),
          500: withVar("--c-forest-500"),
          900: withVar("--c-forest-900"),
        },
        brass: {
          DEFAULT: withVar("--c-brass-500"),
          200: withVar("--c-brass-200"),
          300: withVar("--c-brass-300"),
          400: withVar("--c-brass-400"),
          500: withVar("--c-brass-500"),
          600: withVar("--c-brass-600"),
        },
        // Non-inverting: a deliberately dark surface + light text in *both*
        // themes — header-over-hero, dark CTA bands, solid buttons, badges.
        panel: {
          DEFAULT: withVar("--c-panel"),
          fg: withVar("--c-panel-fg"),
        },
        // Brand jade — dark-theme structural accent (kant, badges, duotone,
        // header edge). Named `jade` (not `emerald`) to avoid clobbering
        // Tailwind's default emerald-* scale used for success states in admin.
        jade: withVar("--c-emerald"),
        // Reserved orange — urgency/scarcity only (e.g. "N units left"). Dosed
        // so it stays an alert signal, not a second brand accent.
        urgent: withVar("--c-orange"),
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
    },
  },
  plugins: [containerQueries],
};

export default config;
