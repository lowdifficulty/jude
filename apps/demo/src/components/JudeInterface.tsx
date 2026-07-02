"use client";

import { useEffect, useRef, useState } from "react";
import { useJudeVoice } from "@/hooks/useJudeVoice";

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const statusItems = [
  {
    id: "lighting",
    label: "Lighting",
    value: "Warm",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V16h8v-3.5A6 6 0 0 0 12 2z" />
      </svg>
    ),
  },
  {
    id: "climate",
    label: "Climate",
    value: "72°",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
  },
  {
    id: "music",
    label: "Music",
    value: "Acoustic",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: "home",
    label: "Home",
    value: "All calm",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
];

export function JudeInterface() {
  const [time, setTime] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const lastOrbTapRef = useRef(0);
  const { state, error, isActive, start, stop, interrupt } = useJudeVoice({
    onTranscript: (text, role) => {
      if (role === "assistant") setCaption(text);
    },
    onStateChange: (next) => {
      if (next === "idle") setCaption("");
    },
  });

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const voiceHint =
    state === "connecting"
      ? "Connecting…"
      : state === "listening"
        ? "Listening…"
        : state === "thinking"
          ? "Thinking…"
          : state === "speaking"
            ? "Speaking… tap orb to interrupt"
            : "Tap to talk to Jude";

  const activateOrb = () => {
    const now = Date.now();
    if (now - lastOrbTapRef.current < 350) return;
    lastOrbTapRef.current = now;

    if (state === "error" || !isActive) {
      start();
      return;
    }

    if (state === "speaking") {
      interrupt();
    }
  };

  const handleOrbPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    activateOrb();
  };

  return (
    <div className="jude-shell">
      <header className="jude-header">
        <div className="jude-header-brand">
          <h1>Jude</h1>
          <p className="jude-header-tagline">Your home. Your friend.</p>
          <p className="jude-header-sub">Connected to everything that matters.</p>
        </div>

        <div className="jude-header-meta">
          <span className="jude-clock">{time}</span>
          <button type="button" className="jude-settings-btn" aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </header>

      <div className="jude-main">
        <button
          type="button"
          className={`jude-orb${state === "listening" || state === "speaking" ? " jude-orb--active" : ""}`}
          aria-label={voiceHint}
          onPointerUp={handleOrbPointerUp}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              activateOrb();
            }
          }}
        />
        <p className="jude-hint">{error || voiceHint}</p>
        {isActive && (
          <button type="button" className="jude-end-btn" onClick={stop}>
            End conversation
          </button>
        )}
        {caption && !error && <p className="jude-caption">{caption}</p>}
      </div>

      <footer className="jude-status">
        {statusItems.map((item) => (
          <div key={item.id} className="jude-status-item">
            <div className="jude-status-icon">{item.icon}</div>
            <div>
              <div className="jude-status-label">{item.label}</div>
              <div className="jude-status-value">{item.value}</div>
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}
