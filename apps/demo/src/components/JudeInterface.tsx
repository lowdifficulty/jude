"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JudeExplosionFX, JudeMatrixRain, JudeRestoreFX } from "@/components/JudeExplosionFX";
import { JudeFooterDock } from "@/components/JudeFooterDock";
import { JudeLogoutButton } from "@/components/JudeLogoutButton";
import { JudeGames, type GameId } from "@/components/JudeGames";
import { JudeMarketplace } from "@/components/JudeMarketplace";
import { JudeOrb } from "@/components/JudeOrb";
import { useHeyJudeWake } from "@/hooks/useHeyJudeWake";
import { useJudeAccount } from "@/hooks/useJudeAccount";
import { useJudeVoice } from "@/hooks/useJudeVoice";
import { MARKETPLACE_APPS, type MarketplaceAppId } from "@/lib/marketplace-apps";

type JudeMode = "good" | "evil";
type BlastPhase = "idle" | "out" | "in";

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizeConnectedIds(ids: string[]): MarketplaceAppId[] {
  return ids.filter((id): id is MarketplaceAppId =>
    MARKETPLACE_APPS.some((app) => app.id === id)
  );
}

export function JudeInterface() {
  const searchParams = useSearchParams();
  const { user, profile, loading, saveConnectedApps, saveAppSettings, logout, refresh } =
    useJudeAccount();
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
  const profileLoadedRef = useRef(false);
  const { state, connect, toggle, errorMessage } = useJudeVoice(
    mode,
    Boolean(profile?.integrations.gmail)
  );

  useHeyJudeWake({
    enabled: Boolean(user) && blastPhase === "idle" && !gamesOpen && !marketplaceOpen,
    voiceState: state,
    onWake: connect,
  });

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
    if (!profile || profileLoadedRef.current) return;
    profileLoadedRef.current = true;

    const savedMode = profile.appSettings.mode;
    if (savedMode === "good" || savedMode === "evil") {
      setMode(savedMode);
    }

    const dockOrder = profile.appSettings.dockOrder;
    const ids = normalizeConnectedIds(profile.connectedAppIds);
    if (dockOrder?.length) {
      const ordered = dockOrder.filter((id): id is MarketplaceAppId =>
        ids.includes(id as MarketplaceAppId)
      );
      const rest = ids.filter((id) => !ordered.includes(id));
      setConnectedApps([...ordered, ...rest]);
    } else {
      setConnectedApps(ids);
    }
  }, [profile]);

  useEffect(() => {
    if (searchParams.get("marketplace") === "1") {
      setMarketplaceOpen(true);
    }
    if (searchParams.get("gmail") === "connected") {
      void refresh();
    }
  }, [refresh, searchParams]);

  const handleConnectionsChange = useCallback(
    (ids: MarketplaceAppId[]) => {
      setConnectedApps(ids);
      void saveConnectedApps(ids);
    },
    [saveConnectedApps]
  );

  const handleFooterReorder = useCallback(
    (ids: MarketplaceAppId[]) => {
      setConnectedApps(ids);
      void saveConnectedApps(ids);
      void saveAppSettings({ dockOrder: ids });
    },
    [saveAppSettings, saveConnectedApps]
  );

  useEffect(() => {
    document.body.dataset.judeMode = mode;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", mode === "evil" ? "#0a0000" : "#1a1510");
    }
    if (profileLoadedRef.current) {
      void saveAppSettings({ mode });
    }
  }, [mode, saveAppSettings]);

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

  if (loading || !user) {
    return <div className="jude-auth jude-auth--loading">Loading your Jude…</div>;
  }

  return (
    <div
      className={`jude-shell${isEvil ? " jude-shell--evil" : ""}${blastPhase === "out" ? " jude-shell--blast-out" : ""}${blastPhase === "in" ? " jude-shell--blast-in" : ""}${evilBlackhole && blastPhase !== "idle" ? " jude-shell--blackhole" : ""}`}
    >
      {isEvil && (blastPhase === "out" || blastPhase === "in") && (
        <div className="jude-matrix-backdrop" aria-hidden="true">
          <JudeMatrixRain phase={blastPhase === "out" ? "out" : "in"} />
        </div>
      )}

      {blastPhase === "out" && <JudeExplosionFX mode={mode} blackhole={evilBlackhole} />}
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
          {user && (
            <div className="jude-account-chip">
              <span>{user.displayName}</span>
              <JudeLogoutButton onLogout={logout} isEvil={isEvil} />
            </div>
          )}
          <span className="jude-clock">{time}</span>
          <div className="jude-mode-toggle" role="group" aria-label="Appearance mode">
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
        {state === "idle" && (
          <p className="jude-voice-hint">
            {isEvil ? 'Say "Hey Jude" to summon' : 'Say "Hey Jude" to wake me up'}
          </p>
        )}
        {state === "connecting" && (
          <p className="jude-voice-hint jude-voice-hint--active">Connecting…</p>
        )}
        {state === "listening" && (
          <p className="jude-voice-hint jude-voice-hint--active">
            {isEvil ? "Listening, mortal…" : "I'm listening, honey."}
          </p>
        )}
        {state === "speaking" && (
          <p className="jude-voice-hint jude-voice-hint--active">
            {isEvil ? "JUDE speaks…" : "Jude is speaking…"}
          </p>
        )}
        {state === "error" && errorMessage && (
          <p className="jude-voice-error">
            {errorMessage}{" "}
            <button type="button" onClick={() => void connect()}>
              Try again
            </button>
          </p>
        )}
      </div>

      <JudeFooterDock
        mode={mode}
        connectedIds={connectedApps}
        onOpenMarketplace={openMarketplace}
        onOpenApp={handleOpenApp}
        onReorder={handleFooterReorder}
        onLogout={logout}
      />

      <JudeMarketplace
        mode={mode}
        open={marketplaceOpen && blastPhase === "idle"}
        onClose={closeMarketplace}
        onConnectionsChange={handleConnectionsChange}
        profile={profile}
        onRefreshProfile={refresh}
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
