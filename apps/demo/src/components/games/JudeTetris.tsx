"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type JudeMode = "good" | "evil";

const COLS = 10;
const ROWS = 18;
const CELL = 14;

type Cell = number;
type Piece = { shape: number[][]; color: number };

const PIECES: Piece[] = [
  { shape: [[1, 1, 1, 1]], color: 0 },
  { shape: [[1, 1], [1, 1]], color: 1 },
  { shape: [[0, 1, 0], [1, 1, 1]], color: 2 },
  { shape: [[0, 1, 1], [1, 1, 0]], color: 3 },
  { shape: [[1, 1, 0], [0, 1, 1]], color: 4 },
  { shape: [[1, 0, 0], [1, 1, 1]], color: 5 },
  { shape: [[0, 0, 1], [1, 1, 1]], color: 6 },
];

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function rotate(shape: number[][]) {
  return shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
}

function collides(board: Cell[][], shape: number[][], x: number, y: number) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = x + c;
      const ny = y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function merge(board: Cell[][], shape: number[][], x: number, y: number, id: number) {
  const next = board.map((row) => [...row]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const ny = y + r;
      const nx = x + c;
      if (ny >= 0) next[ny][nx] = id + 1;
    }
  }
  return next;
}

function clearLines(board: Cell[][]) {
  const kept = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) {
    kept.unshift(Array(COLS).fill(0));
  }
  return { board: kept, cleared };
}

function randomPiece() {
  const base = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { ...base, shape: base.shape.map((row) => [...row]) };
}

export function JudeTetris({ mode, onClose }: { mode: JudeMode; onClose: () => void }) {
  const isEvil = mode === "evil";
  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard());
  const [active, setActive] = useState(() => randomPiece());
  const [pos, setPos] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const stateRef = useRef({ board, active, pos, gameOver });
  stateRef.current = { board, active, pos, gameOver };

  const spawn = useCallback((currentBoard: Cell[][]) => {
    const piece = randomPiece();
    const start = { x: 3, y: 0 };
    if (collides(currentBoard, piece.shape, start.x, start.y)) {
      setGameOver(true);
      return null;
    }
    setActive(piece);
    setPos(start);
    return piece;
  }, []);

  const lockPiece = useCallback(() => {
    const { board: b, active: a, pos: p } = stateRef.current;
    const merged = merge(b, a.shape, p.x, p.y, a.color);
    const { board: clearedBoard, cleared } = clearLines(merged);
    if (cleared) setScore((s) => s + cleared * 100);
    setBoard(clearedBoard);
    spawn(clearedBoard);
  }, [spawn]);

  const tryMove = useCallback(
    (dx: number, dy: number, nextShape?: number[][]) => {
      if (stateRef.current.gameOver) return false;
      const { board: b, active: a, pos: p } = stateRef.current;
      const shape = nextShape || a.shape;
      const target = { x: p.x + dx, y: p.y + dy };
      if (collides(b, shape, target.x, target.y)) {
        if (dy > 0) lockPiece();
        return false;
      }
      if (nextShape) setActive({ ...a, shape: nextShape });
      setPos(target);
      return true;
    },
    [lockPiece]
  );

  const hardDrop = useCallback(() => {
    if (stateRef.current.gameOver) return;
    while (tryMove(0, 1)) {
      /* drop */
    }
  }, [tryMove]);

  const reset = useCallback(() => {
    const fresh = emptyBoard();
    setBoard(fresh);
    setScore(0);
    setGameOver(false);
    spawn(fresh);
  }, [spawn]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") tryMove(-1, 0);
      if (event.key === "ArrowRight") tryMove(1, 0);
      if (event.key === "ArrowDown") tryMove(0, 1);
      if (event.key === "ArrowUp") tryMove(0, 0, rotate(stateRef.current.active.shape));
      if (event.key === " ") {
        event.preventDefault();
        hardDrop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hardDrop, tryMove]);

  useEffect(() => {
    const id = window.setInterval(() => tryMove(0, 1), 520);
    return () => window.clearInterval(id);
  }, [tryMove]);

  const renderBoard = board.map((row) => [...row]);
  if (!gameOver) {
    for (let r = 0; r < active.shape.length; r++) {
      for (let c = 0; c < active.shape[r].length; c++) {
        if (!active.shape[r][c]) continue;
        const y = pos.y + r;
        const x = pos.x + c;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
          renderBoard[y][x] = active.color + 1;
        }
      }
    }
  }

  return (
    <div className={`jude-game jude-game--tetris${isEvil ? " jude-game--evil" : ""}`}>
      <div className="jude-game__head">
        <div>
          <h2>{isEvil ? "Blocks of Damnation" : "Cozy Blocks"}</h2>
          <p>{isEvil ? "Stack the void. Clear the lines." : "Stack a little happiness."}</p>
        </div>
        <div className="jude-game__score">
          <span>{isEvil ? "Doom" : "Score"}</span>
          <strong>{score}</strong>
        </div>
      </div>

      <div
        className="jude-game__board jude-game__board--tetris"
        style={{
          width: COLS * CELL,
          height: ROWS * CELL,
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
        }}
      >
        {renderBoard.flatMap((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`jude-game__cell${cell ? ` jude-game__cell--t${cell}` : ""}`}
            />
          ))
        )}
      </div>

      {gameOver && (
        <p className="jude-game__overlay">
          {isEvil ? "The tower crumbles. Again, mortal?" : "Well now, that stack got away from us."}
        </p>
      )}

      <div className="jude-game__actions">
        <button type="button" className="jude-game__btn" onClick={() => tryMove(0, 0, rotate(active.shape))}>
          Rotate
        </button>
        <button type="button" className="jude-game__btn" onClick={() => tryMove(-1, 0)}>
          ←
        </button>
        <button type="button" className="jude-game__btn" onClick={() => tryMove(1, 0)}>
          →
        </button>
        <button type="button" className="jude-game__btn" onClick={() => tryMove(0, 1)}>
          ↓
        </button>
        {gameOver && (
          <button type="button" className="jude-game__btn" onClick={reset}>
            {isEvil ? "Rebuild" : "Try again"}
          </button>
        )}
        <button type="button" className="jude-game__btn jude-game__btn--ghost" onClick={onClose}>
          Back
        </button>
      </div>
    </div>
  );
}
