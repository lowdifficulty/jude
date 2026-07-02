import { signSession, verifySession } from "./crypto";

const SSO_MAX_AGE_MS = 60_000;

export function createSsoToken(userId: string) {
  const payload = JSON.stringify({ userId, ts: Date.now(), kind: "sso" });
  const sig = signSession(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySsoToken(token: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot <= 0) return null;
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    if (!verifySession(payload, sig)) return null;
    const data = JSON.parse(payload) as { userId?: string; ts?: number; kind?: string };
    if (data.kind !== "sso" || !data.userId || !data.ts) return null;
    if (Date.now() - data.ts > SSO_MAX_AGE_MS) return null;
    return data.userId;
  } catch {
    return null;
  }
}
