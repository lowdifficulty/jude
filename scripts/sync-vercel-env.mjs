#!/usr/bin/env node
/**
 * Copy shared Jude env vars to both Vercel projects.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const demoEnv = path.join(root, "apps/demo/.env.local");
const secretFile = path.join(root, ".env.storage");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

function addEnv(cwd, name, value, env) {
  execSync(`vercel env add ${name} ${env} --force --yes`, {
    cwd,
    input: `${value}\n`,
    stdio: ["pipe", "inherit", "inherit"],
    shell: true,
  });
}

const demoValues = parseEnvFile(demoEnv);
const secretValues = parseEnvFile(secretFile);
const blobToken = demoValues.BLOB_READ_WRITE_TOKEN;
const sessionSecret = secretValues.JUDE_SESSION_SECRET;

if (!blobToken) {
  console.error("Missing BLOB_READ_WRITE_TOKEN in apps/demo/.env.local");
  process.exit(1);
}

if (!sessionSecret) {
  console.error("Missing JUDE_SESSION_SECRET in .env.storage");
  process.exit(1);
}

const demoDir = path.join(root, "apps/demo");
const marketingDir = path.join(root, "apps/marketing");

for (const env of ["production", "preview"]) {
  addEnv(demoDir, "JUDE_SESSION_SECRET", sessionSecret, env);
}

for (const env of ["production", "preview"]) {
  addEnv(marketingDir, "JUDE_SESSION_SECRET", sessionSecret, env);
  addEnv(marketingDir, "BLOB_READ_WRITE_TOKEN", blobToken, env);
}

console.log("\nShared storage env vars configured on jude-demo and jude-marketing.\n");
