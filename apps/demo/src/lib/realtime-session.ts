import { getJudeInstructions } from "@/lib/jude-system-prompt";
import type { JudeVoiceMode } from "@/lib/voice-profiles";

export const REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";

type SessionOptions = {
  gmailConnected?: boolean;
};

export function getRealtimeSessionConfig(
  mode: JudeVoiceMode = "good",
  options: SessionOptions = {}
) {
  const tools = buildRealtimeTools(options);

  return {
    type: "realtime" as const,
    model: REALTIME_MODEL,
    output_modalities: ["text"],
    instructions: getJudeInstructions(mode),
    tool_choice: "auto" as const,
    tools,
    audio: {
      input: {
        transcription: { model: "whisper-1" },
        turn_detection: { type: "server_vad" },
      },
    },
  };
}

function buildRealtimeTools(options: SessionOptions) {
  const tools: Array<{
    type: "function";
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  }> = [
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
  ];

  if (options.gmailConnected) {
    tools.push({
      type: "function" as const,
      name: "get_gmail_summary",
      description:
        "Read the user's connected Gmail inbox and summarize recent unread messages from doctors, family, bills, and other important senders.",
      parameters: {
        type: "object",
        properties: {
          focus: {
            type: "string",
            description: "Optional focus such as doctors, family, bills, or all unread mail",
          },
        },
        required: [],
      },
    });
  }

  return tools;
}

/** GA Realtime API requires session.type on every session.update event. */
export function getRealtimeSessionUpdate(
  mode: JudeVoiceMode = "good",
  options: SessionOptions = {}
) {
  return {
    type: "realtime" as const,
    instructions: getJudeInstructions(mode),
    tool_choice: "auto" as const,
    tools: buildRealtimeTools(options),
    output_modalities: ["text"],
    audio: {
      input: {
        transcription: { model: "whisper-1" },
        turn_detection: { type: "server_vad" },
      },
    },
  };
}
