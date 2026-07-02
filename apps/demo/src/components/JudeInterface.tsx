"use client";

import { useEffect, useState } from "react";
import { useJudeVoice } from "@/hooks/useJudeVoice";

type JudeMode = "good" | "evil";

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const goodStatusItems = [
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

const evilStatusItems = [
  {
    id: "lighting",
    label: "Lighting",
    value: "Blood red",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V16h8v-3.5A6 6 0 0 0 12 2z" />
      </svg>
    ),
  },
  {
    id: "climate",
    label: "Climate",
    value: "666°",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
  },
  {
    id: "music",
    label: "Music",
    value: "Doom",
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
    value: "All watched",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export function JudeInterface() {
  const [time, setTime] = useState<string>("");
  const [mode, setMode] = useState<JudeMode>("good");
  const { state, toggle } = useJudeVoice();

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("jude-mode");
    if (saved === "good" || saved === "regular" || saved === "evil") {
      setMode(saved === "regular" ? "good" : saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("jude-mode", mode);
    document.body.dataset.judeMode = mode;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", mode === "evil" ? "#0a0000" : "#1a1510");
    }
  }, [mode]);

  const isEvil = mode === "evil";
  const statusItems = isEvil ? evilStatusItems : goodStatusItems;

  const orbClass =
    state === "connecting"
      ? "jude-orb jude-orb--connecting"
      : state === "listening" || state === "thinking"
        ? "jude-orb jude-orb--live"
        : state === "speaking"
          ? "jude-orb jude-orb--speaking"
          : state === "error"
            ? "jude-orb jude-orb--error"
            : "jude-orb";

  const ariaLabel =
    state === "idle" || state === "error"
      ? isEvil
        ? "Summon Jude"
        : "Tap to talk to Jude"
      : isEvil
        ? "Banish Jude"
        : "Tap to stop talking to Jude";

  return (
    <div className={`jude-shell${isEvil ? " jude-shell--evil" : ""}`}>
      {isEvil && <div className="jude-evil-vignette" aria-hidden="true" />}

      <header className="jude-header">
        <div className="jude-header-brand">
          <h1>{isEvil ? "JUDE" : "Jude"}</h1>
          <p className="jude-header-tagline">
            {isEvil ? "Your home. Your master." : "Your home. Your friend."}
          </p>
          <p className="jude-header-sub">
            {isEvil
              ? "Connected to everything you fear."
              : "Connected to everything that matters."}
          </p>
        </div>

        <div className="jude-header-meta">
          <span className="jude-clock">{time}</span>
          <div
            className="jude-mode-toggle"
            role="group"
            aria-label="Appearance mode"
          >
            <button
              type="button"
              className={`jude-mode-toggle__btn${mode === "good" ? " jude-mode-toggle__btn--active" : ""}`}
              aria-pressed={mode === "good"}
              onClick={() => setMode("good")}
            >
              Good
            </button>
            <button
              type="button"
              className={`jude-mode-toggle__btn jude-mode-toggle__btn--evil${mode === "evil" ? " jude-mode-toggle__btn--active" : ""}`}
              aria-pressed={mode === "evil"}
              onClick={() => setMode("evil")}
            >
              Evil
            </button>
          </div>
        </div>
      </header>

      <div className="jude-main">
        <button
          type="button"
          className={orbClass}
          aria-label={ariaLabel}
          aria-pressed={state !== "idle" && state !== "error"}
          onClick={toggle}
        >
          {isEvil && <span className="jude-orb__core" aria-hidden="true" />}
        </button>
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
