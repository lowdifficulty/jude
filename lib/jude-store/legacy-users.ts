import fs from "fs";
import { DATA_DIR, USERS_FILE, ensureDataDirs } from "./paths";
import { readStoreJson, writeStoreJson } from "./storage";
import type { StoredUser } from "./types";

function userPath(userId: string) {
  return `users/by-id/${userId}.json`;
}

function usernamePath(username: string) {
  return `users/by-name/${username}.json`;
}

let legacyMigrationPromise: Promise<void> | null = null;

/** Old installs kept accounts in data/users.json — migrate into per-user files. */
export async function migrateLegacyUsersIfNeeded() {
  if (!legacyMigrationPromise) {
    legacyMigrationPromise = runLegacyMigration();
  }
  await legacyMigrationPromise;
}

async function runLegacyMigration() {
  ensureDataDirs();
  const marker = `${USERS_FILE}.migrated`;
  if (fs.existsSync(marker)) return;
  if (!fs.existsSync(USERS_FILE)) return;

  let parsed: { users?: StoredUser[] };
  try {
    parsed = JSON.parse(fs.readFileSync(USERS_FILE, "utf8")) as { users?: StoredUser[] };
  } catch {
    return;
  }

  for (const user of parsed.users || []) {
    if (!user?.id || !user.username) continue;

    const existing = await readStoreJson<StoredUser | null>(userPath(user.id), null);
    if (existing) continue;

    const normalized = user.username.trim().toLowerCase();
    const ref = await readStoreJson<{ userId?: string } | null>(usernamePath(normalized), null);
    if (ref?.userId) continue;

    await writeStoreJson(userPath(user.id), { ...user, username: normalized });
    await writeStoreJson(usernamePath(normalized), { userId: user.id });
  }

  fs.writeFileSync(marker, new Date().toISOString());
}
