import { hashPassword, verifyPassword } from "./crypto";
import { migrateLegacyUsersIfNeeded } from "./legacy-users";
import { assertPersistentStorage, readStoreJson, writeStoreJson } from "./storage";
import type { StoredUser } from "./types";

function userPath(userId: string) {
  return `users/by-id/${userId}.json`;
}

function usernamePath(username: string) {
  return `users/by-name/${username}.json`;
}

export async function findUserByUsername(username: string) {
  await migrateLegacyUsersIfNeeded();
  const normalized = username.trim().toLowerCase();
  const ref = await readStoreJson<{ userId?: string } | null>(usernamePath(normalized), null);
  if (!ref?.userId) return null;
  return findUserById(ref.userId);
}

export async function findUserById(id: string) {
  await migrateLegacyUsersIfNeeded();
  return readStoreJson<StoredUser | null>(userPath(id), null);
}

export async function createUser(input: {
  username: string;
  password: string;
  displayName?: string;
}) {
  await migrateLegacyUsersIfNeeded();
  assertPersistentStorage();

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

  await writeStoreJson(userPath(user.id), user);
  await writeStoreJson(usernamePath(username), { userId: user.id });
  return user;
}

export async function verifyUserCredentials(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) return null;
  return user;
}
