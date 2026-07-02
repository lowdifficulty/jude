import { NextResponse } from "next/server";
import { listHistory, revertToSnapshot } from "@jude/store/training";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ snapshots: listHistory() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const snapshotId = String(body.snapshotId || "");
  if (!snapshotId) {
    return NextResponse.json({ error: "snapshotId is required." }, { status: 400 });
  }

  try {
    const snapshot = revertToSnapshot(snapshotId);
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Revert failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
