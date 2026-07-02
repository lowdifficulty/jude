import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content/jude-website-package");
const OUT_DIR = path.join(ROOT, "apps/demo/knowledge");
const OUT_FILE = path.join(OUT_DIR, "index.json");

const EXTRA_FILES = [
  "00-website-architecture.md",
  "01-global-copy-and-design-system.md",
  "02-homepage-full.md",
  "05-master-benefit-outline.md",
  "content-model.json",
];

function parseMarkdown(raw) {
  try {
    return matter(raw);
  } catch {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { data: {}, content: raw };
    const body = match[2];
    const data = {};
    for (const line of match[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      data[key] = value;
    }
    return { data, content: body };
  }
}

function chunkText(text, maxLen = 900) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length > maxLen && current) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current) chunks.push(current.trim());
  return chunks;
}

function collectSources() {
  const sources = [];

  for (const file of EXTRA_FILES) {
    const full = path.join(CONTENT_DIR, file);
    if (!fs.existsSync(full)) continue;
    const raw = fs.readFileSync(full, "utf8");
    if (file.endsWith(".json")) {
      sources.push({
        id: file,
        title: "Jude content model",
        slug: "/",
        text: raw,
      });
      continue;
    }
    const { data, content } = parseMarkdown(raw);
    sources.push({
      id: file,
      title: data.title || file,
      slug: data.slug || "/",
      text: content,
    });
  }

  const pagesDir = path.join(CONTENT_DIR, "pages");
  for (const file of fs.readdirSync(pagesDir)) {
    if (!file.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(pagesDir, file), "utf8");
    const { data, content } = parseMarkdown(raw);
    sources.push({
      id: `pages/${file}`,
      title: data.title || file.replace(".md", ""),
      slug: (data.slug || `/${file.replace(".md", "")}/`).replace(/\/$/, "") || "/",
      text: content,
      meta: {
        meta_description: data.meta_description,
        primary_keyword: data.primary_keyword,
      },
    });
  }

  return sources;
}

async function embedChunks(chunks, openai) {
  const batchSize = 50;
  const embedded = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch.map((c) => c.text.slice(0, 8000)),
    });

    batch.forEach((chunk, idx) => {
      embedded.push({
        ...chunk,
        embedding: response.data[idx].embedding,
      });
    });

    console.log(`Embedded ${Math.min(i + batchSize, chunks.length)} / ${chunks.length}`);
  }

  return embedded;
}

async function main() {
  const sources = collectSources();
  const chunks = [];

  for (const source of sources) {
    for (const [index, text] of chunkText(source.text).entries()) {
      chunks.push({
        id: `${source.id}#${index}`,
        title: source.title,
        slug: source.slug,
        text,
        meta: source.meta || null,
      });
    }
  }

  console.log(`Collected ${chunks.length} chunks from ${sources.length} sources`);

  const apiKey = process.env.OPENAI_API_KEY;
  let outputChunks = chunks;

  if (apiKey) {
    const openai = new OpenAI({ apiKey });
    outputChunks = await embedChunks(chunks, openai);
    console.log("Embeddings generated.");
  } else {
    console.warn("OPENAI_API_KEY not set — building keyword-only index (run again with key for semantic search).");
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        version: 1,
        builtAt: new Date().toISOString(),
        embedded: Boolean(apiKey),
        chunkCount: outputChunks.length,
        chunks: outputChunks,
      },
      null,
      2
    )
  );

  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
