"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JudeAppIcon } from "@/components/JudeAppIcon";
import {
  MARKETPLACE_APPS,
  type MarketplaceAppId,
} from "@/lib/marketplace-apps";

type JudeMode = "good" | "evil";

type JudeFooterDockProps = {
  mode: JudeMode;
  connectedIds: MarketplaceAppId[];
  onOpenMarketplace: () => void;
  onOpenApp: (id: MarketplaceAppId) => void;
  onReorder: (ids: MarketplaceAppId[]) => void;
};

type ScrollState = {
  overflow: boolean;
  canLeft: boolean;
  canRight: boolean;
};

const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 8;
const EXPAND_DRAG_PX = 56;
const COLLAPSE_DRAG_PX = 72;

const appsIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const chevronLeft = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const chevronRight = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

function getAppMeta(id: MarketplaceAppId, isEvil: boolean) {
  const app = MARKETPLACE_APPS.find((entry) => entry.id === id);
  if (!app) return null;
  const copy = isEvil ? app.evil : app.good;
  return { label: copy.name };
}

function AppTile({
  id,
  isEvil,
  className,
  onPointerDown,
  itemRef,
  ariaGrabbed,
}: {
  id: MarketplaceAppId;
  isEvil: boolean;
  className?: string;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  itemRef?: (el: HTMLDivElement | null) => void;
  ariaGrabbed?: boolean;
}) {
  const meta = getAppMeta(id, isEvil);
  if (!meta) return null;

  return (
    <div
      ref={itemRef}
      role="listitem"
      className={className}
      aria-grabbed={ariaGrabbed}
      onPointerDown={onPointerDown}
    >
      <div className="jude-status-icon" aria-hidden="true">
        <JudeAppIcon id={id} />
      </div>
      <div className="jude-status-label">{meta.label}</div>
    </div>
  );
}

