import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jude — Your home. Your friend.",
  description:
    "A wall-mounted home AI that helps with everything around the house. Connected to your friends, family, email, calendar, and more.",
  openGraph: {
    title: "Jude",
    description: "Your home. Your friend.",
    siteName: "Jude",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1510",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
