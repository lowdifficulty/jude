import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import {
  ADMIN_OVERRIDES_FILE,
  TRAINING_HISTORY_FILE,
  ensureDataDirs,
  getRepoRoot,
} from "./paths";
import type { AdminEntry, TrainingSnapshot } from "./types";

type HistoryFile = { snapshots: TrainingSnapshot[] };

function readHistory(): HistoryFile {
  ensureDataDirs();
  if (!fs.existsSync(TRAINING_HISTORY_FILE)) {
    fs.writeFileSync(TRAINING_HISTORY_FILE, JSON.stringify({ snapshots: [] }, null, 2));
    return { snapshots: [] };
  }
  return JSON.parse(fs.readFileSync(TRAINING_HISTORY_FILE, "utf8")) as HistoryFile;
}

function writeHistory(data: HistoryFile) {
  ensureDataDirs();
  fs.writeFileSync(TRAINING_HISTORY_FILE, JSON.stringify(data, null, 2));
}

export function readAdminOverrides(): AdminEntry[] {
  ensureDataDirs();
  if (!fs.existsSync(ADMIN_OVERRIDES_FILE)) {
    fs.writeFileSync(ADMIN_OVERRIDES_FILE, JSON.stringify([], null, 2));
    return [];
  }
  return JSON.parse(fs.readFileSync(ADMIN_OVERRIDES_FILE, "utf8")) as AdminEntry[];
}

export function writeAdminOverrides(entries: AdminEntry[]) {
  ensureDataDirs();
  fs.writeFileSync(ADMIN_OVERRIDES_FILE, JSON.stringify(entries, null, 2));
  syncDemoOverrides(entries);
}

function syncDemoOverrides(entries: AdminEntry[]) {
  const demoFile = path.join(getRepoRoot(), "apps/demo/knowledge/admin-overrides.json");
  fs.mkdirSync(path.dirname(demoFile), { recursive: true });
  fs.writeFileSync(demoFile, JSON.stringify(entries, null, 2));
}

export function pushHistorySnapshot(
  label: string,
  action: TrainingSnapshot["action"],
  entries: AdminEntry[]
) {
  const history = readHistory();
  const snapshot: TrainingSnapshot = {
    id: `snap-${Date.now()}`,
    createdAt: new Date().toISOString(),
    label,
    action,
    entries: structuredClone(entries),
  };
  history.snapshots.unshift(snapshot);
  history.snapshots = history.snapshots.slice(0, 50);
  writeHistory(history);
  return snapshot;
}

export function listHistory() {
  return readHistory().snapshots;
}

export function revertToSnapshot(snapshotId: string) {
  const history = readHistory();
  const snapshot = history.snapshots.find((s) => s.id === snapshotId);
  if (!snapshot) throw new Error("Snapshot not found.");

  pushHistorySnapshot(`Before revert to ${snapshot.label}`, "revert", readAdminOverrides());
  writeAdminOverrides(structuredClone(snapshot.entries));
  return snapshot;
}

export function appendAdminEntry(entry: Omit<AdminEntry, "id" | "createdAt">) {
  const entries = readAdminOverrides();
  pushHistorySnapshot(`Before save: ${entry.title}`, "save", entries);

  const next: AdminEntry = {
    id: `admin-${Date.now()}`,
    title: entry.title,
    category: entry.category,
    text: entry.text,
    createdAt: new Date().toISOString(),
  };
  entries.unshift(next);
  writeAdminOverrides(entries);
  return next;
}

export function clearAdminOverrides() {
  pushHistorySnapshot("Before clear all", "clear", readAdminOverrides());
  writeAdminOverrides([]);
}

export function runKnowledgeRebuild() {
  const root = getRepoRoot();
  pushHistorySnapshot("Before relearn rebuild", "relearn", readAdminOverrides());
  execSync("npm run build:knowledge", {
    cwd: root,
    stdio: "pipe",
    env: process.env,
  });
  return { ok: true, rebuiltAt: new Date().toISOString() };
}
