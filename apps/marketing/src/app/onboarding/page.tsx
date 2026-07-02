import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { createSiteMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = {
  ...createSiteMetadata(),
  title: "Connect Jude — Onboarding",
  description:
    "Pick the home and health hardware you want Jude to connect to. Get recommended devices and integration links.",
  alternates: { canonical: "/onboarding" },
  openGraph: {
    ...createSiteMetadata().openGraph,
    title: "Connect Jude — Onboarding",
    url: "/onboarding",
  },
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
