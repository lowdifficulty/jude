import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_ROOT = path.join(ROOT, "content/jude-website-package");
const PAGES_DIR = path.join(CONTENT_ROOT, "pages");
const OUT = path.join(ROOT, "apps/marketing/src/data/site-data.json");

function parseMarkdown(raw) {
  try {
    return matter(raw);
  } catch {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { data: {}, content: raw };
    const data = {};
    for (const line of match[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    return { data, content: match[2] };
  }
}

function normalizeSlug(slug) {
  return slug.replace(/^\/|\/$/g, "");
}

const navigation = JSON.parse(
  fs.readFileSync(path.join(CONTENT_ROOT, "navigation.json"), "utf8")
);

const pages = fs
  .readdirSync(PAGES_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((file) => {
    const raw = fs.readFileSync(path.join(PAGES_DIR, file), "utf8");
    const { data, content } = parseMarkdown(raw);
    const slug = normalizeSlug(data.slug || `/${file.replace(".md", "")}/`);
    return {
      slug,
      title: data.title || slug,
      metaTitle: data.meta_title || `${data.title} | Jude`,
      metaDescription: data.meta_description || "",
      primaryKeyword: data.primary_keyword || "",
      audience: data.audience || "",
      body: content.trim(),
    };
  });

const byTitle = new Map(pages.map((p) => [p.title.toLowerCase(), p]));
const footerGroups = {};

for (const [group, labels] of Object.entries(navigation.footer_groups)) {
  footerGroups[group] = labels
    .map((label) => {
      const page = byTitle.get(label.toLowerCase());
      if (!page) return null;
      return { label: page.title, href: `/${page.slug}` };
    })
    .filter(Boolean);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify({ navigation, pages, footerGroups }, null, 2)
);

console.log(`Wrote ${OUT} (${pages.length} pages)`);
