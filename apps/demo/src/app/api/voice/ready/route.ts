import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@jude/store";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ready: false, error: "Sign in required." }, { status: 401 });
  }

  const openai = Boolean(process.env.OPENAI_API_KEY?.trim());
  const elevenlabs = Boolean(process.env.ELEVENLABS_API_KEY?.trim());

  if (!openai) {
    return NextResponse.json(
      {
        ready: false,
        error:
          "Voice is not configured locally. Add OPENAI_API_KEY to apps/demo/.env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  if (!elevenlabs) {
    return NextResponse.json(
      {
        ready: false,
        error:
          "Jude's voice is not configured locally. Add ELEVENLABS_API_KEY to apps/demo/.env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ready: true });
}
