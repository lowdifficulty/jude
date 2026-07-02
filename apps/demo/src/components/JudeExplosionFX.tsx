"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type JudeMode = "good" | "evil";

function useMatrixGrid() {
  const [grid, setGrid] = useState({ cols: 56, rows: 64, fs: 11 });

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const fs = Math.max(9, Math.min(12, Math.floor(vw / 64)));
      const rows = Math.ceil(vh / fs);
      const cols = Math.ceil(vw / (fs * 0.62));
      setGrid({
        cols: Math.min(140, Math.max(28, cols)),
        rows: Math.max(28, rows),
        fs,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return grid;
}

function matrixColumn(seed: number, rows: number): string {
  return Array.from({ length: rows }, (_, row) =>
    ((seed * 19 + row * 29) % 2).toString()
  ).join("\n");
}

export function JudeMatrixRain({ phase }: { phase: "out" | "in" }) {
  const { cols, rows, fs } = useMatrixGrid();
  const columns = useMemo(
    () => Array.from({ length: cols }, (_, i) => matrixColumn(i, rows)),
    [cols, rows]
  );

  return (
    <div
      className={`jude-matrix-rain jude-matrix-rain--${phase}`}
      style={
        {
          "--matrix-cols": cols,
          "--matrix-rows": rows,
          "--matrix-fs": `${fs}px`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {columns.map((text, i) => (
        <div
          key={i}
          className="jude-matrix-rain__col"
          style={{ "--col-i": i } as CSSProperties}
        >
          {text}
        </div>
      ))}
    </div>
  );
}

export function JudeExplosionFX({
  mode,
  blackhole,
}: {
  mode: JudeMode;
  blackhole?: boolean;
}) {
  const isEvil = mode === "evil";

  return (
    <div
      className={`jude-blast${isEvil ? " jude-blast--evil" : ""}${blackhole ? " jude-blast--blackhole" : ""}`}
      aria-hidden="true"
    >
      {blackhole && <div className="jude-blast__blackhole" />}
      <div className="jude-blast__flash" />
      {isEvil && !blackhole && (
        <div className="jude-blast__flash jude-blast__flash--evil-burst" />
      )}
      {!blackhole && (
        <div className="jude-blast__center">
          <div className="jude-blast__core" />
          <div className="jude-blast__halo jude-blast__halo--a" />
          <div className="jude-blast__halo jude-blast__halo--b" />
          {isEvil && <div className="jude-blast__halo jude-blast__halo--c" />}
        </div>
      )}
    </div>
  );
}

export function JudeRestoreFX({ mode }: { mode: JudeMode }) {
  if (mode === "evil") return null;

  return (
    <div className="jude-restore-fx jude-restore-fx--good" aria-hidden="true">
      <span className="jude-restore-fx__pop-ring" />
    </div>
  );
}
