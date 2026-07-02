import { NextResponse } from "next/server";
import {
  getElevenLabsProfile,
  parseJudeVoiceMode,
} from "@/lib/voice-profiles";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const mode = parseJudeVoiceMode(
    typeof body.mode === "string" ? body.mode : request.headers.get("x-jude-mode")
  );

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const profile = getElevenLabsProfile(mode);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${profile.voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: profile.modelId,
        voice_settings: profile.voiceSettings,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: response.status });
  }

  const audio = await response.arrayBuffer();
  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      "X-Jude-Voice-Mode": mode,
    },
  });
}
