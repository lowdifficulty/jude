import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import siteData from "@/data/site-data.json";
import type { JudePage } from "./content-types";

export type { JudePage } from "./content-types";

const CONTENT_ROOT = path.join(process.cwd(), "../../content/jude-website-package");
const PAGES_DIR = path.join(CONTENT_ROOT, "pages");

function parseMarkdown(raw: string) {
  try {
    return matter(raw);
  } catch {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { data: {}, content: raw };
    const data: Record<string, string> = {};
    for (const line of match[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    return { data, content: match[2] };
  }
}

function normalizeSlug(slug: string) {
  return slug.replace(/^\/|\/$/g, "");
}

function fileToPage(file: string): JudePage {
  const raw = fs.readFileSync(path.join(PAGES_DIR, file), "utf8");
  const { data, content } = parseMarkdown(raw);
  const slug = normalizeSlug(
    (data.slug as string) || `/${file.replace(".md", "")}/`
  );

  return {
    slug,
    title: (data.title as string) || slug,
    metaTitle: (data.meta_title as string) || `${data.title} | Jude`,
    metaDescription: (data.meta_description as string) || "",
    primaryKeyword: data.primary_keyword as string | undefined,
    audience: data.audience as string | undefined,
    body: content.trim(),
  };
}

export function getAllPages(): JudePage[] {
  return siteData.pages
    .map((p) => {
      const file = `${p.slug}.md`;
      if (!fs.existsSync(path.join(PAGES_DIR, file))) {
        const match = fs
          .readdirSync(PAGES_DIR)
          .find((f) => normalizeSlug(parseMarkdown(fs.readFileSync(path.join(PAGES_DIR, f), "utf8")).data.slug || "") === p.slug);
        if (!match) return null;
        return fileToPage(match);
      }
      return fileToPage(file);
    })
    .filter(Boolean) as JudePage[];
}

export function getPageBySlug(slug: string): JudePage | null {
  const normalized = normalizeSlug(slug);
  const file = fs
    .readdirSync(PAGES_DIR)
    .find((f) => {
      const raw = fs.readFileSync(path.join(PAGES_DIR, f), "utf8");
      const { data } = parseMarkdown(raw);
      const pageSlug = normalizeSlug((data.slug as string) || `/${f.replace(".md", "")}/`);
      return pageSlug === normalized;
    });

  if (!file) return null;
  return fileToPage(file);
}

export function extractFaqs(body: string) {
  const faqSection = body.split(/## FAQs/i)[1]?.split(/## Related/i)[0] || "";
  const matches = [...faqSection.matchAll(/### (.+)\n+([\s\S]*?)(?=\n### |\n## |$)/g)];
  return matches.map((m) => ({
    question: m[1].trim(),
    answer: m[2].trim().replace(/\n+/g, " "),
  }));
}
