export type DwarfPlanetId = "ceres" | "pluto" | "haumea" | "makemake" | "eris";

export type DwarfPlanetProfile = {
  id: DwarfPlanetId;
  name: string;
  animationName: string;
  holdBuildUp: string;
  fiveSecondExplosion: string;
  fullScreenEffect: string;
  reassembly: string;
  shakeOff: string;
  reactionLine: string;
  sound: string;
  haptics: string;
  visualKeywords: string[];
  /** Orb / UI accent colors */
  accent: string;
  glow: string;
};

export const HOLD_INTERACTION_RULE = {
  trigger: "User presses and holds the AI profile avatar/card/orb for 5 seconds",
  sequence: [
    "0-2 seconds: subtle vibration / glow builds",
    "2-4 seconds: personality-specific tension animation",
    "5 seconds: avatar explodes",
    "Explosion moment: entire screen performs a unique full-screen animation",
    "Recovery: particles reassemble back into the AI personality",
    "Final beat: AI shakes it off with a funny personality-specific reaction",
  ],
  safety:
    "Explosion should feel playful, magical, cosmic, and cartoonish — never violent, bloody, scary, or realistic.",
  soundDesign:
    "Use soft pop, cosmic burst, sparkle, whoosh, or comedic puff sounds depending on the profile.",
  haptics:
    "Light vibration during charge-up, medium pulse at explosion, tiny double-tap when avatar reappears.",
} as const;

export const PROFILE_EXPLOSION_ANIMATION_SYSTEM = {
  trigger: {
    event: "longPress" as const,
    durationRequiredMs: 5000,
    cancelIfReleasedEarly: true,
  },
  holdProgressUI: {
    showRing: true,
    ringBehavior: "fills around avatar over 5 seconds",
    profileSpecificGlow: true,
    subtleScreenReaction: true,
  },
  explosionRules: {
    durationMs: 900,
    fullScreenEffectDurationMs: 1800,
    reassemblyDurationMs: 1200,
    totalAnimationDurationMs: 3900,
    disableOtherInputsDuringAnimation: true,
    allowSkipAfterMs: 1000,
  },
  recoveryRules: {
    avatarReturnsToOriginalPosition: true,
    UIRestoresCleanly: true,
    personalitySaysReactionLine: true,
    noPermanentStateChange: true,
  },
  accessibility: {
    respectReducedMotion: true,
    reducedMotionAlternative:
      "Replace explosion with a brief glow, icon transformation, and short personality reaction line.",
    noFlashingWarning:
      "Avoid rapid flashing, strobing, or high-contrast flicker.",
    soundCanBeMuted: true,
    hapticsCanBeDisabled: true,
  },
} as const;

