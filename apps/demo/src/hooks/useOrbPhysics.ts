"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

const DRAG_THRESHOLD = 8;
const TAP_MAX_MS = 280;
const HOLD_EXPLODE_MS = 5000;
const SHAKE_MS = 620;
const WIPE_RESTORE_MS = 260;
const WIPE_COMPLETE_MS = 750;
const SPRING_BASE = 0.052;
const SPRING_STRETCH = 0.0002;
const DAMPING = 0.908;
const SNAP_BASE = 0.085;
const SNAP_STRETCH = 0.00028;
const MAX_SPEED = 46;
const MAX_SPRING_MS = 1500;
const MAX_OSCILLATIONS = 4;
const CENTER_CROSS_IN = 14;
const CENTER_CROSS_OUT = 24;
const SETTLE_DIST = 1.1;
const SETTLE_SPEED = 0.22;

function clampSpeed(vx: number, vy: number) {
  const speed = Math.hypot(vx, vy);
  if (speed <= MAX_SPEED) return { x: vx, y: vy };
  const scale = MAX_SPEED / speed;
  return { x: vx * scale, y: vy * scale };
}

function clampToBounds(point: Point, bounds: Bounds): Point {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, point.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, point.y)),
  };
}

export function useOrbPhysics(
  stageRef: React.RefObject<HTMLElement | null>,
  orbRef: React.RefObject<HTMLElement | null>,
  options?: { onExplosion?: () => void }
) {
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [stretch, setStretch] = useState(0);
  const [stretchTension, setStretchTension] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [shakeOff, setShakeOff] = useState(false);
  const [isAirborne, setIsAirborne] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [isReforming, setIsReforming] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const offsetRef = useRef<Point>({ x: 0, y: 0 });
  const velocityRef = useRef<Point>({ x: 0, y: 0 });
  const pointerRef = useRef<number | null>(null);
  const wasStretchedRef = useRef(false);
  const explodedRef = useRef(false);
  const shakeTimeoutRef = useRef<number | null>(null);
  const explodeTimeoutRef = useRef<number | null>(null);
  const reformTimeoutRef = useRef<number | null>(null);
  const holdRafRef = useRef<number>(0);
  const holdStartRef = useRef(0);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    startTime: 0,
    moved: false,
  });
  const lastSampleRef = useRef({ x: 0, y: 0, time: 0 });
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const maxStretchRef = useRef(320);
  const springSessionRef = useRef({
    active: false,
    startTime: 0,
    crossings: 0,
    wasOutsideCenter: true,
  });

  const getBounds = useCallback((): Bounds => {
    const stage = stageRef.current;
    const orb = orbRef.current;
    if (!stage || !orb) {
      return { minX: -160, maxX: 160, minY: -120, maxY: 120 };
    }

    const stageRect = stage.getBoundingClientRect();
    const orbRect = orb.getBoundingClientRect();
    const radius = orbRect.width / 2;
    const pad = 8;
    const cx = stageRect.left + stageRect.width / 2;
    const cy = stageRect.top + stageRect.height / 2;

    const bounds = {
      minX: -Math.max(cx - pad - radius, 48),
      maxX: Math.max(window.innerWidth - pad - radius - cx, 48),
      minY: -Math.max(cy - pad - radius, 48),
      maxY: Math.max(window.innerHeight - pad - radius - cy, 48),
    };

    maxStretchRef.current = Math.max(
      Math.abs(bounds.maxX),
      Math.abs(bounds.minX),
      Math.abs(bounds.maxY),
      Math.abs(bounds.minY),
      1
    );

    return bounds;
  }, [orbRef, stageRef]);

  const triggerShakeOff = useCallback(() => {
    if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current);
    setShakeOff(true);
    shakeTimeoutRef.current = window.setTimeout(() => {
      setShakeOff(false);
      shakeTimeoutRef.current = null;
    }, SHAKE_MS);
  }, []);

  const settleHome = useCallback(
    (withShake = false) => {
      offsetRef.current = { x: 0, y: 0 };
      velocityRef.current = { x: 0, y: 0 };
      springSessionRef.current = {
        active: false,
        startTime: 0,
        crossings: 0,
        wasOutsideCenter: true,
      };
      setOffset({ x: 0, y: 0 });
      setStretch(0);
      setStretchTension(0);
      setIsAirborne(false);

      if (withShake || wasStretchedRef.current) {
        wasStretchedRef.current = false;
        triggerShakeOff();
      }
    },
    [triggerShakeOff]
  );

  const beginSpringSession = useCallback(() => {
    springSessionRef.current = {
      active: true,
      startTime: performance.now(),
      crossings: 0,
      wasOutsideCenter: Math.hypot(offsetRef.current.x, offsetRef.current.y) > CENTER_CROSS_OUT,
    };
  }, []);

  const shouldForceSettle = useCallback((x: number, y: number) => {
    const session = springSessionRef.current;
    if (!session.active) return false;

    const elapsed = performance.now() - session.startTime;
    const dist = Math.hypot(x, y);

    if (dist < CENTER_CROSS_IN && session.wasOutsideCenter) {
      session.crossings += 1;
      session.wasOutsideCenter = false;
    } else if (dist > CENTER_CROSS_OUT) {
      session.wasOutsideCenter = true;
    }

    return elapsed >= MAX_SPRING_MS || session.crossings >= MAX_OSCILLATIONS;
  }, []);

  const getSpringDamping = useCallback(() => {
    const session = springSessionRef.current;
    if (!session.active) return DAMPING;

    const elapsed = performance.now() - session.startTime;
    const timeFactor = Math.min(elapsed / MAX_SPRING_MS, 1);
    const crossingFactor = Math.min(session.crossings / MAX_OSCILLATIONS, 1);
    const combined = Math.max(timeFactor, crossingFactor);

    return DAMPING - combined * 0.095;
  }, []);

  const syncMotionState = useCallback((x: number, y: number, vx: number, vy: number) => {
    const dist = Math.hypot(x, y);
    setStretch(dist);
    setStretchTension(Math.min(dist / maxStretchRef.current, 1));
    setIsAirborne(pointerRef.current !== null || dist > 8 || Math.hypot(vx, vy) > 0.35);
  }, []);

  const stopHoldLoop = useCallback(() => {
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = 0;
    }
    setHoldProgress(0);
    holdStartRef.current = 0;
  }, []);

  const triggerExplosion = useCallback(() => {
    if (explodedRef.current || isExploding) return;

    explodedRef.current = true;
    stopHoldLoop();
    pointerRef.current = null;
    setIsDragging(false);
    setIsExploding(true);
    setIsHidden(true);
    offsetRef.current = { x: 0, y: 0 };
    velocityRef.current = { x: 0, y: 0 };
    setOffset({ x: 0, y: 0 });
    setStretch(0);
    setStretchTension(0);

    options?.onExplosion?.();

    if (explodeTimeoutRef.current) window.clearTimeout(explodeTimeoutRef.current);
    if (reformTimeoutRef.current) window.clearTimeout(reformTimeoutRef.current);

    explodeTimeoutRef.current = window.setTimeout(() => {
      setIsHidden(false);
      setIsReforming(true);
      settleHome(true);
      explodeTimeoutRef.current = null;
    }, WIPE_RESTORE_MS);

    reformTimeoutRef.current = window.setTimeout(() => {
      setIsExploding(false);
      setIsReforming(false);
      explodedRef.current = false;
      reformTimeoutRef.current = null;
    }, WIPE_COMPLETE_MS);
  }, [isExploding, options, settleHome, stopHoldLoop]);

  const startHoldLoop = useCallback(() => {
    stopHoldLoop();
    holdStartRef.current = performance.now();

    const step = () => {
      if (pointerRef.current === null || dragRef.current.moved || explodedRef.current) {
        stopHoldLoop();
        return;
      }

      const progress = Math.min(
        (performance.now() - holdStartRef.current) / HOLD_EXPLODE_MS,
        1
      );
      setHoldProgress(progress);

      if (progress >= 1) {
        triggerExplosion();
        return;
      }

      holdRafRef.current = requestAnimationFrame(step);
    };

    holdRafRef.current = requestAnimationFrame(step);
  }, [stopHoldLoop, triggerExplosion]);

  const tick = useCallback(() => {
    if (pointerRef.current !== null || isHidden) {
      runningRef.current = false;
      return;
    }

    const bounds = getBounds();
    let { x, y } = offsetRef.current;
    let { x: vx, y: vy } = velocityRef.current;
    const dist = Math.hypot(x, y);
    const spring = SPRING_BASE + dist * SPRING_STRETCH;

    vx += -x * spring;
    vy += -y * spring;
    x += vx;
    y += vy;

    const damping = getSpringDamping();
    vx *= damping;
    vy *= damping;

    if (shouldForceSettle(x, y)) {
      settleHome();
      runningRef.current = false;
      return;
    }

    ({ x: vx, y: vy } = clampSpeed(vx, vy));

    if (x < bounds.minX) {
      x = bounds.minX;
      vx *= -0.35;
    } else if (x > bounds.maxX) {
      x = bounds.maxX;
      vx *= -0.35;
    }

    if (y < bounds.minY) {
      y = bounds.minY;
      vy *= -0.35;
    } else if (y > bounds.maxY) {
      y = bounds.maxY;
      vy *= -0.35;
    }

    offsetRef.current = { x, y };
    velocityRef.current = { x: vx, y: vy };
    setOffset({ x, y });
    syncMotionState(x, y, vx, vy);

    const speed = Math.hypot(vx, vy);
    if (Math.hypot(x, y) < SETTLE_DIST && speed < SETTLE_SPEED) {
      settleHome();
      runningRef.current = false;
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [getBounds, getSpringDamping, isHidden, settleHome, shouldForceSettle, syncMotionState]);

  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || isExploding || isReforming || isHidden) return;

      pointerRef.current = event.pointerId;
      setShakeOff(false);
      event.currentTarget.setPointerCapture(event.pointerId);

      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: offsetRef.current.x,
        originY: offsetRef.current.y,
        startTime: performance.now(),
        moved: false,
      };

      lastSampleRef.current = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
      };

      velocityRef.current = { x: 0, y: 0 };
      springSessionRef.current.active = false;
      setIsDragging(true);
      startHoldLoop();
    },
    [isExploding, isHidden, isReforming, startHoldLoop]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (pointerRef.current !== event.pointerId) return;

      const dx = event.clientX - dragRef.current.startX;
      const dy = event.clientY - dragRef.current.startY;

      if (!dragRef.current.moved && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
        dragRef.current.moved = true;
        stopHoldLoop();
      }

      if (dragRef.current.moved) {
        const bounds = getBounds();
        const next = clampToBounds(
          {
            x: dragRef.current.originX + dx,
            y: dragRef.current.originY + dy,
          },
          bounds
        );
        offsetRef.current = next;
        setOffset(next);

        const now = performance.now();
        const dt = Math.max(now - lastSampleRef.current.time, 8);
        velocityRef.current = clampSpeed(
          ((event.clientX - lastSampleRef.current.x) / dt) * 18,
          ((event.clientY - lastSampleRef.current.y) / dt) * 18
        );

        lastSampleRef.current = {
          x: event.clientX,
          y: event.clientY,
          time: now,
        };

        syncMotionState(next.x, next.y, velocityRef.current.x, velocityRef.current.y);
      }
    },
    [getBounds, stopHoldLoop, syncMotionState]
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>, onTap: () => void) => {
      if (pointerRef.current !== event.pointerId) return;

      event.currentTarget.releasePointerCapture(event.pointerId);
      pointerRef.current = null;
      setIsDragging(false);
      stopHoldLoop();

      if (explodedRef.current) {
        dragRef.current.moved = false;
        return;
      }

      const elapsed = performance.now() - dragRef.current.startTime;
      const wasTap = !dragRef.current.moved && elapsed <= TAP_MAX_MS;

      if (wasTap) {
        onTap();
      } else if (dragRef.current.moved) {
        const { x, y } = offsetRef.current;
        const dist = Math.hypot(x, y);

        if (dist > 6) {
          wasStretchedRef.current = true;
          const snap = SNAP_BASE + dist * SNAP_STRETCH;
          let { x: vx, y: vy } = velocityRef.current;

          vx += -x * snap;
          vy += -y * snap;
          vx += velocityRef.current.x * 0.25;
          vy += velocityRef.current.y * 0.25;

          velocityRef.current = clampSpeed(vx, vy);
        }
        beginSpringSession();
        startLoop();
      }

      dragRef.current.moved = false;
    },
    [beginSpringSession, startLoop, stopHoldLoop]
  );

  useEffect(() => {
    getBounds();
    const onResize = () => {
      const bounds = getBounds();
      const clamped = clampToBounds(offsetRef.current, bounds);
      offsetRef.current = clamped;
      setOffset(clamped);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
      if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current);
      if (explodeTimeoutRef.current) window.clearTimeout(explodeTimeoutRef.current);
      if (reformTimeoutRef.current) window.clearTimeout(reformTimeoutRef.current);
    };
  }, [getBounds]);

  return {
    offset,
    stretchTension,
    isDragging,
    isAirborne,
    shakeOff,
    holdProgress,
    isExploding,
    isReforming,
    isHidden,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
