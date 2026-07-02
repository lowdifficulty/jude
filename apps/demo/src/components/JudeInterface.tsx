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
  const longPressTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
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
        ? "Listening… Hold to end"
        : state === "thinking"
          ? "Thinking… Hold to end"
          : state === "speaking"
            ? "Tap to interrupt · Hold to end"
            : "Tap to talk to Jude";

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleOrbPointerDown = () => {
    if (!isActive) return;

    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = true;
      stop();
      longPressTimerRef.current = null;
    }, 650);
  };

  const handleOrbPointerUp = () => {
    clearLongPressTimer();
  };

  const handleOrbClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (!isActive) {
      start();
      return;
    }

    if (state === "speaking") {
      interrupt();
    }
  };

  useEffect(() => clearLongPressTimer, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% 45%, #2a2218 0%, #1a1510 45%, #0f0d0a 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(24px, 4vw, 48px) clamp(32px, 5vw, 64px)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          animation: "fade-in 0.8s ease-out",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "#f5f0ea",
            }}
          >
            Jude
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
              fontWeight: 300,
              color: "rgba(245, 240, 234, 0.75)",
            }}
          >
            Your home. Your friend.
          </p>
          <p
            style={{
              marginTop: "0.35rem",
              fontSize: "clamp(0.75rem, 1.2vw, 0.95rem)",
              fontWeight: 300,
              color: "rgba(245, 240, 234, 0.4)",
            }}
          >
            Connected to everything that matters.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            color: "rgba(245, 240, 234, 0.7)",
          }}
        >
          <span
            style={{
              fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
              fontWeight: 300,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {time}
          </span>
          <button
            aria-label="Settings"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid rgba(245, 240, 234, 0.15)",
              background: "rgba(245, 240, 234, 0.05)",
              color: "rgba(245, 240, 234, 0.5)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </header>

      {/* Center orb */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
        }}
      >
        <button
          type="button"
          aria-label={voiceHint}
          onClick={handleOrbClick}
          onPointerDown={handleOrbPointerDown}
          onPointerUp={handleOrbPointerUp}
          onPointerLeave={clearLongPressTimer}
          onPointerCancel={clearLongPressTimer}
          style={{
            width: "clamp(140px, 22vw, 260px)",
            height: "clamp(140px, 22vw, 260px)",
            borderRadius: "50%",
            border: "none",
            background:
              "radial-gradient(circle at 40% 35%, #fff8e8 0%, #ffd080 30%, #e8a040 60%, #c07020 100%)",
            animation:
              state === "listening" || state === "speaking"
                ? "glow-pulse 2s ease-in-out infinite, breathe 4s ease-in-out infinite"
                : "glow-pulse 4s ease-in-out infinite, breathe 6s ease-in-out infinite",
            cursor: "pointer",
            boxShadow:
              state === "listening"
                ? "0 0 80px 24px rgba(255, 190, 90, 0.35)"
                : undefined,
          }}
        />
        <p
          style={{
            fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
            color: "rgba(245, 240, 234, 0.55)",
            fontWeight: 300,
            textAlign: "center",
            maxWidth: 420,
          }}
        >
          {error || voiceHint}
        </p>
        {caption && !error && (
          <p
            style={{
              fontSize: "clamp(0.8rem, 1.1vw, 0.95rem)",
              color: "rgba(245, 240, 234, 0.45)",
              fontWeight: 300,
              textAlign: "center",
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            {caption}
          </p>
        )}
      </div>

      {/* Status bar */}
      <footer
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "clamp(12px, 2vw, 32px)",
          paddingTop: "clamp(16px, 2vw, 24px)",
          borderTop: "1px solid rgba(245, 240, 234, 0.08)",
          animation: "fade-in 1s ease-out 0.3s both",
        }}
      >
        {statusItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "rgba(245, 240, 234, 0.55)",
            }}
          >
            <div style={{ opacity: 0.7 }}>{item.icon}</div>
            <div>
              <div
                style={{
                  fontSize: "clamp(0.7rem, 1vw, 0.85rem)",
                  fontWeight: 400,
                  color: "rgba(245, 240, 234, 0.45)",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
                  fontWeight: 300,
                  color: "rgba(245, 240, 234, 0.75)",
                  marginTop: "0.1rem",
                }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}
