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
  // Tailwind 3 применяет `hover:` без оглядки на устройство (гейт стал дефолтом
  // только в v4). На тач-экране :hover залипает после тапа: карточка остаётся
  // приподнятой, обложка — зумнутой, до следующего касания. Флаг заворачивает
  // все hover-утилиты в `@media (hover: hover)`.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: withVar("--c-cream-100"),
          50: withVar("--c-cream-50"),
          100: withVar("--c-cream-100"),
          200: withVar("--c-cream-200"),
          300: withVar("--c-cream-300"),
          400: withVar("--c-cream-400"),
        },
        forest: {
          DEFAULT: withVar("--c-forest-500"),
          50: withVar("--c-forest-50"),
          100: withVar("--c-forest-100"),
          400: withVar("--c-forest-400"),
          500: withVar("--c-forest-500"),
          600: withVar("--c-forest-600"),
          700: withVar("--c-forest-700"),
          900: withVar("--c-forest-900"),
        },
        brass: {
          DEFAULT: withVar("--c-brass-500"),
          200: withVar("--c-brass-200"),
          300: withVar("--c-brass-300"),
          400: withVar("--c-brass-400"),
          500: withVar("--c-brass-500"),
          600: withVar("--c-brass-600"),
          700: withVar("--c-brass-700"),
        },
        // Non-inverting: a deliberately dark surface + light text in *both*
        // themes — header-over-hero, dark CTA bands, solid buttons, badges.
        panel: {
          DEFAULT: withVar("--c-panel"),
          fg: withVar("--c-panel-fg"),
        },
        // Warm bronze — dark-theme structural accent (kant, badges, duotone,
        // header edge, nav). A darker warm sibling of gold.
        bronze: withVar("--c-bronze"),
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
      letterSpacing: {
        eyebrow: "0.3em",
      },
      transitionTimingFunction: {
        // Premium spring-ish curves — never raw linear/ease-in-out.
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        silk: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      boxShadow: {
        // Soft, diffuse ambient elevation (theme-tinted via panel ink).
        soft: "0 1px 2px rgb(var(--c-panel) / 0.04), 0 8px 24px -12px rgb(var(--c-panel) / 0.18)",
        lift: "0 2px 6px rgb(var(--c-panel) / 0.05), 0 24px 48px -20px rgb(var(--c-panel) / 0.28)",
        bezel: "inset 0 1px 1px rgb(255 255 255 / 0.12)",
      },
      borderRadius: {
        // Exaggerated squircles for the double-bezel architecture.
        bezel: "1.75rem",
        core: "1.375rem",
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
