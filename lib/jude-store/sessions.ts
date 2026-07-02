import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { signSession, verifySession } from "./crypto";
import { findUserById } from "./users";

export const ADMIN_USERNAME = process.env.JUDE_ADMIN_USER || "9";
export const ADMIN_PASSWORD = process.env.JUDE_ADMIN_PASS || "9";
export const ADMIN_COOKIE = "jude_admin_session";
export const USER_COOKIE = "jude_user_session";

function adminSessionToken() {
  return createHash("sha256")
    .update(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}:jude-admin-v1`)
    .digest("hex");
}

export function verifyAdminCredentials(username: string, password: string) {
  const userOk =
    username.length === ADMIN_USERNAME.length &&
    timingSafeEqual(Buffer.from(username), Buffer.from(ADMIN_USERNAME));
  const passOk =
    password.length === ADMIN_PASSWORD.length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD));
  return userOk && passOk;
}

export function getAdminSessionToken() {
  return adminSessionToken();
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = adminSessionToken();
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function getUserSessionToken(userId: string) {
  return signSession(`user:${userId}`);
}

export function buildUserCookieValue(userId: string) {
  return `${userId}:${getUserSessionToken(userId)}`;
}

export function parseUserCookieValue(raw: string | undefined) {
  if (!raw?.includes(":")) return null;
  const colon = raw.indexOf(":");
  const userId = raw.slice(0, colon);
  const sessionToken = raw.slice(colon + 1);
  if (!userId || !sessionToken) return null;
  if (!verifySession(`user:${userId}`, sessionToken)) return null;
  return userId;
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const userId = parseUserCookieValue(cookieStore.get(USER_COOKIE)?.value);
  if (!userId) return null;
  return findUserById(userId);
}
