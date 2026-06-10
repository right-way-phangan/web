import type { Config } from "tailwindcss";
import containerQueries from "@tailwindcss/container-queries";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // RW palette (warm premium)
        cream: {
          DEFAULT: "#FAF7F2",
          50: "#FEFCF9",
          100: "#FAF7F2",
          200: "#F2EDE3",
          300: "#E8E0CF",
        },
        forest: {
          DEFAULT: "#1F3A2E",
          50: "#E8EEEA",
          100: "#C5D2CB",
          400: "#2F5546",
          500: "#1F3A2E",
          900: "#0E1F18",
        },
        brass: {
          DEFAULT: "#B5651D",
          200: "#E8C9A0",
          300: "#DDA86A",
          400: "#C77929",
          500: "#B5651D",
          600: "#965318",
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
    },
  },
  plugins: [containerQueries],
};

export default config;
