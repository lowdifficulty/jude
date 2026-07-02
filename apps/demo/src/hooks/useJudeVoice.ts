"use client";

import { useCallback, useRef, useState } from "react";

export type JudeVoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

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
    setTimeout(resolve, 2000);
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

export function useJudeVoice() {
  const [state, setState] = useState<JudeVoiceState>("idle");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackDoneRef = useRef<(() => void) | null>(null);
  const activeRef = useRef(false);

  const updateState = useCallback((next: JudeVoiceState) => {
    setState(next);
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

      if (!response.ok || !activeRef.current) {
        return;
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
        // Keep the session alive even if mobile blocks autoplay.
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    [updateState]
  );

  const handleFunctionCall = useCallback(
    async (name: string, argsJson: string, callId: string) => {
      const dc = dcRef.current;
      if (!dc || !activeRef.current) return;

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

      if (!activeRef.current) return;

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

  const connect = useCallback(async () => {
    if (activeRef.current) return;

    unlockAudioPlayback();
    activeRef.current = true;
    updateState("connecting");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone is not available in this browser.");
      }

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
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        if (activeRef.current) updateState("listening");
      };

      dc.onclose = () => {
        if (activeRef.current) stop();
      };

      dc.onmessage = async (event) => {
        if (!activeRef.current) return;

        const message = JSON.parse(event.data) as Record<string, unknown>;

        if (
          message.type === "response.text.done" ||
          message.type === "response.output_text.done" ||
          message.type === "response.done"
        ) {
          const text = extractAssistantText(message);
          if (text) {
            await playElevenLabs(text);
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

        if (message.type === "error") {
          teardown();
          updateState("error");
        }
      };

      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);

      if (!activeRef.current) return;

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
    } catch {
      teardown();
      updateState("error");
    }
  }, [handleFunctionCall, playElevenLabs, stop, teardown, updateState]);

  const toggle = useCallback(() => {
    if (activeRef.current || state === "connecting") {
      stop();
      return;
    }

    void connect();
  }, [connect, state, stop]);

  return {
    state,
    toggle,
    stop,
  };
}
