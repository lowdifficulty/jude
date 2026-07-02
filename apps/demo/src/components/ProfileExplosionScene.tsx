"use client";

import { useMemo } from "react";
import type { DwarfPlanetId } from "@/lib/dwarf-planet-profiles";
import { getDwarfPlanetProfile } from "@/lib/dwarf-planet-profiles";

export type HoldAnimationPhase = "explosion" | "fullscreen" | "reassembly";

type ProfileExplosionSceneProps = {
  profileId: DwarfPlanetId;
  phase: HoldAnimationPhase;
  reducedMotion?: boolean;
};

function buildParticles(profileId: DwarfPlanetId, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${8 + ((i * 37) % 84)}%`,
    top: `${6 + ((i * 53) % 88)}%`,
    delay: `${(i % 7) * 0.08}s`,
    size: 4 + (i % 5) * 3,
    rotate: (i * 47) % 360,
  }));
}

export function ProfileExplosionScene({
  profileId,
  phase,
  reducedMotion = false,
}: ProfileExplosionSceneProps) {
  const profile = getDwarfPlanetProfile(profileId);
  const particles = useMemo(() => buildParticles(profileId, 18), [profileId]);

  if (reducedMotion) {
    return (
      <div
        className="jude-profile-fx jude-profile-fx--reduced"
        data-profile={profileId}
        aria-hidden="true"
      >
        <div className="jude-profile-fx__reduced-glow" />
      </div>
    );
  }

  return (
    <div
      className={`jude-profile-fx jude-profile-fx--${phase}`}
      data-profile={profileId}
      aria-hidden="true"
    >
      <div className="jude-profile-fx__backdrop" />
      <div className="jude-profile-fx__burst" />
      {phase === "fullscreen" && (
        <>
          <div className="jude-profile-fx__screen-wash" />
          <div className="jude-profile-fx__floating-ui" />
        </>
      )}
      {phase === "reassembly" && <div className="jude-profile-fx__pull-in" />}
      <div className="jude-profile-fx__particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="jude-profile-fx__particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      </div>
      <span className="jude-profile-fx__label">{profile.animationName}</span>
    </div>
  );
}

export function ProfileReactionLine({
  profileId,
  visible,
}: {
  profileId: DwarfPlanetId;
  visible: boolean;
}) {
  const profile = getDwarfPlanetProfile(profileId);
  if (!visible) return null;

  return (
    <div className="jude-profile-reaction" role="status" aria-live="polite">
      <span className="jude-profile-reaction__name">{profile.name}</span>
      <p className="jude-profile-reaction__line">{profile.reactionLine}</p>
    </div>
  );
}
