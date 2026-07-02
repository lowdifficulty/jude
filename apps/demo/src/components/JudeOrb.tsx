"use client";

import { useRef } from "react";
import type { JudeVoiceState } from "@/hooks/useJudeVoice";
import { useOrbPhysics } from "@/hooks/useOrbPhysics";

type JudeMode = "good" | "evil";

type JudeOrbProps = {
  mode: JudeMode;
  state: JudeVoiceState;
  onToggle: () => void;
  onExplosion?: () => void;
};

function getOrbClass(state: JudeVoiceState) {
  switch (state) {
    case "connecting":
      return "jude-orb jude-orb--connecting";
    case "listening":
      return "jude-orb jude-orb--listening";
    case "thinking":
      return "jude-orb jude-orb--thinking";
    case "speaking":
      return "jude-orb jude-orb--speaking";
    case "error":
      return "jude-orb jude-orb--error";
    default:
      return "jude-orb";
  }
}

export function JudeOrb({ mode, state, onToggle, onExplosion }: JudeOrbProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLButtonElement>(null);
  const {
    offset,
    stretchTension,
    isDragging,
    isAirborne,
    shakeOff,
    holdProgress,
    isReforming,
    isHidden,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useOrbPhysics(stageRef, orbRef, { onExplosion });

  const isEvil = mode === "evil";
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isCharging = holdProgress > 0 && holdProgress < 1 && isDragging;

  const ariaLabel =
    state === "idle" || state === "error"
      ? isEvil
        ? 'Say "Hey Jude" or tap to summon'
        : 'Say "Hey Jude" or tap to talk'
      : isEvil
        ? "Tap to banish Jude"
        : "Tap to stop talking to Jude";

  return (
    <div className={`jude-orb-stage${isEvil ? " jude-orb-stage--evil" : ""}`} ref={stageRef}>
      <div
        className={`jude-orb-track${isDragging ? " jude-orb-track--dragging" : ""}${isAirborne ? " jude-orb-track--airborne" : ""}${isCharging ? " jude-orb-track--charging" : ""}${isHidden ? " jude-orb-track--vanish" : ""}`}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          ["--hold-progress" as string]: holdProgress,
        }}
      >
        <div
          className={`jude-orb-shell${isDragging ? " jude-orb-shell--stretch" : ""}${isHidden ? " jude-orb-shell--hidden" : ""}${isReforming ? " jude-orb-shell--reform" : ""}`}
          style={{
            transform: `scale(${1 + stretchTension * 0.06})`,
            ["--orb-stretch" as string]: stretchTension,
            ["--hold-progress" as string]: holdProgress,
          }}
        >
          <div
            className={`jude-orb-bobble${isSpeaking ? " jude-orb-bobble--speaking" : ""}${shakeOff ? " jude-orb-bobble--shake-off" : ""}${isCharging ? " jude-orb-bobble--charging" : ""}`}
          >
            {isListening && (
              <>
                <span className="jude-orb__listen-ring jude-orb__listen-ring--a" aria-hidden="true" />
                <span className="jude-orb__listen-ring jude-orb__listen-ring--b" aria-hidden="true" />
              </>
            )}

            <button
              type="button"
              ref={orbRef}
              className={getOrbClass(state)}
              aria-label={ariaLabel}
              aria-pressed={state !== "idle" && state !== "error"}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => onPointerUp(event, onToggle)}
              onPointerCancel={(event) => onPointerUp(event, () => {})}
            >
              <span className="jude-orb__inner">
                {isEvil && <span className="jude-orb__core" aria-hidden="true" />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
