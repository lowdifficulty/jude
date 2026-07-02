import fs from "fs";
import path from "path";

function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export function getRepoRoot() {
  if (isServerlessRuntime()) {
    return path.join("/tmp", "jude-data");
  }

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
export const INTEGRATIONS_DIR = path.join(DATA_DIR, "integrations");

export function ensureDataDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
  fs.mkdirSync(INTEGRATIONS_DIR, { recursive: true });
}
