import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #243d2a 0%, #1a2e1f 100%)",
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 35%, #fff8e8 0%, #ffd080 30%, #e8a040 60%, #c07020 100%)",
            boxShadow: "0 0 40px rgba(255, 190, 90, 0.35)",
          }}
        />
      </div>
    ),
    size
  );
}
