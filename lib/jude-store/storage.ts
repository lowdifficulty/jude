import fs from "fs";
import path from "path";
import { del, get, put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { decryptSecret, encryptSecret } from "./crypto";
import { DATA_DIR, ensureDataDirs } from "./paths";

const BLOB_ACCESS = "private" as const;

function isServerlessRuntime() {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return true;
  if (!process.env.VERCEL) return false;
  return process.env.NODE_ENV === "production";
}

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || process.env.jude_READ_WRITE_TOKEN;
}

function isLocalDev() {
  return process.env.NODE_ENV !== "production";
}

function useKvStorage() {
  if (isLocalDev()) return false;
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function useBlobStorage() {
  if (isLocalDev()) return false;
  return Boolean(
    blobToken() ||
      process.env.BLOB_STORE_ID ||
      (isServerlessRuntime() && process.env.VERCEL_OIDC_TOKEN)
  );
}

function blobCommandOptions() {
  const token = blobToken();
  return token ? { token } : {};
}

function blobPutOptions() {
  return {
    access: BLOB_ACCESS,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/octet-stream",
    ...blobCommandOptions(),
  };
}

function blobGetOptions() {
  return {
    access: BLOB_ACCESS,
    ...blobCommandOptions(),
  };
}

export function hasPersistentStorage() {
  return useKvStorage() || useBlobStorage() || !isServerlessRuntime();
}

export function assertPersistentStorage() {
  if (isServerlessRuntime() && !useKvStorage() && !useBlobStorage()) {
    throw new Error(
      "Account storage is not configured on the server. Add Vercel KV or Blob storage to this project."
    );
  }
}

function localFilePath(relativePath: string) {
  return path.join(DATA_DIR, relativePath);
}

function blobPath(relativePath: string) {
  return `jude/${relativePath.replace(/\\/g, "/")}`;
}

function kvKey(relativePath: string) {
  return `jude:${relativePath.replace(/\\/g, "/")}`;
}

async function readBlobText(relativePath: string) {
  const result = await get(blobPath(relativePath), blobGetOptions());
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return new Response(result.stream).text();
}

export async function readStoreJson<T>(relativePath: string, fallback: T): Promise<T> {
  if (useKvStorage()) {
    try {
      const raw = await kv.get<string>(kvKey(relativePath));
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  if (useBlobStorage()) {
    try {
      const encrypted = await readBlobText(relativePath);
      if (!encrypted) return fallback;
      return JSON.parse(decryptSecret(encrypted)) as T;
    } catch {
      return fallback;
    }
  }

  ensureDataDirs();
  const file = localFilePath(relativePath);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export async function writeStoreJson<T>(relativePath: string, data: T): Promise<void> {
  assertPersistentStorage();

  if (useKvStorage()) {
    await kv.set(kvKey(relativePath), JSON.stringify(data));
    return;
  }

  if (useBlobStorage()) {
    await put(blobPath(relativePath), encryptSecret(JSON.stringify(data)), blobPutOptions());
    return;
  }

  ensureDataDirs();
  const file = localFilePath(relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export async function deleteStoreJson(relativePath: string): Promise<void> {
  if (useKvStorage()) {
    await kv.del(kvKey(relativePath));
    return;
  }

  if (useBlobStorage()) {
    await del(blobPath(relativePath), blobGetOptions());
    return;
  }

  const file = localFilePath(relativePath);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
