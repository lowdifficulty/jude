import type { Metadata } from "next";

export const SITE_URL = "https://jude.one";
export const SITE_NAME = "Jude";

export const defaultTitle = "Jude — Your home. Your friend.";
export const defaultDescription =
  "A wall-mounted home AI that helps with everything around the house. Talk to Jude, explore smart home support, and see the future of home companionship.";

export function createSiteMetadata(overrides: Metadata = {}): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      template: "%s | Jude",
    },
    description: defaultDescription,
    applicationName: SITE_NAME,
    keywords: [
      "Jude",
      "home AI",
      "wall-mounted assistant",
      "voice assistant",
      "smart home",
      "aging in place",
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: defaultTitle,
      description: defaultDescription,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Jude — a warm orange orb on a wall-mounted home AI display",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      images: ["/twitter-image"],
    },
    ...overrides,
  };
}
