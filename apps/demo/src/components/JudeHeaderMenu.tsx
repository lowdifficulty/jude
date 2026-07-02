"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JudeMode } from "@jude/store";

type JudeHeaderMenuProps = {
  displayName: string;
  time: string;
  mode: JudeMode;
  onModeChange: (mode: JudeMode) => void;
  onLogout: () => void;
};

export function JudeHeaderMenu({
  displayName,
  time,
  mode,
  onModeChange,
  onLogout,
}: JudeHeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isEvil = mode === "evil";

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMenu, open]);

  const pickMode = (nextMode: JudeMode) => {
    onModeChange(nextMode);
    closeMenu();
  };

  return (
    <>
      {open ? (
        <button
          type="button"
          className="jude-header-menu__backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}

      <div
        className={`jude-header-menu${open ? " jude-header-menu--open" : ""}`}
        ref={menuRef}
      >
        <button
          type="button"
          className={`jude-header-menu__trigger${isEvil ? " jude-header-menu__trigger--evil" : ""}${open ? " jude-header-menu__trigger--open" : ""}`}
          aria-label="Menu"
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="jude-header-menu__bar" />
          <span className="jude-header-menu__bar" />
          <span className="jude-header-menu__bar" />
        </button>

        {open ? (
          <div className={`jude-header-menu__panel${isEvil ? " jude-header-menu__panel--evil" : ""}`}>
            <p className="jude-header-menu__name">{displayName}</p>
            <p className="jude-header-menu__time">{time}</p>

            <div className="jude-header-menu__section">
              <p className="jude-header-menu__label">Mode</p>
              <div className="jude-mode-toggle jude-header-menu__mode" role="group" aria-label="Jude mode">
                <button
                  type="button"
                  aria-pressed={mode === "good"}
                  className={`jude-mode-toggle__btn${mode === "good" ? " jude-mode-toggle__btn--active" : ""}`}
                  onClick={() => pickMode("good")}
                >
                  Good
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "evil"}
                  className={`jude-mode-toggle__btn jude-mode-toggle__btn--evil${mode === "evil" ? " jude-mode-toggle__btn--active" : ""}`}
                  onClick={() => pickMode("evil")}
                >
                  Evil
                </button>
              </div>
            </div>

            <button
              type="button"
              className="jude-header-menu__logout"
              onClick={() => {
                closeMenu();
                void onLogout();
              }}
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
