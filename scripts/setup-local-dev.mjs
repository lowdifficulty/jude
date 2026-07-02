#!/usr/bin/env node
/**
 * Configure local dev env from Vercel production secrets.
 * Usage: npm run setup:local
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const demoDir = path.join(root, "apps/demo");
const envLocal = path.join(demoDir, ".env.local");
const envBackup = path.join(demoDir, ".env.local.bak");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const value = match[2].replace(/^"|"$/g, "").trim();
    if (value) values[match[1]] = value;
  }
  return values;
}

function run(cmd, cwd = root) {
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

console.log("Setting up local Jude dev environment...\n");

try {
  run("vercel link --yes --project jude-demo", demoDir);
} catch {
  console.log("(vercel link skipped — already linked or not logged in)\n");
}

const preserved = parseEnvFile(envLocal);
if (fs.existsSync(envLocal)) {
  fs.copyFileSync(envLocal, envBackup);
  fs.unlinkSync(envLocal);
}

try {
  run("vercel env run -e production -- node ../../scripts/write-local-env.mjs", demoDir);
} catch (error) {
  if (fs.existsSync(envBackup)) fs.copyFileSync(envBackup, envLocal);
  console.error("\nCould not pull secrets from Vercel.");
  console.error("Log in with: vercel login");
  console.error("Or paste keys manually into apps/demo/.env.local\n");
  process.exit(1);
} finally {
  if (fs.existsSync(envBackup)) fs.unlinkSync(envBackup);
}

// Merge any keys the user already had that Vercel did not inject.
const demoWritten = parseEnvFile(envLocal);
let merged = false;
for (const [key, value] of Object.entries(preserved)) {
  if (!demoWritten[key] && ["OPENAI_API_KEY", "ELEVENLABS_API_KEY"].includes(key)) {
    demoWritten[key] = value;
    merged = true;
  }
}
if (merged) {
  const lines = fs.readFileSync(envLocal, "utf8").split(/\r?\n/);
  const out = lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)=/);
    if (match && demoWritten[match[1]] && !line.endsWith(demoWritten[match[1]])) {
      return `${match[1]}=${demoWritten[match[1]]}`;
    }
    return line;
  });
  fs.writeFileSync(envLocal, out.join("\n"));
  console.log("Merged previously saved API keys from your old .env.local.");
}

console.log("\nRestart dev if it is already running (Ctrl+C, then npm run 67).\n");
