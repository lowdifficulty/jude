import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jude — Home AI that feels like family",
  description:
    "Meet Jude. A wall-mounted home AI that helps with everything around the house. Like Jarvis, but your grandmother can use him.",
  openGraph: {
    title: "Jude — Your home. Your friend.",
    description: "A home AI that's a member of the family.",
    siteName: "Jude",
  },
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
