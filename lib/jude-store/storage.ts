import fs from "fs";
import path from "path";
import { list, put } from "@vercel/blob";
import { decryptSecret, encryptSecret } from "./crypto";
import { DATA_DIR, ensureDataDirs } from "./paths";

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || process.env.jude_READ_WRITE_TOKEN;
}

function useBlobStorage() {
  return Boolean(blobToken());
}

function localFilePath(relativePath: string) {
  return path.join(DATA_DIR, relativePath);
}

function blobPath(relativePath: string) {
  return `jude/${relativePath.replace(/\\/g, "/")}`;
}

export async function readStoreJson<T>(relativePath: string, fallback: T): Promise<T> {
  if (useBlobStorage()) {
    try {
      const pathname = blobPath(relativePath);
      const { blobs } = await list({
        prefix: pathname,
        token: blobToken()!,
      });
      const blob = blobs.find((item) => item.pathname === pathname);
      if (!blob) return fallback;
      const response = await fetch(blob.downloadUrl);
      if (!response.ok) return fallback;
      const encrypted = await response.text();
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
  if (useBlobStorage()) {
    await put(blobPath(relativePath), encryptSecret(JSON.stringify(data)), {
      access: "public",
      token: blobToken()!,
      addRandomSuffix: false,
      contentType: "application/octet-stream",
    });
    return;
  }

  ensureDataDirs();
  const file = localFilePath(relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
