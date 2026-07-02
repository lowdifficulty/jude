"use client";

import { useEffect } from "react";
import { JudeSnake } from "@/components/games/JudeSnake";
import { JudeTetris } from "@/components/games/JudeTetris";

type JudeMode = "good" | "evil";
type GameId = "menu" | "snake" | "tetris";

type JudeGamesProps = {
  mode: JudeMode;
  open: boolean;
  onClose: () => void;
  game: GameId;
  onGameChange: (game: GameId) => void;
};

export function JudeGames({ mode, open, onClose, game, onGameChange }: JudeGamesProps) {
  const isEvil = mode === "evil";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (game === "menu") onClose();
        else onGameChange("menu");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game, onClose, onGameChange, open]);

  if (!open) return null;

  return (
    <div className="jude-games-overlay" role="dialog" aria-modal="true" aria-label="Games">
      <div className={`jude-games-panel${isEvil ? " jude-games-panel--evil" : ""}`}>
        {game === "menu" && (
          <>
            <div className="jude-games-panel__header">
              <div>
                <p className="jude-games-panel__kicker">
                  {isEvil ? "Dark arcade" : "Porch pastimes"}
                </p>
                <h2>{isEvil ? "Games of JUDE" : "Jude Games"}</h2>
              </div>
              <button type="button" className="jude-games-panel__close" onClick={onClose}>
                ✕
              </button>
            </div>

            <div className="jude-games-panel__grid">
              <button
                type="button"
                className="jude-games-card"
                onClick={() => onGameChange("snake")}
              >
                <span className="jude-games-card__icon">🐍</span>
                <strong>{isEvil ? "Serpent of Doom" : "Porch Snake"}</strong>
                <span>{isEvil ? "Grow the beast" : "Classic snake, sweet and simple"}</span>
              </button>
              <button
                type="button"
                className="jude-games-card"
                onClick={() => onGameChange("tetris")}
              >
                <span className="jude-games-card__icon">🧱</span>
                <strong>{isEvil ? "Blocks of Damnation" : "Cozy Blocks"}</strong>
                <span>{isEvil ? "Stack until the void clears" : "Tetris with porch-light charm"}</span>
              </button>
            </div>
          </>
        )}

        {game === "snake" && (
          <JudeSnake mode={mode} onClose={() => onGameChange("menu")} />
        )}
        {game === "tetris" && (
          <JudeTetris mode={mode} onClose={() => onGameChange("menu")} />
        )}
      </div>
    </div>
  );
}

export type { GameId };
