"use client";

import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useHapticsEnabled() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("jude-haptics");
      if (stored === "0") setEnabled(false);
    } catch {
      /* ignore */
    }
  }, []);

  return enabled;
}

export function triggerHoldHaptic(
  kind: "charge" | "explode" | "return",
  isEvil: boolean,
  enabled: boolean
) {
  if (!enabled || typeof navigator === "undefined" || !navigator.vibrate) return;

  const patterns = isEvil
    ? { charge: [30, 40, 30], explode: [40, 60, 40], return: 35 }
    : { charge: 8, explode: [20, 40, 20], return: [12, 30, 12] };

  navigator.vibrate(patterns[kind]);
}
