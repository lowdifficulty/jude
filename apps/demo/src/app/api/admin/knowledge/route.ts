import { NextResponse } from "next/server";
import {
  appendAdminEntry,
  clearAdminOverrides,
  listHistory,
  readAdminOverrides,
  revertToSnapshot,
} from "@jude/store/training";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ entries: readAdminOverrides() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const category = String(body.category || "general").trim();
  const text = String(body.text || "").trim();

  if (!title || !text) {
    return NextResponse.json({ error: "Title and text are required." }, { status: 400 });
  }

  const entry = appendAdminEntry({ title, category, text });
  return NextResponse.json({ ok: true, entry, total: readAdminOverrides().length });
}

export async function DELETE() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  clearAdminOverrides();
  return NextResponse.json({ ok: true });
}
