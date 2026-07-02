"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type JudeMode = "good" | "evil";

const GRID = 16;
const CELL = 14;
const TICK_MS = 130;

type Point = { x: number; y: number };

const START: Point[] = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
];

function randomFood(snake: Point[]): Point {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  let spot: Point = { x: 4, y: 4 };
  for (let i = 0; i < 80; i++) {
    spot = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
    if (!occupied.has(`${spot.x},${spot.y}`)) return spot;
  }
  return spot;
}

export function JudeSnake({ mode, onClose }: { mode: JudeMode; onClose: () => void }) {
  const isEvil = mode === "evil";
  const [snake, setSnake] = useState<Point[]>(START);
  const [food, setFood] = useState<Point>(() => randomFood(START));
  const [dir, setDir] = useState<Point>({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const reset = useCallback(() => {
    setSnake(START);
    setFood(randomFood(START));
    setDir({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      const current = dirRef.current;
      if (key === "ArrowUp" && current.y !== 1) setDir({ x: 0, y: -1 });
      if (key === "ArrowDown" && current.y !== -1) setDir({ x: 0, y: 1 });
      if (key === "ArrowLeft" && current.x !== 1) setDir({ x: -1, y: 0 });
      if (key === "ArrowRight" && current.x !== -1) setDir({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const id = window.setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const next = {
          x: head.x + dirRef.current.x,
          y: head.y + dirRef.current.y,
        };

        if (next.x < 0 || next.y < 0 || next.x >= GRID || next.y >= GRID) {
          setGameOver(true);
          return prev;
        }

        if (prev.some((part) => part.x === next.x && part.y === next.y)) {
          setGameOver(true);
          return prev;
        }

        const ate = next.x === food.x && next.y === food.y;
        const body = [next, ...prev];
        if (!ate) body.pop();
        else {
          setScore((s) => s + 1);
          setFood(randomFood(body));
        }
        return body;
      });
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [food, gameOver]);

  const turn = (next: Point) => {
    const current = dirRef.current;
    if (next.x === -current.x && next.y === -current.y) return;
    setDir(next);
  };

  return (
    <div className={`jude-game jude-game--snake${isEvil ? " jude-game--evil" : ""}`}>
      <div className="jude-game__head">
        <div>
          <h2>{isEvil ? "Serpent of Doom" : "Porch Snake"}</h2>
          <p>{isEvil ? "Devour souls. Grow stronger." : "A little game while you visit."}</p>
        </div>
        <div className="jude-game__score">
          <span>{isEvil ? "Souls" : "Score"}</span>
          <strong>{score}</strong>
        </div>
      </div>

      <div
        className="jude-game__board"
        style={{
          width: GRID * CELL,
          height: GRID * CELL,
          gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`,
        }}
      >
        {Array.from({ length: GRID * GRID }, (_, i) => {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isBody = snake.some((part, idx) => idx > 0 && part.x === x && part.y === y);
          const isFood = food.x === x && food.y === y;
          let className = "jude-game__cell";
          if (isHead) className += " jude-game__cell--head";
          else if (isBody) className += " jude-game__cell--body";
          else if (isFood) className += " jude-game__cell--food";
          return <div key={i} className={className} />;
        })}
      </div>

      {gameOver && (
        <p className="jude-game__overlay">
          {isEvil ? "The serpent falls. Try again, mortal." : "Oh sugar, game over! Tap retry."}
        </p>
      )}

      <div className="jude-game__controls">
        <button type="button" onClick={() => turn({ x: 0, y: -1 })} aria-label="Up">
          ↑
        </button>
        <div>
          <button type="button" onClick={() => turn({ x: -1, y: 0 })} aria-label="Left">
            ←
          </button>
          <button type="button" onClick={() => turn({ x: 1, y: 0 })} aria-label="Right">
            →
          </button>
        </div>
        <button type="button" onClick={() => turn({ x: 0, y: 1 })} aria-label="Down">
          ↓
        </button>
      </div>

      <div className="jude-game__actions">
        {gameOver && (
          <button type="button" className="jude-game__btn" onClick={reset}>
            {isEvil ? "Rise again" : "Play again"}
          </button>
        )}
        <button type="button" className="jude-game__btn jude-game__btn--ghost" onClick={onClose}>
          Back
        </button>
      </div>
    </div>
  );
}
