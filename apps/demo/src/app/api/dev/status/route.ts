import { NextResponse } from "next/server";
import { hasPersistentStorage } from "@jude/store/storage";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const openai = Boolean(process.env.OPENAI_API_KEY?.trim());
  const elevenlabs = Boolean(process.env.ELEVENLABS_API_KEY?.trim());

  return NextResponse.json({
    ok: openai && elevenlabs,
    urls: {
      demo: "http://localhost:3002",
      marketing: "http://localhost:3001",
    },
    voice: {
      openai,
      elevenlabs,
      ready: openai && elevenlabs,
    },
    storage: {
      mode: process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local-disk",
      persistent: hasPersistentStorage(),
    },
    hints: [
      !openai ? "Add OPENAI_API_KEY to apps/demo/.env.local" : null,
      !elevenlabs ? "Add ELEVENLABS_API_KEY to apps/demo/.env.local" : null,
      "Run npm run setup:local from repo root to sync session secret",
      "Demo is port 3002, marketing is 3001 (not 3000)",
    ].filter(Boolean),
  });
}
