import type { Metadata } from "next";

export const SITE_URL = "https://urjude.com";
export const SITE_NAME = "Jude";

export const defaultTitle = "Jude — Home, Health, and Happiness on the wall";
export const defaultDescription =
  "Meet Jude — a warm, wall-mounted AI companion that helps older adults live safer, healthier, and happier at home while giving families peace of mind.";

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
      "aging in place",
      "senior technology",
      "caregiver support",
      "wall-mounted assistant",
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
          alt: "Jude — Home, Health, and Happiness on the wall",
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

export function createPageMetadata(page: {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}): Metadata {
  const path = `/${page.slug}`;

  return {
    title: page.metaTitle.replace(/\s*\|\s*Jude\s*$/i, ""),
    description: page.metaDescription,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "article",
      url: path,
      title: page.metaTitle,
      description: page.metaDescription,
      siteName: SITE_NAME,
      images: [
        {
          url: `${path}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: page.metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: [`${path}/twitter-image`],
    },
  };
}
