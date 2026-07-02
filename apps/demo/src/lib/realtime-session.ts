import { JUDE_BASE_INSTRUCTIONS } from "@/lib/jude-system-prompt";

export const REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";

export function getRealtimeSessionConfig() {
  return {
    type: "realtime" as const,
    model: REALTIME_MODEL,
    output_modalities: ["text"],
    instructions: JUDE_BASE_INSTRUCTIONS,
    tool_choice: "auto" as const,
    tools: [
      {
        type: "function" as const,
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
    audio: {
      input: {
        transcription: { model: "whisper-1" },
        turn_detection: { type: "server_vad" },
      },
    },
  };
}
