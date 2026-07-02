/**
 * Ensure local dev test account exists (username/password: 33).
 * Usage: node scripts/seed-dev-user.mjs
 */

import { randomBytes, scryptSync } from "crypto";
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const dataDir = path.join(root, "data");
const byIdDir = path.join(dataDir, "users", "by-id");
const byNameDir = path.join(dataDir, "users", "by-name");
const profilesDir = path.join(dataDir, "profiles");

const USERNAME = "33";
const PASSWORD = "33";

function hashPassword(password, salt) {
  const useSalt = salt || randomBytes(16).toString("hex");
  const hash = scryptSync(password, useSalt, 64).toString("hex");
  return { salt: useSalt, hash };
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

fs.mkdirSync(byIdDir, { recursive: true });
fs.mkdirSync(byNameDir, { recursive: true });
fs.mkdirSync(profilesDir, { recursive: true });

const nameRef = readJson(path.join(byNameDir, `${USERNAME}.json`));
let userId = nameRef?.userId;
let user = userId ? readJson(path.join(byIdDir, `${userId}.json`)) : null;

if (!user) {
  userId = `user-${Date.now()}`;
  const { salt, hash } = hashPassword(PASSWORD);
  user = {
    id: userId,
    username: USERNAME,
    displayName: "Dev",
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  writeJson(path.join(byIdDir, `${userId}.json`), user);
  writeJson(path.join(byNameDir, `${USERNAME}.json`), { userId });
  console.log(`Created dev user "${USERNAME}" (${userId})`);
} else {
  const { salt, hash } = hashPassword(PASSWORD, user.passwordSalt);
  user.passwordSalt = salt;
  user.passwordHash = hash;
  user.displayName = user.displayName || "Dev";
  writeJson(path.join(byIdDir, `${user.id}.json`), user);
  console.log(`Reset password for dev user "${USERNAME}" (${user.id})`);
}

const profilePath = path.join(profilesDir, `${user.id}.json`);
if (!fs.existsSync(profilePath)) {
  writeJson(profilePath, {
    userId: user.id,
    username: USERNAME,
    displayName: user.displayName,
    onboardingGroups: [],
    connectedDeviceIds: [],
    connectedAppIds: [],
    appSettings: {},
    integrations: {},
    personalTraining: [],
    preferences: {},
    updatedAt: new Date().toISOString(),
  });
  console.log("Created profile for dev user.");
}

console.log(`\nLocal dev sign-in:\n  URL: http://localhost:3002/login\n  Username: ${USERNAME}\n  Password: ${PASSWORD}\n`);
