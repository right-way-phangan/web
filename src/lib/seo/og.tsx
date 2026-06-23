import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
// Photo cards render on a smaller canvas: PNG weight scales with pixel count,
// and WhatsApp won't preview og:images much past ~600KB. 800×420 keeps the
// 1.9:1 ratio and stays comfortably above every platform's large-card minimum.
export const OG_PHOTO_SIZE = { width: 800, height: 420 } as const;
export const OG_CONTENT_TYPE = "image/png";

// Palette tokens duplicated here because ImageResponse evaluates outside the
// Tailwind runtime — must use raw CSS.
const COLORS = {
  cream: "#F6EFE2",
  creamMid: "#EDE1CC",
  forest: "#04262E",
  forestSoft: "rgba(4, 38, 46, 0.65)",
  brass: "#985A0C",
} as const;

interface RenderArgs {
  eyebrow: string;     // e.g. "RW-0513 · Land · Sri Thanu"
  title: string;       // main line
  subtitle?: string;   // optional secondary line
  features?: string[]; // small chips at the bottom
  /** Cover photo URL (public, jpeg/png). Switches to the photo composition. */
  photo?: string;
}

/**
 * Photo composition: full-bleed cover with a forest gradient and cream text —
 * listings shared into WhatsApp/Telegram lead with the property itself.
 */
function renderOgPhoto({ eyebrow, title, features, photo }: RenderArgs) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "36px 48px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: COLORS.forest,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          width={OG_PHOTO_SIZE.width}
          height={OG_PHOTO_SIZE.height}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(4,38,46,0.92) 0%, rgba(4,38,46,0.45) 45%, rgba(4,38,46,0.20) 100%)",
          }}
        />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, zIndex: 1 }}>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.5, color: COLORS.cream }}>
            Right Way
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(246,239,226,0.65)",
            }}
          >
            Phangan
          </span>
        </div>

        {/* Bottom: eyebrow, title, chips */}
        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#F4BE5C",
              marginBottom: 10,
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              fontSize: 38,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: -0.5,
              maxWidth: 680,
              color: COLORS.cream,
            }}
          >
            {title}
          </span>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            {(features ?? []).slice(0, 4).map((f) => (
              <span
                key={f}
                style={{
                  display: "flex",
                  padding: "5px 11px",
                  borderRadius: 4,
                  border: "1px solid rgba(246,239,226,0.45)",
                  fontSize: 13,
                  color: COLORS.cream,
                  background: "rgba(4,38,46,0.35)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    OG_PHOTO_SIZE,
  );
}

/**
 * Default OG card. Text composition for all routes; pass `photo` to lead with
 * the property cover instead (object pages). Without a photo there are no
 * network calls — works on Edge self-contained.
 */
export function renderOg(args: RenderArgs) {
  if (args.photo) return renderOgPhoto(args);
  const { eyebrow, title, subtitle, features } = args;
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
