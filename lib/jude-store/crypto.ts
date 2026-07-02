import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SESSION_SECRET =
  process.env.JUDE_SESSION_SECRET || "jude-dev-session-secret-change-in-prod";

export function hashPassword(password: string, salt?: string) {
  const useSalt = salt || randomBytes(16).toString("hex");
  const hash = scryptSync(password, useSalt, 64).toString("hex");
  return { salt: useSalt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const attempt = scryptSync(password, salt, 64).toString("hex");
  if (attempt.length !== hash.length) return false;
  return timingSafeEqual(Buffer.from(attempt), Buffer.from(hash));
}

export function signSession(payload: string) {
  return createHash("sha256").update(`${SESSION_SECRET}:${payload}`).digest("hex");
}

export function verifySession(payload: string, token: string) {
  const expected = signSession(payload);
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
