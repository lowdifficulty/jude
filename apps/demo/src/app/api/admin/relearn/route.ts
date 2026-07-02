import { NextResponse } from "next/server";
import { runKnowledgeRebuild } from "@jude/store/training";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { invalidateKnowledgeCache } from "@/lib/knowledge/search";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = runKnowledgeRebuild();
    invalidateKnowledgeCache();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Relearn failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
