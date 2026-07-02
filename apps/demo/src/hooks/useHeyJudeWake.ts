"use client";

import { useEffect, useRef } from "react";
import type { JudeVoiceState } from "@/hooks/useJudeVoice";

type WakeRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ 0?: { transcript?: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type WakeRecognitionCtor = new () => WakeRecognition;

declare global {
  interface Window {
    SpeechRecognition?: WakeRecognitionCtor;
    webkitSpeechRecognition?: WakeRecognitionCtor;
  }
}

const HEY_JUDE_PATTERN = /\bhey[\s,.-]*jude\b/i;

type UseHeyJudeWakeOptions = {
  enabled: boolean;
  voiceState: JudeVoiceState;
  onWake: () => void;
};

export function useHeyJudeWake({ enabled, voiceState, onWake }: UseHeyJudeWakeOptions) {
  const onWakeRef = useRef(onWake);
  onWakeRef.current = onWake;
  const recognitionRef = useRef<WakeRecognition | null>(null);
  const wakingRef = useRef(false);

  useEffect(() => {
    if (!enabled || voiceState !== "idle") {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      wakingRef.current = false;
      return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      if (wakingRef.current) return;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index]?.[0]?.transcript || "";
        if (HEY_JUDE_PATTERN.test(transcript)) {
          wakingRef.current = true;
          recognition.stop();
          onWakeRef.current();
          break;
        }
      }
    };

    recognition.onerror = () => {
      wakingRef.current = false;
    };

    recognition.onend = () => {
      if (!enabled || voiceState !== "idle" || wakingRef.current) return;
      try {
        recognition.start();
      } catch {
        /* already started */
      }
    };

    try {
      recognition.start();
    } catch {
      /* mic permission pending */
    }

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
      wakingRef.current = false;
    };
  }, [enabled, voiceState]);
}
