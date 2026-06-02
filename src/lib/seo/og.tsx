import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

// Palette tokens duplicated here because ImageResponse evaluates outside the
// Tailwind runtime — must use raw CSS.
const COLORS = {
  cream: "#FAF7F2",
  creamMid: "#F2EDE3",
  forest: "#1F3A2E",
  forestSoft: "rgba(31, 58, 46, 0.65)",
  brass: "#B5651D",
} as const;

interface RenderArgs {
  eyebrow: string;     // e.g. "RW-0513 · Land · Sri Thanu"
  title: string;       // main line
  subtitle?: string;   // optional secondary line
  features?: string[]; // small chips at the bottom
}

/**
 * Default OG card. Same composition for all routes — only the text changes.
 * No external images / fonts (works on Edge without network calls).
 */
export function renderOg({ eyebrow, title, subtitle, features }: RenderArgs) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.creamMid} 100%)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: COLORS.forest,
          position: "relative",
        }}
      >
        {/* Topographic backdrop accent */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: "absolute", inset: 0, opacity: 0.07 }}
        >
          <g fill="none" stroke={COLORS.forest} strokeWidth="1.5">
            <path d="M -50 480 Q 300 420 600 480 T 1250 480" />
            <path d="M -50 430 Q 300 350 600 430 T 1250 430" />
            <path d="M -50 380 Q 300 260 600 380 T 1250 380" />
            <path d="M -50 320 Q 300 180 600 320 T 1250 320" />
          </g>
        </svg>

        {/* Header: brand */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, zIndex: 1 }}>
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>
            Right Way
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.forestSoft,
            }}
          >
            Phangan
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.brass,
              marginBottom: 24,
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -1,
              maxWidth: 1000,
              color: COLORS.forest,
            }}
          >
            {title}
          </span>
          {subtitle ? (
            <span
              style={{
                marginTop: 24,
                fontSize: 28,
                fontWeight: 400,
                color: COLORS.forestSoft,
                maxWidth: 900,
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </div>

        {/* Feature chips + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {(features ?? []).slice(0, 4).map((f) => (
              <span
                key={f}
                style={{
                  display: "flex",
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: `1px solid ${COLORS.forestSoft}`,
                  fontSize: 18,
                  color: COLORS.forest,
                  background: "rgba(255,255,255,0.4)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 20, color: COLORS.forestSoft }}>
            rightwaygroup.co
          </span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
