"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getConnectGreetingText } from "@/lib/jude-system-prompt";
import { getRealtimeSessionUpdate } from "@/lib/realtime-session";
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

function waitForVoiceLink(
  pc: RTCPeerConnection,
  dc: RTCDataChannel,
  timeoutMs = 20000
) {
  if (dc.readyState === "open") return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const finish = (ok: boolean, message?: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (ok) resolve();
      else reject(new Error(message || "Voice connection failed."));
    };

    const timer = window.setTimeout(() => {
      if (dc.readyState === "open") finish(true);
      else if (
        pc.iceConnectionState === "connected" ||
        pc.iceConnectionState === "completed"
      ) {
        finish(true);
      } else {
        finish(false, `Voice connection timed out (${pc.iceConnectionState}).`);
      }
    }, timeoutMs);

    const onDcOpen = () => finish(true);

    const onIceChange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        finish(true);
      } else if (pc.iceConnectionState === "failed") {
        finish(false, "Voice connection failed. Check your network and try again.");
      }
    };

    const onConnectionChange = () => {
      if (pc.connectionState === "connected") finish(true);
      if (pc.connectionState === "failed") {
        finish(false, "Voice connection failed. Check your network and try again.");
      }
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      dc.removeEventListener("open", onDcOpen);
      pc.removeEventListener("iceconnectionstatechange", onIceChange);
      pc.removeEventListener("connectionstatechange", onConnectionChange);
    };

    dc.addEventListener("open", onDcOpen);
    pc.addEventListener("iceconnectionstatechange", onIceChange);
    pc.addEventListener("connectionstatechange", onConnectionChange);
  });
}

function extractAssistantText(message: Record<string, unknown>) {
  if (typeof message.text === "string" && message.text.trim()) {
    return message.text.trim();
  }

  if (message.type === "response.output_text.done" && typeof message.text === "string") {
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

function responseHasFunctionCall(message: Record<string, unknown>) {
  const response = message.response as { output?: Array<{ type?: string }> } | undefined;
  return (response?.output || []).some((item) => item.type === "function_call");
}

function appendTextDelta(
  message: Record<string, unknown>,
  bufferRef: { current: string }
) {
  const delta =
    (typeof message.delta === "string" && message.delta) ||
    (typeof message.text === "string" && message.text) ||
    "";
  if (delta) bufferRef.current += delta;
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

function isRecoverableMicError(error: unknown) {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === "NotFoundError" ||
    error.name === "DevicesNotFoundError" ||
    error.name === "OverconstrainedError"
  );
}

function describeVoiceStartError(error: unknown) {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No microphone was found. Plug one in, or enable it in Windows Settings → Privacy & security → Microphone, then allow your browser to use it.";
      case "NotAllowedError":
      case "PermissionDeniedError":
        return "Microphone access was blocked. Use the lock icon in your browser’s address bar to allow the microphone, then try again.";
      case "NotReadableError":
      case "TrackStartError":
        return "Your microphone is busy or unavailable. Close other apps using it, then try again.";
      case "SecurityError":
        return "Microphone access requires a secure page. Use https:// or http://localhost.";
      case "OverconstrainedError":
        return "Your microphone could not be opened with the requested settings. Try another input device in system sound settings.";
      default:
        break;
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (/requested device not found/i.test(message)) {
      return "No microphone was found. Plug one in, or enable it in Windows Settings → Privacy & security → Microphone, then allow your browser to use it.";
    }
    if (message) return message;
  }

  return "Could not start voice.";
}

async function requestMicrophoneStream() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone is not available in this browser.");
  }

  const attempts: MediaStreamConstraints[] = [
    {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    },
    { audio: true },
  ];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
      if (!isRecoverableMicError(error)) break;
    }
  }

  throw lastError;
}

async function assertVoiceReady() {
  const response = await fetch("/api/voice/ready", {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Voice is not configured on the server."
    );
  }
}

