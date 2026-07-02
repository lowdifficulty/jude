import "server-only";
import siteData from "@/data/site-data.json";
import type { JudePage } from "./content-types";

export type { JudePage } from "./content-types";

function normalizeSlug(slug: string) {
  return slug.replace(/^\/|\/$/g, "");
}

export function getAllPages(): JudePage[] {
  return siteData.pages as JudePage[];
}

export function getPageBySlug(slug: string): JudePage | null {
  const normalized = normalizeSlug(slug);
  return getAllPages().find((p) => p.slug === normalized) || null;
}

export function extractFaqs(body: string) {
  const faqSection = body.split(/## FAQs/i)[1]?.split(/## Related/i)[0] || "";
  const matches = [...faqSection.matchAll(/### (.+)\n+([\s\S]*?)(?=\n### |\n## |$)/g)];
  return matches.map((m) => ({
    question: m[1].trim(),
    answer: m[2].trim().replace(/\n+/g, " "),
  }));
}