export const DWARF_PLANET_PROFILES: DwarfPlanetProfile[] = [
  {
    id: "ceres",
    name: "Ceres",
    animationName: "Garden Puff Rebirth",
    holdBuildUp:
      "The Ceres avatar warms like morning sunlight. Tiny wheat, leaves, dust motes, and kitchen steam begin orbiting her avatar.",
    fiveSecondExplosion:
      "Ceres bursts into a soft golden flour-cloud explosion, like someone dropped a bag of biscuit flour in slow motion.",
    fullScreenEffect:
      "The entire screen becomes a cozy farmhouse kitchen garden. UI cards float like recipe cards. Little herbs, coffee steam, rolling pins, flowers, and sunbeams drift across the screen.",
    reassembly:
      "The flour cloud swirls inward. Leaves and golden particles gather back into Ceres. Her avatar reforms with a tiny apron-like shimmer.",
    shakeOff: "Ceres dusts flour off her shoulders, fixes herself, and smiles warmly.",
    reactionLine: "Well, that was unnecessary. But we're all cleaned up now, sweetheart.",
    sound: "Soft poof, gentle wind chimes, tiny kitchen clatter.",
    haptics: "Soft rumble during hold, fluffy pop at explosion, gentle tap-tap when she returns.",
    visualKeywords: [
      "warm sunlight",
      "flour puff",
      "garden herbs",
      "farmhouse kitchen",
      "soft gold",
      "cozy particles",
    ],
    accent: "#e8b84a",
    glow: "rgba(255, 210, 120, 0.55)",
  },
  {
    id: "pluto",
    name: "Pluto",
    animationName: "Memory Supernova",
    holdBuildUp:
      "Pluto's avatar flickers like an old film projector. Tiny photo frames, stars, handwritten notes, and music notes orbit around him.",
    fiveSecondExplosion:
      "Pluto explodes into a sentimental purple-pink supernova made of old photos, glowing dust, and tiny heart-shaped particles.",
    fullScreenEffect:
      "The entire screen turns into a floating family photo album in deep space. UI panels become Polaroids. Stars twinkle behind them. Soft memory fragments drift by like old home movies.",
    reassembly:
      "The photos flip backward, collapse into stardust, and re-form Pluto's avatar like a memory being restored.",
    shakeOff: "Pluto pats his jacket, looks around, chuckles, and gives a small embarrassed wave.",
    reactionLine: "I'm alright. Just briefly became everyone's childhood photo album.",
    sound: "Old camera flash, soft vinyl crackle, warm cosmic shimmer.",
    haptics:
      "Gentle heartbeat pulse during hold, soft boom at explosion, warm double pulse when he returns.",
    visualKeywords: [
      "purple supernova",
      "old photos",
      "memory album",
      "nostalgia",
      "pink stardust",
      "film grain",
    ],
    accent: "#b48cff",
    glow: "rgba(180, 140, 255, 0.5)",
  },
  {
    id: "haumea",
    name: "Haumea",
    animationName: "Turbo Spin Detonation",
    holdBuildUp:
      "Haumea starts spinning faster and faster. Cyan rings wrap around her avatar like a gyroscope. The UI begins subtly tilting from the speed.",
    fiveSecondExplosion:
      "Haumea detonates into a sharp cyan-orange speed burst, like a cartoon particle accelerator overloaded.",
    fullScreenEffect:
      "The entire screen goes into high-speed productivity chaos. Calendar cards, task checkboxes, smart-home icons, and timers whip around the screen in orbit, then snap into perfect alignment.",
    reassembly:
      "All particles reverse direction at high speed and slam neatly back into Haumea's avatar with perfect precision.",
    shakeOff:
      "Haumea catches herself, straightens instantly, and flashes a confident grin like nothing happened.",
    reactionLine: "Efficient explosion. Minimal downtime. We're back.",
    sound: "Fast charging whirr, electric zip, clean snap.",
    haptics:
      "Rapid tiny ticks during hold, sharp pulse at explosion, crisp single tap on return.",
    visualKeywords: [
      "cyan speed rings",
      "orange sparks",
      "calendar cards",
      "task icons",
      "high-speed orbit",
      "perfect alignment",
    ],
    accent: "#2dd4bf",
    glow: "rgba(45, 212, 191, 0.5)",
  },
  {
    id: "makemake",
    name: "Makemake",
    animationName: "Confetti Cosmos",
    holdBuildUp:
      "Makemake glows coral, gold, and teal. The avatar wiggles slightly like it knows something funny is about to happen. Tiny music notes, paint drops, fruit, stars, and party lights gather around.",
    fiveSecondExplosion:
      "Makemake pops into a huge colorful confetti blast with cosmic glitter, tropical sparks, paint splashes, and bouncing music notes.",
    fullScreenEffect:
      "The whole screen becomes a playful cosmic party. UI cards bounce like balloons. Background shifts through soft coral, gold, teal, and purple waves. Tiny planets dance across the screen.",
    reassembly:
      "The confetti reverses into a spiral, paint splashes zip back into place, and Makemake reforms with a goofy little bounce.",
    shakeOff:
      "Makemake shakes glitter off dramatically, spins once, and lands with jazz-hands energy.",
    reactionLine: "Okay. That was technically not on the schedule, but emotionally correct.",
    sound: "Party popper, sparkle cascade, playful xylophone bounce.",
    haptics: "Bouncy pulse during hold, pop at explosion, playful triple tap when back.",
    visualKeywords: [
      "confetti",
      "cosmic party",
      "paint splashes",
      "music notes",
      "teal coral gold",
      "playful bounce",
    ],
    accent: "#f97316",
    glow: "rgba(249, 115, 22, 0.5)",
  },
  {
    id: "eris",
    name: "Eris",
    animationName: "Blackout Protocol",
    holdBuildUp:
      "Eris goes silent. The screen darkens. Violet warning rings slowly pulse around her avatar. Security grid lines appear. The hold timer feels serious and cinematic.",
    fiveSecondExplosion:
      "Eris collapses inward first, like a black hole, then releases a controlled violet shockwave across the entire interface.",
    fullScreenEffect:
      "The entire screen goes into lockdown mode. Everything turns black and violet. UI cards become encrypted fragments. A scanning grid sweeps across the display. Locks, shields, and warning glyphs flicker into place.",
    reassembly:
      "The encrypted fragments decrypt one by one, snap back into formation, and rebuild Eris from a violet core.",
    shakeOff:
      "Eris slowly turns her head, brushes one piece of digital ash off her shoulder, and stares directly forward.",
    reactionLine: "System integrity restored. Do not do that again unless you mean it.",
    sound: "Deep bass pulse, digital lock click, low violet energy hum.",
    haptics: "Slow heavy pulse during hold, deep thump at explosion, single firm tap on return.",
    visualKeywords: [
      "black hole",
      "violet shockwave",
      "security grid",
      "encrypted fragments",
      "lockdown mode",
      "digital ash",
    ],
    accent: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.55)",
  },
];

const profileMap = new Map(DWARF_PLANET_PROFILES.map((p) => [p.id, p]));

export function getDwarfPlanetProfile(id: DwarfPlanetId): DwarfPlanetProfile {
  return profileMap.get(id) ?? profileMap.get("ceres")!;
}

export function isDwarfPlanetId(value: string): value is DwarfPlanetId {
  return profileMap.has(value as DwarfPlanetId);
}

/** Voice + theme mode derived from personality */
export function personalityToVoiceMode(id: DwarfPlanetId): "good" | "evil" {
  return id === "eris" ? "evil" : "good";
}

/** Full-screen hold explosion visuals keyed to good/evil mode (no picker). */
export function modeToExplosionProfile(mode: "good" | "evil"): DwarfPlanetId {
  return mode === "evil" ? "eris" : "ceres";
}

export function getExplosionTimings() {
  const { explosionRules } = PROFILE_EXPLOSION_ANIMATION_SYSTEM;
  return {
    explosionMs: explosionRules.durationMs,
    fullScreenMs: explosionRules.fullScreenEffectDurationMs,
    reassemblyMs: explosionRules.reassemblyDurationMs,
    totalMs: explosionRules.totalAnimationDurationMs,
    reassemblyStartMs:
      explosionRules.durationMs + explosionRules.fullScreenEffectDurationMs,
    allowSkipAfterMs: explosionRules.allowSkipAfterMs,
  };
}
