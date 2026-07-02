import fs from "fs";
import { hashPassword, verifyPassword } from "./crypto";
import { ensureDataDirs, USERS_FILE } from "./paths";
import type { StoredUser } from "./types";

type UsersFile = { users: StoredUser[] };

function readUsersFile(): UsersFile {
  ensureDataDirs();
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
    return { users: [] };
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")) as UsersFile;
}

function writeUsersFile(data: UsersFile) {
  ensureDataDirs();
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

export function findUserByUsername(username: string) {
  const normalized = username.trim().toLowerCase();
  return readUsersFile().users.find((u) => u.username === normalized) || null;
}

export function findUserById(id: string) {
  return readUsersFile().users.find((u) => u.id === id) || null;
}

export function createUser(input: {
  username: string;
  password: string;
  displayName?: string;
}) {
  const username = input.username.trim().toLowerCase();
  if (!username || username.length < 2) {
    throw new Error("Username must be at least 2 characters.");
  }
  if (input.password.length < 1) {
    throw new Error("Password is required.");
  }
  if (findUserByUsername(username)) {
    throw new Error("Username is already taken.");
  }

  const { salt, hash } = hashPassword(input.password);
  const user: StoredUser = {
    id: `user-${Date.now()}`,
    username,
    displayName: input.displayName?.trim() || username,
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };

  const file = readUsersFile();
  file.users.push(user);
  writeUsersFile(file);
  return user;
}

export function verifyUserCredentials(username: string, password: string) {
  const user = findUserByUsername(username);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) return null;
  return user;
}
