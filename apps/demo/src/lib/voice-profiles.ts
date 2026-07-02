export type JudeVoiceMode = "good" | "evil";

export type ElevenLabsVoiceProfile = {
  voiceId: string;
  modelId: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
};

/** Custom Jude voices (ElevenLabs Voice Design) — override with env vars if needed. */
const DEFAULT_GOOD_VOICE = "NsgfkY3cyxRG0efoRKYW"; // Jude Good — Southern Matriarch
const DEFAULT_EVIL_VOICE = "jEPqu2Z6cBH4GJyan8ZY"; // Jude Evil — Devilish Robot

export function getElevenLabsProfile(mode: JudeVoiceMode): ElevenLabsVoiceProfile {
  if (mode === "evil") {
    return {
      voiceId:
        process.env.ELEVENLABS_VOICE_ID_EVIL ||
        process.env.ELEVENLABS_VOICE_ID ||
        DEFAULT_EVIL_VOICE,
      modelId: process.env.ELEVENLABS_MODEL_EVIL || "eleven_turbo_v2_5",
      voiceSettings: {
        stability: 0.18,
        similarity_boost: 0.42,
        style: 0.95,
        use_speaker_boost: true,
      },
    };
  }

  return {
    voiceId:
      process.env.ELEVENLABS_VOICE_ID_GOOD ||
      process.env.ELEVENLABS_VOICE_ID ||
      DEFAULT_GOOD_VOICE,
    modelId: process.env.ELEVENLABS_MODEL_GOOD || "eleven_turbo_v2_5",
    voiceSettings: {
      stability: 0.62,
      similarity_boost: 0.82,
      style: 0.12,
      use_speaker_boost: true,
    },
  };
}

export function parseJudeVoiceMode(value: string | null | undefined): JudeVoiceMode {
  return value === "evil" ? "evil" : "good";
}
