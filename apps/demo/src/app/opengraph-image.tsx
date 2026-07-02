import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Jude — Your home. Your friend.";
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
          background: "radial-gradient(circle at 50% 35%, #2a2218 0%, #1a1510 45%, #0f0d0a 100%)",
          color: "#f5f0ea",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 88, fontWeight: 400, letterSpacing: "-0.03em" }}>Jude</div>
          <div style={{ fontSize: 40, fontWeight: 400, opacity: 0.82 }}>Your home. Your friend.</div>
          <div style={{ fontSize: 24, fontWeight: 400, opacity: 0.55, maxWidth: 720, lineHeight: 1.4 }}>
            Wall-mounted home AI with voice, smart home support, and family connection.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, opacity: 0.45 }}>jude.one</div>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 40% 35%, #fff8e8 0%, #ffd080 30%, #e8a040 60%, #c07020 100%)",
              boxShadow: "0 0 80px rgba(255, 190, 90, 0.45)",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
