"use client";

import type { CSSProperties } from "react";
import type { DwarfPlanetId } from "@/lib/dwarf-planet-profiles";
import { DWARF_PLANET_PROFILES } from "@/lib/dwarf-planet-profiles";

type JudePersonalityPickerProps = {
  value: DwarfPlanetId;
  onChange: (id: DwarfPlanetId) => void;
  disabled?: boolean;
};

export function JudePersonalityPicker({
  value,
  onChange,
  disabled = false,
}: JudePersonalityPickerProps) {
  return (
    <div
      className="jude-personality-picker"
      role="radiogroup"
      aria-label="AI personality"
    >
      {DWARF_PLANET_PROFILES.map((profile) => {
        const active = value === profile.id;
        return (
          <button
            key={profile.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${profile.name} — ${profile.animationName}`}
            title={profile.name}
            disabled={disabled}
            className={`jude-personality-picker__btn${active ? " jude-personality-picker__btn--active" : ""}`}
            style={
              {
                "--personality-accent": profile.accent,
                "--personality-glow": profile.glow,
              } as CSSProperties
            }
            onClick={() => onChange(profile.id)}
          >
            <span className="jude-personality-picker__orb" aria-hidden="true" />
            <span className="jude-personality-picker__name">{profile.name}</span>
          </button>
        );
      })}
    </div>
  );
}
