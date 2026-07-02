import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BenefitPage } from "@/components/site/BenefitPage";
import { getAllPages, getPageBySlug } from "@/lib/content";
import { createPageMetadata } from "@/lib/site-metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page) return {};

  return createPageMetadata(page);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page) notFound();
  return <BenefitPage page={page} />;
}
