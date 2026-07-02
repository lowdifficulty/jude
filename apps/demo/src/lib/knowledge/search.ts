import fs from "fs";
import path from "path";
import type { KnowledgeIndex, KnowledgeSearchResult } from "./types";

let cachedIndex: KnowledgeIndex | null = null;

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function keywordScore(query: string, text: string) {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);
  if (!terms.length) return 0;
  const haystack = text.toLowerCase();
  let hits = 0;
  for (const term of terms) {
    if (haystack.includes(term)) hits++;
  }
  return hits / terms.length;
}

export async function loadKnowledgeIndex(): Promise<KnowledgeIndex> {
  if (cachedIndex) return cachedIndex;
  const file = path.join(process.cwd(), "knowledge/index.json");
  cachedIndex = JSON.parse(fs.readFileSync(file, "utf8")) as KnowledgeIndex;
  return cachedIndex;
}

export async function searchKnowledge(
  query: string,
  limit = 6
): Promise<KnowledgeSearchResult[]> {
  const index = await loadKnowledgeIndex();
  const apiKey = process.env.OPENAI_API_KEY;

  if (index.embedded && apiKey) {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const vector = embedding.data[0].embedding;
    return index.chunks
      .map((chunk) => ({
        id: chunk.id,
        title: chunk.title,
        slug: chunk.slug,
        text: chunk.text,
        score: chunk.embedding ? cosineSimilarity(vector, chunk.embedding) : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  return index.chunks
    .map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      slug: chunk.slug,
      text: chunk.text,
      score: keywordScore(query, `${chunk.title}\n${chunk.text}`),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function formatKnowledgeContext(results: KnowledgeSearchResult[]) {
  if (!results.length) {
    return "No specific Jude knowledge matched this question. Answer warmly from general Jude positioning: wall-mounted home AI for Home, Health, and Happiness.";
  }

  return results
    .map(
      (r, i) =>
        `[Source ${i + 1}: ${r.title}${r.slug !== "/" ? ` (${r.slug})` : ""}]\n${r.text}`
    )
    .join("\n\n---\n\n");
}
