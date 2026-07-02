import fs from "fs";
import path from "path";
import { decryptSecret, encryptSecret } from "./crypto";
import { ensureDataDirs, INTEGRATIONS_DIR } from "./paths";
import type { GmailTokenRecord, UserIntegrationsFile } from "./types";

function integrationsPath(userId: string) {
  return path.join(INTEGRATIONS_DIR, `${userId}.json`);
}

function readIntegrationsFile(userId: string): UserIntegrationsFile {
  ensureDataDirs();
  const file = integrationsPath(userId);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8")) as UserIntegrationsFile;
}

function writeIntegrationsFile(userId: string, data: UserIntegrationsFile) {
  ensureDataDirs();
  fs.writeFileSync(integrationsPath(userId), JSON.stringify(data, null, 2));
}

type StoredGmailTokenRecord = Omit<GmailTokenRecord, "accessToken" | "refreshToken"> & {
  accessToken: string;
  refreshToken: string;
};

function serializeGmail(record: GmailTokenRecord): StoredGmailTokenRecord {
  return {
    ...record,
    accessToken: encryptSecret(record.accessToken),
    refreshToken: encryptSecret(record.refreshToken),
  };
}

function deserializeGmail(record: StoredGmailTokenRecord): GmailTokenRecord {
  return {
    ...record,
    accessToken: decryptSecret(record.accessToken),
    refreshToken: decryptSecret(record.refreshToken),
  };
}

export function saveGmailTokens(userId: string, record: GmailTokenRecord) {
  const file = readIntegrationsFile(userId);
  file.gmail = serializeGmail(record);
  writeIntegrationsFile(userId, file);
}

export function getGmailTokens(userId: string): GmailTokenRecord | null {
  const file = readIntegrationsFile(userId);
  if (!file.gmail) return null;
  return deserializeGmail(file.gmail);
}

export function clearGmailTokens(userId: string) {
  const file = readIntegrationsFile(userId);
  delete file.gmail;
  writeIntegrationsFile(userId, file);
}

export function hasGmailTokens(userId: string) {
  return Boolean(readIntegrationsFile(userId).gmail);
}
