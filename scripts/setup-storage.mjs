#!/usr/bin/env node
/**
 * Ensures Jude production projects share persistent storage + session secret.
 *
 * Usage:
 *   node scripts/setup-storage.mjs
 *
 * Requires: Vercel CLI logged in (`vercel login`)
 *
 * Steps performed when possible:
 * 1. Generate a shared JUDE_SESSION_SECRET (if not already in repo root .env.storage)
 * 2. Print instructions to create ONE Vercel KV store and connect it to BOTH projects
 * 3. Optionally push JUDE_SESSION_SECRET to both projects (set PUSH_SECRETS=1)
 */

import { execSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const secretFile = path.join(root, ".env.storage");

function run(cmd, cwd = root) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd, shell: true });
}

function readSecretFile() {
  if (!fs.existsSync(secretFile)) return {};
  const lines = fs.readFileSync(secretFile, "utf8").split(/\r?\n/);
  const values = {};
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

function writeSecretFile(values) {
  const body = Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  fs.writeFileSync(secretFile, `${body}\n`);
}

const existing = readSecretFile();
const sessionSecret =
  existing.JUDE_SESSION_SECRET || crypto.randomBytes(32).toString("hex");

writeSecretFile({
  ...existing,
  JUDE_SESSION_SECRET: sessionSecret,
});

console.log("\nJude storage setup\n");
console.log("Saved shared session secret to .env.storage");
console.log("\nRequired for production accounts to work:\n");
console.log("1. Open https://vercel.com/dashboard/stores");
console.log("2. Create a KV store (Upstash Redis)");
console.log("3. Connect that SAME store to BOTH projects:");
console.log("   - jude-demo (jude.one)");
console.log("   - jude-marketing (urjude.com)");
console.log("   Vercel will inject KV_REST_API_URL and KV_REST_API_TOKEN automatically.");
console.log("\n4. Add the same JUDE_SESSION_SECRET to BOTH projects:");
console.log(`   ${sessionSecret}`);
console.log("\nAlternative: use one shared Vercel Blob store with BLOB_READ_WRITE_TOKEN on both projects.\n");

if (process.env.PUSH_SECRETS === "1") {
  for (const project of ["jude-demo", "jude-marketing"]) {
    for (const env of ["production", "preview"]) {
      try {
        run(
          `echo ${sessionSecret}| vercel env add JUDE_SESSION_SECRET ${env} --project ${project} --force`,
          root
        );
      } catch (error) {
        console.error(`Could not push secret to ${project} (${env}):`, error.message);
      }
    }
  }
  console.log("\nPushed JUDE_SESSION_SECRET to both projects.\n");
}

console.log("After KV/Blob is connected, redeploy with: npm run 42\n");