export function useJudeVoice(mode: JudeVoiceMode = "good", gmailConnected = false) {
  const [state, setState] = useState<JudeVoiceState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [caption, setCaption] = useState("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
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

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }

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
        session: getRealtimeSessionUpdate(nextMode, { gmailConnected }),
      })
    );
  }, [gmailConnected]);

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

  const cancelAssistantResponse = useCallback(() => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open" || !activeRef.current) return;
    dc.send(JSON.stringify({ type: "response.cancel" }));
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
    (text: string) => {
      if (!text.trim() || !activeRef.current) return;
      setCaption(text.trim());
      void (async () => {
        try {
          await playElevenLabs(text);
          if (activeRef.current) updateState("listening");
        } catch (error) {
          if (!activeRef.current) return;
          setErrorMessage(error instanceof Error ? error.message : "Playback failed.");
          updateState("error");
          teardown();
        }
      })();
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
      await assertVoiceReady();

      const stream = await requestMicrophoneStream();

      if (!activeRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      micStreamRef.current = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const remoteAudio = document.createElement("audio");
      configurePlaybackAudio(remoteAudio);
      remoteAudio.autoplay = true;
      remoteAudio.volume = 0;
      remoteAudioRef.current = remoteAudio;

      pc.ontrack = (event) => {
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        remoteAudio.srcObject = stream;
        remoteAudio.play().catch(() => {});
      };

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        if (!activeRef.current) return;
      };

      dc.onclose = () => {
        if (activeRef.current) stop();
      };

      dc.onmessage = (event) => {
        if (!activeRef.current) return;

        const message = JSON.parse(event.data) as Record<string, unknown>;
        const type = String(message.type || "");

        if (type === "session.created" || type === "session.updated") {
          return;
        }

        if (type === "input_audio_buffer.speech_started") {
          interruptPlayback();
          cancelAssistantResponse();
          updateState("listening");
          return;
        }

        if (type === "input_audio_buffer.speech_stopped" || type === "response.created") {
          updateState("thinking");
          return;
        }

        if (
          type === "response.output_text.delta" ||
          type === "response.text.delta" ||
          type === "response.output_audio_transcript.delta"
        ) {
          appendTextDelta(message, textBufferRef);
          return;
        }

        if (
          type === "response.text.done" ||
          type === "response.output_text.done" ||
          type === "response.output_audio_transcript.done"
        ) {
          appendTextDelta(message, textBufferRef);
          return;
        }

        if (type === "response.done") {
          if (responseHasFunctionCall(message)) {
            textBufferRef.current = "";
            return;
          }

          const text = extractAssistantText(message) || textBufferRef.current.trim();
          textBufferRef.current = "";
          if (text) {
            updateState("thinking");
            speakAssistantText(text);
          } else if (activeRef.current) {
            updateState("listening");
          }
          return;
        }

        if (type === "response.function_call_arguments.done") {
          updateState("thinking");
          void handleFunctionCall(
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

      const sdpResponse = await fetch("/api/voice/connect", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Jude-Mode": modeRef.current,
          "Content-Type": "application/sdp",
        },
        body: pc.localDescription?.sdp || offer.sdp || "",
      });

      if (!sdpResponse.ok) {
        const data = await sdpResponse.json().catch(() => ({}));
        throw new Error(data.error || "Could not connect to OpenAI Realtime.");
      }

      const answerSdp = await sdpResponse.text();
      if (!answerSdp.trim().startsWith("v=")) {
        throw new Error("OpenAI returned an invalid voice session answer.");
      }

      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      await waitForVoiceLink(pc, dc);

      if (!activeRef.current) return;

      updateState("listening");
      greetedRef.current = true;
      speakAssistantText(getConnectGreetingText(modeRef.current));
    } catch (error) {
      teardown();
      setErrorMessage(describeVoiceStartError(error));
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
    caption,
    connect,
    toggle,
    stop,
  };
}
