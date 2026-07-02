"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getConnectGreetingText,
  getJudeInstructions,
} from "@/lib/jude-system-prompt";
import type { JudeVoiceMode } from "@/lib/voice-profiles";

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

function waitForPeerConnection(pc: RTCPeerConnection, timeoutMs = 8000) {
  if (pc.connectionState === "connected") return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      pc.removeEventListener("connectionstatechange", onChange);
      if (pc.connectionState === "connected") resolve();
      else reject(new Error("Voice connection timed out."));
    }, timeoutMs);

    const onChange = () => {
      if (pc.connectionState === "connected") {
        window.clearTimeout(timer);
        pc.removeEventListener("connectionstatechange", onChange);
        resolve();
      }
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        window.clearTimeout(timer);
        pc.removeEventListener("connectionstatechange", onChange);
        reject(new Error("Voice connection failed."));
      }
    };

    pc.addEventListener("connectionstatechange", onChange);
  });
}

function extractAssistantText(message: Record<string, unknown>) {
  if (typeof message.text === "string" && message.text.trim()) {
    return message.text.trim();
  }

  if (message.type === "response.done") {
    const response = message.response as {
      output?: Array<{
        type?: string;
        content?: Array<{ type?: string; text?: string }>;
        text?: string;
      }>;
    };

    const parts: string[] = [];
    for (const item of response?.output || []) {
      if (typeof item.text === "string" && item.text.trim()) {
        parts.push(item.text.trim());
      }
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

export function useJudeVoice(mode: JudeVoiceMode = "good", gmailConnected = false) {
  const [state, setState] = useState<JudeVoiceState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackDoneRef = useRef<(() => void) | null>(null);
  const activeRef = useRef(false);
  const greetedRef = useRef(false);
  const textBufferRef = useRef("");
  const modeRef = useRef(mode);
  modeRef.current = mode;

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
    textBufferRef.current = "";
  }, []);

  const stop = useCallback(() => {
    teardown();
    greetedRef.current = false;
    updateState("idle");
    setErrorMessage("");
  }, [teardown, updateState]);

  const applySessionMode = useCallback((nextMode: JudeVoiceMode) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open" || !activeRef.current) return;

    dc.send(
      JSON.stringify({
        type: "session.update",
        session: {
          instructions: getJudeInstructions(nextMode),
        },
      })
    );
  }, []);

  const interruptPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playbackDoneRef.current) {
      playbackDoneRef.current();
      playbackDoneRef.current = null;
    }
  }, []);

  const playElevenLabs = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeRef.current) return;

      updateState("speaking");
      const response = await fetch("/api/voice/speak", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Jude-Mode": modeRef.current,
        },
        body: JSON.stringify({ text, mode: modeRef.current }),
      });

      if (!response.ok || !activeRef.current) {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Could not play Jude's voice.");
        }
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
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    [updateState]
  );

  const speakAssistantText = useCallback(
    async (text: string) => {
      if (!text.trim() || !activeRef.current) return;
      try {
        await playElevenLabs(text);
        if (activeRef.current) updateState("listening");
      } catch (error) {
        if (!activeRef.current) return;
        setErrorMessage(error instanceof Error ? error.message : "Playback failed.");
        updateState("error");
        teardown();
      }
    },
    [playElevenLabs, teardown, updateState]
  );

  const handleFunctionCall = useCallback(
    async (name: string, argsJson: string, callId: string) => {
      const dc = dcRef.current;
      if (!dc || !activeRef.current) return;

      let output: Record<string, unknown> = { error: "Unknown function" };

      if (name === "search_jude_knowledge") {
        let query = "";
        try {
          const args = JSON.parse(argsJson) as { query?: string };
          query = args.query || "";
        } catch {
          query = argsJson;
        }

        const rag = await fetch("/api/voice/rag", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await rag.json();
        output = { context: data.context, results: data.results };
      } else if (name === "get_gmail_summary" && gmailConnected) {
        const summary = await fetch("/api/integrations/gmail/summary", {
          method: "POST",
          credentials: "include",
        });
        const data = await summary.json();
        output = summary.ok ? data : { error: data.error || "Could not read Gmail." };
      }

      if (!activeRef.current) return;

      dc.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: callId,
            output: JSON.stringify(output),
          },
        })
      );
      dc.send(JSON.stringify({ type: "response.create" }));
    },
    [gmailConnected]
  );

  const connect = useCallback(async () => {
    if (activeRef.current) return;

    unlockAudioPlayback();
    activeRef.current = true;
    greetedRef.current = false;
    textBufferRef.current = "";
    setErrorMessage("");
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
        if (!activeRef.current) return;
        applySessionMode(modeRef.current);
      };

      dc.onclose = () => {
        if (activeRef.current) stop();
      };

      dc.onmessage = async (event) => {
        if (!activeRef.current) return;

        const message = JSON.parse(event.data) as Record<string, unknown>;
        const type = String(message.type || "");

        if (type === "session.created" || type === "session.updated") {
          return;
        }

        if (type === "input_audio_buffer.speech_started") {
          updateState("listening");
          return;
        }

        if (type === "response.output_text.delta") {
          textBufferRef.current += String(message.delta || "");
          return;
        }

        if (
          type === "response.text.done" ||
          type === "response.output_text.done" ||
          type === "response.done"
        ) {
          const text = extractAssistantText(message) || textBufferRef.current.trim();
          textBufferRef.current = "";
          if (text) {
            updateState("thinking");
            await speakAssistantText(text);
          }
          return;
        }

        if (type === "response.function_call_arguments.done") {
          updateState("thinking");
          await handleFunctionCall(
            String(message.name || ""),
            String(message.arguments || ""),
            String(message.call_id || "")
          );
          return;
        }

        if (type === "error") {
          const err = message.error as { message?: string } | undefined;
          setErrorMessage(err?.message || "Voice session error.");
          teardown();
          updateState("error");
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);

      if (!activeRef.current) return;

      const sessionResponse = await fetch("/api/voice/session", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Jude-Mode": modeRef.current,
        },
      });

      if (!sessionResponse.ok) {
        const data = await sessionResponse.json().catch(() => ({}));
        throw new Error(data.error || "Could not start voice session.");
      }

      const sessionData = (await sessionResponse.json()) as {
        value?: string;
        client_secret?: { value?: string };
      };
      const ephemeralKey = sessionData.value || sessionData.client_secret?.value;
      if (!ephemeralKey) {
        throw new Error("Voice session token was missing from the server.");
      }

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
        body: pc.localDescription?.sdp || offer.sdp || "",
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        let message = "Could not connect to OpenAI Realtime.";
        try {
          const parsed = JSON.parse(errorText) as { error?: { message?: string } };
          message = parsed.error?.message || message;
        } catch {
          if (errorText) message = errorText.slice(0, 300);
        }
        throw new Error(message);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      await waitForPeerConnection(pc);

      if (!activeRef.current) return;

      updateState("listening");
      greetedRef.current = true;
      await speakAssistantText(getConnectGreetingText(modeRef.current));
    } catch (error) {
      teardown();
      setErrorMessage(error instanceof Error ? error.message : "Could not start voice.");
      updateState("error");
    }
  }, [
    applySessionMode,
    handleFunctionCall,
    speakAssistantText,
    stop,
    teardown,
    updateState,
  ]);

  const toggle = useCallback(() => {
    if (activeRef.current || state === "connecting") {
      stop();
      return;
    }

    void connect();
  }, [connect, state, stop]);

  useEffect(() => {
    if (!activeRef.current) return;

    interruptPlayback();
    applySessionMode(mode);

    setState((current) =>
      current === "speaking" || current === "thinking" ? "listening" : current
    );
  }, [mode, applySessionMode, interruptPlayback]);

  return {
    state,
    errorMessage,
    connect,
    toggle,
    stop,
  };
}
