import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Jude — Home, Health, and Happiness on the wall";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "linear-gradient(180deg, #243d2a 0%, #1a2e1f 100%)",
          color: "#f5f0ea",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#e8a040",
            }}
          >
            Home · Health · Happiness
          </div>
          <div style={{ fontSize: 84, fontWeight: 400, letterSpacing: "-0.03em" }}>Jude</div>
          <div style={{ fontSize: 38, fontWeight: 400, opacity: 0.88 }}>
            Your home. Your friend.
          </div>
          <div style={{ fontSize: 24, fontWeight: 400, opacity: 0.62, maxWidth: 760, lineHeight: 1.45 }}>
            A warm, wall-mounted AI companion for older adults and the families who love them.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, opacity: 0.45 }}>urjude.com</div>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 40% 35%, #fff8e8 0%, #ffd080 30%, #e8a040 60%, #c07020 100%)",
              boxShadow: "0 0 60px rgba(255, 190, 90, 0.35)",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
