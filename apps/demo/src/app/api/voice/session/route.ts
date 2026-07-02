import { NextResponse } from "next/server";
import { JUDE_BASE_INSTRUCTIONS } from "@/lib/jude-system-prompt";

export const runtime = "nodejs";

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      modalities: ["text"],
      voice: "verse",
      input_audio_transcription: { model: "whisper-1" },
      instructions: JUDE_BASE_INSTRUCTIONS,
      tools: [
        {
          type: "function",
          name: "search_jude_knowledge",
          description:
            "Search Jude's product knowledge base for features, benefits, pricing, pages, and how Jude helps with home, health, happiness, and family topics.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "What to look up in Jude's knowledge base",
              },
            },
            required: ["query"],
          },
        },
      ],
      tool_choice: "auto",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
