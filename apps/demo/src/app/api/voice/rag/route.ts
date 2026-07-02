import { NextResponse } from "next/server";
import {
  formatKnowledgeContext,
  searchKnowledge,
} from "@/lib/knowledge/search";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const results = await searchKnowledge(query, 6);
  return NextResponse.json({
    query,
    results,
    context: formatKnowledgeContext(results),
  });
}
