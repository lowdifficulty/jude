import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1510",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 35%, #fff8e8 0%, #ffd080 30%, #e8a040 60%, #c07020 100%)",
          }}
        />
      </div>
    ),
    size
  );
}
