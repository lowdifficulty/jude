#!/usr/bin/env node
/**
 * Start demo dev with a clean .next cache (fixes stale dev 500 errors).
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const demoNext = path.join(import.meta.dirname, "../apps/demo/.next");

if (fs.existsSync(demoNext)) {
  fs.rmSync(demoNext, { recursive: true, force: true });
  console.log("Cleared apps/demo/.next\n");
}

console.log("Starting Jude demo → http://localhost:3002\n");

const child = spawn("npm", ["run", "dev", "--workspace=@jude/demo"], {
  stdio: "inherit",
  shell: true,
  cwd: path.join(import.meta.dirname, ".."),
});

child.on("exit", (code) => process.exit(code ?? 0));
