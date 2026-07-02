import { hashPassword, verifyPassword } from "./crypto";
import { readStoreJson, writeStoreJson } from "./storage";
import type { StoredUser } from "./types";

type UsersFile = { users: StoredUser[] };

async function readUsersFile(): Promise<UsersFile> {
  return readStoreJson<UsersFile>("users.json", { users: [] });
}

async function writeUsersFile(data: UsersFile) {
  await writeStoreJson("users.json", data);
}

export async function findUserByUsername(username: string) {
  const normalized = username.trim().toLowerCase();
  const file = await readUsersFile();
  return file.users.find((u) => u.username === normalized) || null;
}

export async function findUserById(id: string) {
  const file = await readUsersFile();
  return file.users.find((u) => u.id === id) || null;
}

export async function createUser(input: {
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
  if (await findUserByUsername(username)) {
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

  const file = await readUsersFile();
  file.users.push(user);
  await writeUsersFile(file);
  return user;
}

export async function verifyUserCredentials(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) return null;
  return user;
}
