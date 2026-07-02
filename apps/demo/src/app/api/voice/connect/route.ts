import { NextResponse } from "next/server";
import { getAuthenticatedUser, hasGmailTokens } from "@jude/store";
import { getRealtimeSessionConfig } from "@/lib/realtime-session";
import { parseJudeVoiceMode } from "@/lib/voice-profiles";

export const runtime = "nodejs";

function parseOpenAiError(body: string) {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    return parsed.error?.message || body.slice(0, 300);
  } catch {
    return body.slice(0, 300) || "OpenAI Realtime connection failed";
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

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
  const sessionJson = JSON.stringify(
    getRealtimeSessionConfig(mode, {
      gmailConnected: await hasGmailTokens(user.id),
    })
  );

  const form = new FormData();
  form.set("sdp", sdp);
  form.set("session", new Blob([sessionJson], { type: "application/json" }));

  const response = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const body = await response.text();

  if (!response.ok) {
    return NextResponse.json({ error: parseOpenAiError(body) }, { status: response.status });
  }

  return new NextResponse(body, {
    headers: { "Content-Type": "application/sdp" },
  });
}
