import { decryptSecret, encryptSecret } from "./crypto";
import { readStoreJson, writeStoreJson } from "./storage";
import type { GmailTokenRecord, UserIntegrationsFile } from "./types";

function integrationsStorePath(userId: string) {
  return `integrations/${userId}.json`;
}

async function readIntegrationsFile(userId: string): Promise<UserIntegrationsFile> {
  return readStoreJson<UserIntegrationsFile>(integrationsStorePath(userId), {});
}

async function writeIntegrationsFile(userId: string, data: UserIntegrationsFile) {
  await writeStoreJson(integrationsStorePath(userId), data);
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

export async function saveGmailTokens(userId: string, record: GmailTokenRecord) {
  const file = await readIntegrationsFile(userId);
  file.gmail = serializeGmail(record);
  await writeIntegrationsFile(userId, file);
}

export async function getGmailTokens(userId: string): Promise<GmailTokenRecord | null> {
  const file = await readIntegrationsFile(userId);
  if (!file.gmail) return null;
  return deserializeGmail(file.gmail);
}

export async function clearGmailTokens(userId: string) {
  const file = await readIntegrationsFile(userId);
  delete file.gmail;
  await writeIntegrationsFile(userId, file);
}

export async function hasGmailTokens(userId: string) {
  const file = await readIntegrationsFile(userId);
  return Boolean(file.gmail);
}