export function JudeFooterDock({
  mode,
  connectedIds,
  onOpenMarketplace,
  onOpenApp,
  onReorder,
}: JudeFooterDockProps) {
  const isEvil = mode === "evil";
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<MarketplaceAppId, HTMLDivElement>>(new Map());
  const pressTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    id: MarketplaceAppId;
    pointerId: number;
    startX: number;
    order: MarketplaceAppId[];
    initialOrder: MarketplaceAppId[];
  } | null>(null);
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
  } | null>(null);
  const expandDragRef = useRef<{ pointerId: number; startY: number } | null>(null);
  const collapseDragRef = useRef<{ pointerId: number; startY: number } | null>(null);

  const [order, setOrder] = useState<MarketplaceAppId[]>(connectedIds);
  const [draggingId, setDraggingId] = useState<MarketplaceAppId | null>(null);
  const [holdHintId, setHoldHintId] = useState<MarketplaceAppId | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [scrollState, setScrollState] = useState<ScrollState>({
    overflow: false,
    canLeft: false,
    canRight: false,
  });

  useEffect(() => {
    setOrder(connectedIds);
  }, [connectedIds]);

  const updateScrollState = useCallback(() => {
    const track = scrollRef.current;
    if (!track) return;

    const overflow = track.scrollWidth > track.clientWidth + 2;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setScrollState({
      overflow,
      canLeft: overflow && track.scrollLeft > 2,
      canRight: overflow && track.scrollLeft < maxScroll - 2,
    });
  }, []);

  const clearPressTimer = useCallback(() => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  const nudgeScroll = useCallback((direction: -1 | 1) => {
    const track = scrollRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.55, 120),
      behavior: "smooth",
    });
  }, []);

  const swapByPointerX = useCallback((clientX: number, currentOrder: MarketplaceAppId[], activeId: MarketplaceAppId) => {
    const activeIndex = currentOrder.indexOf(activeId);
    if (activeIndex < 0) return currentOrder;

    let targetIndex = activeIndex;
    let closestDistance = Infinity;

    currentOrder.forEach((id, index) => {
      const el = itemRefs.current.get(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(clientX - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        targetIndex = index;
      }
    });

    if (targetIndex === activeIndex) return currentOrder;

    const next = [...currentOrder];
    const [moved] = next.splice(activeIndex, 1);
    next.splice(targetIndex, 0, moved);
    return next;
  }, []);

  const finishDrag = useCallback(
    (commit: boolean) => {
      const drag = dragStateRef.current;
      dragStateRef.current = null;
      setDraggingId(null);
      setHoldHintId(null);

      if (drag && commit) {
        onReorder(drag.order);
      } else {
        setOrder(connectedIds);
      }
    },
    [connectedIds, onReorder]
  );

  const handleTrackPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      if ((event.target as HTMLElement).closest(".jude-status-item--app")) return;
      if (!scrollState.overflow) return;

      const track = scrollRef.current;
      if (!track) return;

      panRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startScrollLeft: track.scrollLeft,
      };
      setIsPanning(true);
      track.setPointerCapture(event.pointerId);
    },
    [scrollState.overflow]
  );

  const handleTrackPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    const track = scrollRef.current;
    if (!pan || !track || pan.pointerId !== event.pointerId) return;

    track.scrollLeft = pan.startScrollLeft - (event.clientX - pan.startX);
    updateScrollState();
  }, [updateScrollState]);

  const endTrackPan = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const pan = panRef.current;
      if (!pan || pan.pointerId !== event.pointerId) return;

      panRef.current = null;
      setIsPanning(false);
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
      updateScrollState();
    },
    [updateScrollState]
  );

  const handleItemPointerDown = useCallback(
    (id: MarketplaceAppId, event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;

      const target = event.currentTarget;
      clearPressTimer();
      const startX = event.clientX;
      const pointerId = event.pointerId;
      let lastX = startX;
      let moved = false;
      let panningItem = false;

      pressTimerRef.current = window.setTimeout(() => {
        pressTimerRef.current = null;
        setHoldHintId(id);
        setDraggingId(id);
        dragStateRef.current = {
          id,
          pointerId,
          startX,
          order: [...order],
          initialOrder: [...order],
        };
        target.setPointerCapture(pointerId);
        if (scrollRef.current) {
          scrollRef.current.style.overflowX = "hidden";
        }
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(12);
        }
      }, LONG_PRESS_MS);

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;

        if (dragStateRef.current) {
          moveEvent.preventDefault();
          const nextOrder = swapByPointerX(
            moveEvent.clientX,
            dragStateRef.current.order,
            dragStateRef.current.id
          );
          if (nextOrder !== dragStateRef.current.order) {
            dragStateRef.current = { ...dragStateRef.current, order: nextOrder };
            setOrder(nextOrder);
          }
          return;
        }

        const deltaX = moveEvent.clientX - lastX;
        if (Math.abs(moveEvent.clientX - startX) > MOVE_CANCEL_PX) {
          moved = true;
          clearPressTimer();
          setHoldHintId(null);

          if (scrollState.overflow && scrollRef.current) {
            panningItem = true;
            scrollRef.current.scrollLeft -= deltaX;
            updateScrollState();
          }
        }
        lastX = moveEvent.clientX;
      };

      const onUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== pointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        const wasDragging = dragStateRef.current?.id === id;
        clearPressTimer();
        setHoldHintId(null);

        if (scrollRef.current) {
          scrollRef.current.style.overflowX = "";
        }

        if (wasDragging) {
          try {
            target.releasePointerCapture(pointerId);
          } catch {
            /* already released */
          }
          const changed =
            dragStateRef.current!.order.join(",") !==
            dragStateRef.current!.initialOrder.join(",");
          finishDrag(changed);
          updateScrollState();
          return;
        }

        if (!moved && !panningItem) {
          onOpenApp(id);
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [clearPressTimer, finishDrag, onOpenApp, order, scrollState.overflow, swapByPointerX, updateScrollState]
  );

  const handleExpandPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || order.length === 0) return;
    expandDragRef.current = { pointerId: event.pointerId, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [order.length]);

  const handleExpandPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = expandDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.startY - event.clientY >= EXPAND_DRAG_PX) {
      setExpanded(true);
      expandDragRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    }
  }, []);

  const handleExpandPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = expandDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (Math.abs(event.clientY - drag.startY) < 8) {
      setExpanded(true);
    }

    expandDragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const handleSheetPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    collapseDragRef.current = { pointerId: event.pointerId, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handleSheetPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = collapseDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.clientY - drag.startY >= COLLAPSE_DRAG_PX) {
      setExpanded(false);
      collapseDragRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    }
  }, []);

  const handleSheetPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = collapseDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    collapseDragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  useEffect(() => () => clearPressTimer(), [clearPressTimer]);

  useEffect(() => {
    document.body.classList.toggle("jude-dock-expanded-open", expanded);
    return () => document.body.classList.remove("jude-dock-expanded-open");
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  useEffect(() => {
    const track = scrollRef.current;
    if (!track) return;

    const onWheel = (event: WheelEvent) => {
      if (track.scrollWidth <= track.clientWidth) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) return;
      track.scrollLeft += delta;
      event.preventDefault();
      updateScrollState();
    };

    const onScroll = () => updateScrollState();

    track.addEventListener("wheel", onWheel, { passive: false });
    track.addEventListener("scroll", onScroll, { passive: true });
    updateScrollState();

    const observer = new ResizeObserver(() => updateScrollState());
    observer.observe(track);

    return () => {
      track.removeEventListener("wheel", onWheel);
      track.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [order.length, updateScrollState]);

  const [compactView, setCompactView] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 540px), (max-height: 680px)");
    const sync = () => setCompactView(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const showExpandHint =
    scrollState.overflow || order.length >= (compactView ? 1 : 3);

  return (
    <>
      <footer className={`jude-status${scrollState.overflow ? " jude-status--overflow" : ""}`}>
        <div className="jude-status-shell">
          {scrollState.canLeft && (
            <button
              type="button"
              className="jude-status-nudge jude-status-nudge--left"
              aria-label="Scroll apps left"
              onClick={() => nudgeScroll(-1)}
            >
              {chevronLeft}
            </button>
          )}

          <div
            ref={scrollRef}
            className={`jude-status-track${draggingId ? " jude-status-track--dragging" : ""}${scrollState.overflow ? " jude-status-track--scrollable" : ""}${isPanning ? " jude-status-track--panning" : ""}`}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            onPointerUp={endTrackPan}
            onPointerCancel={endTrackPan}
          >
            <div
              className="jude-status-row"
              role="list"
              aria-label={isEvil ? "Connected integrations" : "Connected apps"}
            >
              <button
                type="button"
                className="jude-status-item jude-status-item--action jude-status-item--launcher"
                onClick={onOpenMarketplace}
                aria-label={isEvil ? "Open app vault" : "Open app marketplace"}
              >
                <div className="jude-status-icon">{appsIcon}</div>
                <div className="jude-status-label">Apps</div>
              </button>

              {order.map((id) => {
                const isDragging = draggingId === id;
                const isHoldHint = holdHintId === id && !isDragging;

                return (
                  <AppTile
                    key={id}
                    id={id}
                    isEvil={isEvil}
                    className={`jude-status-item jude-status-item--app${isDragging ? " jude-status-item--dragging" : ""}${isHoldHint ? " jude-status-item--hold-hint" : ""}`}
                    ariaGrabbed={isDragging}
                    itemRef={(el) => {
                      if (el) itemRefs.current.set(id, el);
                      else itemRefs.current.delete(id);
                    }}
                    onPointerDown={(event) => handleItemPointerDown(id, event)}
                  />
                );
              })}
            </div>
          </div>

          {scrollState.canRight && (
            <button
              type="button"
              className="jude-status-nudge jude-status-nudge--right"
              aria-label="Scroll apps right"
              onClick={() => nudgeScroll(1)}
            >
              {chevronRight}
            </button>
          )}
        </div>

        {showExpandHint && (
          <div
            className="jude-status-expand-hint"
            role="button"
            tabIndex={0}
            aria-label={isEvil ? "Expand all integrations" : "Expand all apps"}
            onPointerDown={handleExpandPointerDown}
            onPointerMove={handleExpandPointerMove}
            onPointerUp={handleExpandPointerUp}
            onPointerCancel={handleExpandPointerUp}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setExpanded(true);
              }
            }}
          />
        )}
      </footer>

      {expanded && (
        <div
          className={`jude-dock-expand${isEvil ? " jude-dock-expand--evil" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={isEvil ? "All integrations" : "All connected apps"}
        >
          <button
            type="button"
            className="jude-dock-expand__backdrop"
            aria-label="Close expanded apps"
            onClick={() => setExpanded(false)}
          />

          <div className="jude-dock-expand__sheet">
            <div
              className="jude-dock-expand__handle"
              onPointerDown={handleSheetPointerDown}
              onPointerMove={handleSheetPointerMove}
              onPointerUp={handleSheetPointerUp}
              onPointerCancel={handleSheetPointerUp}
            >
              <span />
            </div>

            <div className="jude-dock-expand__header">
              <p>{isEvil ? "Full vault" : "Your apps"}</p>
              <button type="button" onClick={() => setExpanded(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="jude-dock-expand__grid" role="list">
              <button
                type="button"
                className="jude-dock-expand__tile jude-dock-expand__tile--launcher"
                onClick={() => {
                  setExpanded(false);
                  onOpenMarketplace();
                }}
              >
                <div className="jude-status-icon">{appsIcon}</div>
                <div className="jude-status-label">Apps</div>
              </button>

              {order.map((id) => {
                const meta = getAppMeta(id, isEvil);
                if (!meta) return null;

                return (
                  <button
                    key={id}
                    type="button"
                    className="jude-dock-expand__tile"
                    onClick={() => {
                      setExpanded(false);
                      onOpenApp(id);
                    }}
                  >
                    <div className="jude-status-icon" aria-hidden="true">
                      <JudeAppIcon id={id} />
                    </div>
                    <div className="jude-status-label">{meta.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
