"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { JudeAppIcon } from "@/components/JudeAppIcon";
import type { JudeAccountProfile } from "@/hooks/useJudeAccount";
import {
  getAppsByCategory,
  isOAuthApp,
  MARKETPLACE_APPS,
  MARKETPLACE_CATEGORIES,
  type MarketplaceApp,
  type MarketplaceAppId,
} from "@/lib/marketplace-apps";

type JudeMode = "good" | "evil";
type MarketplaceView = "launch" | "all";

type JudeMarketplaceProps = {
  mode: JudeMode;
  open: boolean;
  onClose: () => void;
  onConnectionsChange?: (ids: MarketplaceAppId[]) => void;
  profile: JudeAccountProfile | null;
  onRefreshProfile?: () => Promise<JudeAccountProfile | null | undefined>;
};

function isValidZip(zip: string) {
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
}

function tierLabel(tier: 1 | 2 | 3, isEvil: boolean) {
  if (tier === 1) return isEvil ? "Priority" : "Tier 1";
  if (tier === 2) return isEvil ? "Add-on" : "Tier 2";
  return isEvil ? "Optional" : "Tier 3";
}

export function JudeMarketplace({
  mode,
  open,
  onClose,
  onConnectionsChange,
  profile,
  onRefreshProfile,
}: JudeMarketplaceProps) {
  const isEvil = mode === "evil";
  const [connected, setConnected] = useState<MarketplaceAppId[]>([]);
  const [selected, setSelected] = useState<MarketplaceAppId | null>(null);
  const [view, setView] = useState<MarketplaceView>("launch");
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const launchApps = useMemo(() => MARKETPLACE_APPS.filter((app) => app.launch25), []);

  useEffect(() => {
    if (!open) return;
    const ids = (profile?.connectedAppIds || []).filter((id): id is MarketplaceAppId =>
      MARKETPLACE_APPS.some((app) => app.id === id)
    );
    setConnected(ids);
    setZipInput(profile?.appSettings.weatherZip || "");
    setSelected(null);
    setView("launch");
    setZipError("");
    setStatusMessage("");
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selected) setSelected(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open, selected]);

  const selectedApp = selected
    ? MARKETPLACE_APPS.find((app) => app.id === selected) ?? null
    : null;

  const persistConnected = useCallback(
    async (next: MarketplaceAppId[]) => {
      setConnected(next);
      onConnectionsChange?.(next);
    },
    [onConnectionsChange]
  );

  const toggleConnection = useCallback(
    async (app: MarketplaceApp) => {
      const isConnected = connected.includes(app.id);

      if (isConnected && app.id === "gmail") {
        setBusy(true);
        setStatusMessage("");
        try {
          const response = await fetch("/api/integrations/gmail/disconnect", { method: "POST" });
          if (!response.ok) {
            setStatusMessage("Could not disconnect Gmail.");
            return;
          }
          const next = connected.filter((id) => id !== app.id);
          await persistConnected(next);
          await onRefreshProfile?.();
        } finally {
          setBusy(false);
        }
        return;
      }

      if (isConnected) {
        const next = connected.filter((id) => id !== app.id);
        await persistConnected(next);
        return;
      }

      if (isOAuthApp(app.id)) {
        window.location.href = `/api/integrations/gmail/connect`;
        return;
      }

      if (app.needsZip) {
        if (!isValidZip(zipInput)) {
          setZipError("Enter a valid 5-digit US zip code.");
          return;
        }
        await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "appSettings",
            weatherZip: zipInput.trim(),
          }),
        });
        setZipError("");
      }

      const next = [...connected, app.id];
      await persistConnected(next);
    },
    [connected, onRefreshProfile, persistConnected, zipInput]
  );

  if (!open) return null;

  const copy = (app: MarketplaceApp) => (isEvil ? app.evil : app.good);
  const visibleCategories = MARKETPLACE_CATEGORIES.filter(
    (category) => getAppsByCategory(category.id).length > 0
  );

  const renderCard = (app: MarketplaceApp) => {
    const meta = copy(app);
    const isConnected = connected.includes(app.id);

    return (
      <button
        key={app.id}
        type="button"
        className={`jude-marketplace-card${isConnected ? " jude-marketplace-card--connected" : ""}`}
        onClick={() => setSelected(app.id)}
      >
        <span className="jude-marketplace-card__icon">
          <JudeAppIcon id={app.id} size={26} />
        </span>
        <strong>{meta.name}</strong>
        <span>{meta.tagline}</span>
        <span className="jude-marketplace-card__meta">
          {app.launch25 && (
            <span className="jude-marketplace-card__badge jude-marketplace-card__badge--launch">
              {isEvil ? "Launch" : "Launch 25"}
            </span>
          )}
          <span className="jude-marketplace-card__badge jude-marketplace-card__badge--tier">
            {tierLabel(app.tier, isEvil)}
          </span>
          {isConnected && (
            <span className="jude-marketplace-card__badge jude-marketplace-card__badge--on">
              {isEvil ? "Linked" : "Connected"}
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <div
      className="jude-marketplace-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isEvil ? "Integration vault" : "App marketplace"}
    >
      <div className={`jude-marketplace-panel${isEvil ? " jude-marketplace-panel--evil" : ""}`}>
        <div className="jude-marketplace-panel__header">
          <div>
            <p className="jude-marketplace-panel__kicker">
              {isEvil ? "Phase 1 assimilation" : "Jude.one Phase 1"}
            </p>
            <h2>{isEvil ? "JUDE App Vault" : "Jude App Marketplace"}</h2>
            <p className="jude-marketplace-panel__sub">
              {isEvil
                ? "Tier 1 first. Everything else follows."
                : "Best First 25 launch apps — then Tier 2 and 3 add-ons."}
            </p>
          </div>
          <button type="button" className="jude-marketplace-panel__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {!selectedApp ? (
          <>
            <div className="jude-marketplace-panel__toolbar">
              <p className="jude-marketplace-panel__count">
                {connected.length} of {MARKETPLACE_APPS.length} connected
              </p>
              <div className="jude-marketplace-view-toggle" role="tablist" aria-label="Marketplace view">
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "launch"}
                  className={`jude-marketplace-view-toggle__btn${view === "launch" ? " jude-marketplace-view-toggle__btn--active" : ""}`}
                  onClick={() => setView("launch")}
                >
                  Launch 25
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "all"}
                  className={`jude-marketplace-view-toggle__btn${view === "all" ? " jude-marketplace-view-toggle__btn--active" : ""}`}
                  onClick={() => setView("all")}
                >
                  All apps
                </button>
              </div>
            </div>

            {view === "launch" ? (
              <div className="jude-marketplace-section">
                <h3 className="jude-marketplace-section__title">
                  {isEvil ? "First wave integrations" : "Best First 25 Launch Apps"}
                </h3>
                <div className="jude-marketplace-grid">{launchApps.map(renderCard)}</div>
              </div>
            ) : (
              visibleCategories.map((category) => {
                const apps = getAppsByCategory(category.id);
                if (apps.length === 0) return null;

                return (
                  <section key={category.id} className="jude-marketplace-section">
                    <h3 className="jude-marketplace-section__title">{category.label}</h3>
                    <div className="jude-marketplace-grid">{apps.map(renderCard)}</div>
                  </section>
                );
              })
            )}
          </>
        ) : (
          <div className="jude-marketplace-detail">
            <button
              type="button"
              className="jude-marketplace-detail__back"
              onClick={() => setSelected(null)}
            >
              ← All apps
            </button>

            <div className="jude-marketplace-detail__hero">
              <span className="jude-marketplace-detail__icon">
                <JudeAppIcon id={selectedApp.id} size={34} />
              </span>
              <div>
                <h3>{copy(selectedApp).name}</h3>
                <p>{copy(selectedApp).tagline}</p>
              </div>
            </div>

            <div className="jude-marketplace-detail__tags">
              {selectedApp.launch25 && (
                <span className="jude-marketplace-card__badge jude-marketplace-card__badge--launch">
                  {isEvil ? "Launch" : "Launch 25"}
                </span>
              )}
              <span className="jude-marketplace-card__badge jude-marketplace-card__badge--tier">
                {tierLabel(selectedApp.tier, isEvil)}
              </span>
              <span className="jude-marketplace-card__badge jude-marketplace-card__badge--category">
                {MARKETPLACE_CATEGORIES.find((c) => c.id === selectedApp.category)?.label}
              </span>
            </div>

            <p className="jude-marketplace-detail__body">{copy(selectedApp).detail}</p>

            {selectedApp.id === "gmail" && profile?.integrations.gmail?.email && (
              <p className="jude-marketplace-detail__account">
                {isEvil ? "Linked account" : "Signed in as"} {profile.integrations.gmail.email}
              </p>
            )}

            {statusMessage && <p className="jude-marketplace-detail__status">{statusMessage}</p>}

            {selectedApp.needsZip && (
              <label className="jude-marketplace-detail__zip">
                <span>{isEvil ? "Coordinates (zip)" : "Your zip code"}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 37203"
                  maxLength={10}
                  value={zipInput}
                  onChange={(event) => {
                    setZipInput(event.target.value);
                    setZipError("");
                  }}
                />
                {zipError && <em>{zipError}</em>}
              </label>
            )}

            <div className="jude-marketplace-detail__providers">
              <span>{isEvil ? "Compatible sources" : "Works with"}</span>
              <div className="jude-marketplace-detail__chips">
                {copy(selectedApp).providers.map((provider) => (
                  <span key={provider}>{provider}</span>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={`jude-marketplace-detail__connect${
                connected.includes(selectedApp.id)
                  ? " jude-marketplace-detail__connect--on"
                  : ""
              }`}
              disabled={busy}
              onClick={() => void toggleConnection(selectedApp)}
            >
              {connected.includes(selectedApp.id)
                ? isEvil
                  ? "Sever link"
                  : "Disconnect"
                : isOAuthApp(selectedApp.id)
                  ? isEvil
                    ? "Sign in with Google"
                    : "Sign in with Google"
                  : isEvil
                    ? "Assimilate"
                    : "Connect"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
