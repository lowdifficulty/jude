"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JudeExplosionFX, JudeMatrixRain, JudeRestoreFX } from "@/components/JudeExplosionFX";
import { JudeFooterDock } from "@/components/JudeFooterDock";
import { JudeGames, type GameId } from "@/components/JudeGames";
import { JudeMarketplace } from "@/components/JudeMarketplace";
import { JudeOrb } from "@/components/JudeOrb";
import { useJudeVoice } from "@/hooks/useJudeVoice";
import {
  loadConnectedApps,
  saveConnectedApps,
  type MarketplaceAppId,
} from "@/lib/marketplace-apps";

type JudeMode = "good" | "evil";
type BlastPhase = "idle" | "out" | "in";

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function JudeInterface() {
  const [time, setTime] = useState<string>("");
  const [mode, setMode] = useState<JudeMode>("good");
  const [connectedApps, setConnectedApps] = useState<MarketplaceAppId[]>([]);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameId>("menu");
  const [blastPhase, setBlastPhase] = useState<BlastPhase>("idle");
  const [evilBlackhole, setEvilBlackhole] = useState(false);
  const blastTimersRef = useRef<number[]>([]);
  const evilBlastCountRef = useRef(0);
  const { state, toggle } = useJudeVoice(mode);

  const clearBlastTimers = useCallback(() => {
    blastTimersRef.current.forEach((id) => window.clearTimeout(id));
    blastTimersRef.current = [];
  }, []);

  const handleExplosion = useCallback(() => {
    clearBlastTimers();
    setGamesOpen(false);
    setMarketplaceOpen(false);
    setActiveGame("menu");

    const isEvilBlast = mode === "evil";
    let useBlackhole = false;
    if (isEvilBlast) {
      evilBlastCountRef.current += 1;
      useBlackhole = evilBlastCountRef.current % 2 === 0;
    }
    setEvilBlackhole(useBlackhole);
    setBlastPhase("out");

    blastTimersRef.current = [
      window.setTimeout(() => setBlastPhase("in"), 260),
      window.setTimeout(() => {
        setBlastPhase("idle");
        setEvilBlackhole(false);
      }, 750),
    ];
  }, [clearBlastTimers, mode]);

  useEffect(() => () => clearBlastTimers(), [clearBlastTimers]);

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
    setConnectedApps(loadConnectedApps());
  }, []);

  const handleConnectionsChange = useCallback((ids: MarketplaceAppId[]) => {
    setConnectedApps(ids);
  }, []);

  const handleFooterReorder = useCallback((ids: MarketplaceAppId[]) => {
    setConnectedApps(ids);
    saveConnectedApps(ids);
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

  const handleOpenApp = useCallback((id: MarketplaceAppId) => {
    if (id === "games") {
      setActiveGame("menu");
      setGamesOpen(true);
    }
  }, []);

  const openMarketplace = () => {
    setMarketplaceOpen(true);
  };

  const closeMarketplace = () => {
    setMarketplaceOpen(false);
  };

  const closeGames = () => {
    setGamesOpen(false);
    setActiveGame("menu");
  };

  return (
    <div
      className={`jude-shell${isEvil ? " jude-shell--evil" : ""}${blastPhase === "out" ? " jude-shell--blast-out" : ""}${blastPhase === "in" ? " jude-shell--blast-in" : ""}${evilBlackhole && blastPhase !== "idle" ? " jude-shell--blackhole" : ""}`}
    >
      {isEvil && (blastPhase === "out" || blastPhase === "in") && (
        <div className="jude-matrix-backdrop" aria-hidden="true">
          <JudeMatrixRain phase={blastPhase === "out" ? "out" : "in"} />
        </div>
      )}

      {blastPhase === "out" && (
        <JudeExplosionFX mode={mode} blackhole={evilBlackhole} />
      )}
      {blastPhase === "in" && mode !== "evil" && <JudeRestoreFX mode={mode} />}

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
        <JudeOrb mode={mode} state={state} onToggle={toggle} onExplosion={handleExplosion} />
      </div>

      <JudeFooterDock
        mode={mode}
        connectedIds={connectedApps}
        onOpenMarketplace={openMarketplace}
        onOpenApp={handleOpenApp}
        onReorder={handleFooterReorder}
      />

      <JudeMarketplace
        mode={mode}
        open={marketplaceOpen && blastPhase === "idle"}
        onClose={closeMarketplace}
        onConnectionsChange={handleConnectionsChange}
      />

      <JudeGames
        mode={mode}
        open={gamesOpen && blastPhase === "idle"}
        onClose={closeGames}
        game={activeGame}
        onGameChange={setActiveGame}
      />
    </div>
  );
}
