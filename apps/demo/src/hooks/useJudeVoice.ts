"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

function waitForIceGathering(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const check = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", check);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", check);
    setTimeout(resolve, 2500);
  });
}

function extractAssistantText(message: Record<string, unknown>) {
  if (typeof message.text === "string" && message.text.trim()) {
    return message.text.trim();
  }

  if (message.type === "response.done") {
    const response = message.response as {
      output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
    };
    const parts: string[] = [];
    for (const item of response?.output || []) {
      for (const block of item.content || []) {
        if (
          (block.type === "output_text" || block.type === "text") &&
          block.text?.trim()
        ) {
          parts.push(block.text.trim());
        }
      }
    }
    if (parts.length) return parts.join("\n");
  }

  return "";
}

function configurePlaybackAudio(audio: HTMLAudioElement) {
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  audio.preload = "auto";
}

function unlockAudioPlayback() {
  const audio = new Audio();
  audio.src =
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
  configurePlaybackAudio(audio);
  audio.play().catch(() => {});
}

export function useJudeVoice(options: UseJudeVoiceOptions = {}) {
  const [state, setState] = useState<JudeVoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackDoneRef = useRef<(() => void) | null>(null);
  const activeRef = useRef(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const updateState = useCallback((next: JudeVoiceState) => {
    setState(next);
    optionsRef.current.onStateChange?.(next);
  }, []);

  const teardown = useCallback(() => {
    activeRef.current = false;
    dcRef.current?.close();
    pcRef.current?.close();
    dcRef.current = null;
    pcRef.current = null;

    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    playbackDoneRef.current?.();
    playbackDoneRef.current = null;
  }, []);

  const stop = useCallback(() => {
    teardown();
    setError(null);
    updateState("idle");
  }, [teardown, updateState]);

  const playElevenLabs = useCallback(
    async (text: string) => {
      updateState("speaking");
      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        return false;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      configurePlaybackAudio(audio);
      audioRef.current = audio;

      try {
        await new Promise<void>((resolve, reject) => {
          playbackDoneRef.current = resolve;
          audio.onended = () => {
            playbackDoneRef.current = null;
            resolve();
          };
          audio.onerror = () => {
            playbackDoneRef.current = null;
            reject(new Error("Audio playback failed"));
          };
          audio.play().catch((err) => {
            playbackDoneRef.current = null;
            reject(err);
          });
        });
      } catch {
        return false;
      } finally {
        URL.revokeObjectURL(url);
      }

      return true;
    },
    [updateState]
  );

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

  const interrupt = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    playbackDoneRef.current?.();
    playbackDoneRef.current = null;

    if (activeRef.current) {
      updateState("listening");
    }
  }, [updateState]);

  const start = useCallback(async () => {
    if (activeRef.current) return;

    unlockAudioPlayback();
    setError(null);
    updateState("connecting");
    activeRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (!activeRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      micStreamRef.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        if (activeRef.current) updateState("listening");
      };

      dc.onclose = () => {
        if (activeRef.current) {
          teardown();
          updateState("idle");
        }
      };

      dc.onmessage = async (event) => {
        const message = JSON.parse(event.data) as Record<string, unknown>;

        if (
          message.type === "response.text.done" ||
          message.type === "response.output_text.done" ||
          message.type === "response.done"
        ) {
          const text = extractAssistantText(message);
          if (text) {
            optionsRef.current.onTranscript?.(text, "assistant");
            const spoke = await playElevenLabs(text);
            if (!spoke && activeRef.current) {
              setError("Voice playback unavailable — read Jude's reply above.");
            }
            if (activeRef.current) updateState("listening");
          }
        }

        if (message.type === "response.function_call_arguments.done") {
          updateState("thinking");
          await handleFunctionCall(
            String(message.name || ""),
            String(message.arguments || ""),
            String(message.call_id || "")
          );
        }

        if (
          message.type === "conversation.item.input_audio_transcription.completed" ||
          message.type === "conversation.item.input_audio_transcription.done"
        ) {
          const transcript = String(message.transcript || "").trim();
          if (transcript) optionsRef.current.onTranscript?.(transcript, "user");
        }

        if (message.type === "error") {
          const err = message.error as { message?: string } | undefined;
          setError(err?.message || "Voice session error");
          updateState("error");
          teardown();
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);

      const sdpResponse = await fetch("/api/voice/connect", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: pc.localDescription?.sdp || offer.sdp,
      });

      if (!sdpResponse.ok) {
        const data = await sdpResponse.json().catch(() => ({}));
        throw new Error(data.error || "Could not connect to OpenAI Realtime");
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (err) {
      teardown();
      const message = err instanceof Error ? err.message : "Voice failed to start";
      setError(message);
      updateState("error");
    }
  }, [handleFunctionCall, playElevenLabs, teardown, updateState]);

  return {
    state,
    error,
    isActive: state !== "idle" && state !== "error",
    start,
    stop,
    interrupt,
  };
}
