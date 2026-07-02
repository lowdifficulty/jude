/**
 * One-time migration: data/users.json → data/users/by-id + by-name
 * Usage: node scripts/migrate-legacy-users.mjs
 */

import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const dataDir = path.join(root, "data");
const usersFile = path.join(dataDir, "users.json");
const marker = `${usersFile}.migrated`;
const byIdDir = path.join(dataDir, "users", "by-id");
const byNameDir = path.join(dataDir, "users", "by-name");

if (fs.existsSync(marker)) {
  console.log("Legacy users already migrated.");
  process.exit(0);
}

if (!fs.existsSync(usersFile)) {
  console.log("No legacy users.json found.");
  process.exit(0);
}

const { users = [] } = JSON.parse(fs.readFileSync(usersFile, "utf8"));
fs.mkdirSync(byIdDir, { recursive: true });
fs.mkdirSync(byNameDir, { recursive: true });

let migrated = 0;
for (const user of users) {
  if (!user?.id || !user?.username) continue;
  const normalized = user.username.trim().toLowerCase();
  const idFile = path.join(byIdDir, `${user.id}.json`);
  const nameFile = path.join(byNameDir, `${normalized}.json`);
  if (fs.existsSync(idFile) && fs.existsSync(nameFile)) continue;

  fs.writeFileSync(idFile, JSON.stringify({ ...user, username: normalized }, null, 2));
  fs.writeFileSync(nameFile, JSON.stringify({ userId: user.id }, null, 2));
  migrated += 1;
  console.log(`Migrated ${normalized} (${user.id})`);
}

fs.writeFileSync(marker, new Date().toISOString());
console.log(`Done. Migrated ${migrated} user(s).`);
