import { NextResponse } from "next/server";
import { getRealtimeSessionConfig } from "@/lib/realtime-session";
import { parseJudeVoiceMode } from "@/lib/voice-profiles";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const sdp = await request.text();
  if (!sdp.trim()) {
    return NextResponse.json({ error: "SDP offer is required." }, { status: 400 });
  }

  const mode = parseJudeVoiceMode(request.headers.get("x-jude-mode"));

  const form = new FormData();
  form.set("sdp", sdp);
  form.set("session", JSON.stringify(getRealtimeSessionConfig(mode)));

  const response = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const body = await response.text();

  if (!response.ok) {
    let message = "OpenAI Realtime connection failed";
    try {
      const parsed = JSON.parse(body);
      message = parsed.error?.message || message;
    } catch {
      if (body) message = body.slice(0, 300);
    }
    return NextResponse.json({ error: message }, { status: response.status });
  }

  return new NextResponse(body, {
    headers: { "Content-Type": "application/sdp" },
  });
}
