import fs from "fs";
import path from "path";

export function getRepoRoot() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "data"))) return cwd;
  if (fs.existsSync(path.join(cwd, "../../data"))) return path.join(cwd, "../..");
  return cwd;
}

export const DATA_DIR = path.join(getRepoRoot(), "data");
export const PROFILES_DIR = path.join(DATA_DIR, "profiles");
export const USERS_FILE = path.join(DATA_DIR, "users.json");
export const ADMIN_OVERRIDES_FILE = path.join(DATA_DIR, "admin-overrides.json");
export const TRAINING_HISTORY_FILE = path.join(DATA_DIR, "training-history.json");

export function ensureDataDirs() {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
}
