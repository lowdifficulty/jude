import { ImageResponse } from "next/og";
import { getPageBySlug } from "@/lib/content";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  const title = page?.title || "Jude";
  const description =
    page?.metaDescription ||
    "A warm, wall-mounted AI companion for home, health, happiness, and family.";

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
          background: "linear-gradient(180deg, #faf8f5 0%, #f3efe8 100%)",
          color: "#1e2b1f",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#c07830",
            }}
          >
            Jude
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "#5a6b5c",
              lineHeight: 1.45,
              maxWidth: 920,
            }}
          >
            {description}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, color: "#7a8b7c" }}>urjude.com</div>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 40% 35%, #fff8e8 0%, #ffd080 30%, #e8a040 60%, #c07020 100%)",
              boxShadow: "0 0 40px rgba(255, 190, 90, 0.28)",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
