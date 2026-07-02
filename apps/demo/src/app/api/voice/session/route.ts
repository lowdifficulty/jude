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

  const mode = parseJudeVoiceMode(request.headers.get("x-jude-mode"));
  const sessionConfig = getRealtimeSessionConfig(mode, {
    gmailConnected: await hasGmailTokens(user.id),
  });

  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: sessionConfig,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error: parseOpenAiError(error) }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
