import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";

const SESSION_SECRET =
  process.env.JUDE_SESSION_SECRET || "jude-dev-session-secret-change-in-prod";

function getEncryptionKey() {
  const raw =
    process.env.JUDE_TOKEN_ENCRYPTION_KEY ||
    process.env.JUDE_SESSION_SECRET ||
    "jude-dev-token-encryption-key-change-in-prod";
  return createHash("sha256").update(raw).digest();
}

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

export function encryptSecret(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(stored: string) {
  const [ivHex, tagHex, dataHex] = stored.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Invalid encrypted secret format.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
