import { NextResponse } from "next/server";
import { fetchGmailSummary, getAuthenticatedUser } from "@jude/store";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const summary = await fetchGmailSummary(user.id, 5);
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read Gmail.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST() {
  return GET();
}
