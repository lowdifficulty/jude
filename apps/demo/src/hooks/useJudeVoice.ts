"use client";

import { useCallback, useRef, useState } from "react";

export type JudeVoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

type UseJudeVoiceOptions = {
  onTranscript?: (text: string, role: "user" | "assistant") => void;
  onStateChange?: (state: JudeVoiceState) => void;
};

export function useJudeVoice(options: UseJudeVoiceOptions = {}) {
  const [state, setState] = useState<JudeVoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef(false);

  const updateState = useCallback(
    (next: JudeVoiceState) => {
      setState(next);
      options.onStateChange?.(next);
    },
    [options]
  );

  const playElevenLabs = useCallback(async (text: string) => {
    updateState("speaking");
    const response = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("ElevenLabs speech failed");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
      audio.play().catch(reject);
    });

    URL.revokeObjectURL(url);
  }, [updateState]);

  const handleFunctionCall = useCallback(
    async (name: string, argsJson: string, callId: string) => {
      const dc = dcRef.current;
      if (!dc) return;

      if (name !== "search_jude_knowledge") {
        dc.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: callId,
              output: JSON.stringify({ error: "Unknown function" }),
            },
          })
        );
        dc.send(JSON.stringify({ type: "response.create" }));
        return;
      }

      let query = "";
      try {
        const args = JSON.parse(argsJson) as { query?: string };
        query = args.query || "";
      } catch {
        query = argsJson;
      }

      const rag = await fetch("/api/voice/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await rag.json();

      dc.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: callId,
            output: JSON.stringify({ context: data.context, results: data.results }),
          },
        })
      );
      dc.send(JSON.stringify({ type: "response.create" }));
    },
    []
  );

  const stop = useCallback(() => {
    activeRef.current = false;
    dcRef.current?.close();
    pcRef.current?.close();
    dcRef.current = null;
    pcRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    updateState("idle");
  }, [updateState]);

  const start = useCallback(async () => {
    if (activeRef.current) {
      stop();
      return;
    }

    setError(null);
    updateState("connecting");
    activeRef.current = true;

    try {
      const sessionRes = await fetch("/api/voice/session", { method: "POST" });
      if (!sessionRes.ok) {
        const data = await sessionRes.json().catch(() => ({}));
        throw new Error(data.error || "Could not start Jude voice session");
      }

      const session = await sessionRes.json();
      const ephemeralKey = session.client_secret?.value;
      if (!ephemeralKey) {
        throw new Error("Missing realtime session token");
      }

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = () => {
        // Audio output handled by ElevenLabs
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        updateState("listening");
        dc.send(
          JSON.stringify({
            type: "session.update",
            session: {
              modalities: ["text"],
              input_audio_transcription: { model: "whisper-1" },
              turn_detection: { type: "server_vad" },
            },
          })
        );
      };

      dc.onmessage = async (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "response.text.done") {
          const text = message.text?.trim();
          if (text) {
            options.onTranscript?.(text, "assistant");
            try {
              await playElevenLabs(text);
              if (activeRef.current) updateState("listening");
            } catch {
              setError("Could not play Jude's voice");
              updateState("error");
            }
          }
        }

        if (message.type === "response.function_call_arguments.done") {
          updateState("thinking");
          await handleFunctionCall(
            message.name,
            message.arguments,
            message.call_id
          );
        }

        if (message.type === "conversation.item.input_audio_transcription.completed") {
          const transcript = message.transcript?.trim();
          if (transcript) options.onTranscript?.(transcript, "user");
        }

        if (message.type === "error") {
          setError(message.error?.message || "Voice session error");
          updateState("error");
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        throw new Error("Could not connect to OpenAI Realtime");
      }

      const answer = { type: "answer" as const, sdp: await sdpResponse.text() };
      await pc.setRemoteDescription(answer);
    } catch (err) {
      activeRef.current = false;
      const message = err instanceof Error ? err.message : "Voice failed to start";
      setError(message);
      updateState("error");
      stop();
    }
  }, [handleFunctionCall, options, playElevenLabs, stop, updateState]);

  return {
    state,
    error,
    isActive: state !== "idle" && state !== "error",
    start,
    stop,
  };
}
