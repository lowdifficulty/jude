/**
 * Smoke-test OpenAI Realtime session config against live API.
 * Usage: node scripts/test-realtime-session.mjs
 * Requires OPENAI_API_KEY in env (or apps/demo/.env.local via dotenv-style load).
 */

import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const envLocal = path.join(root, "apps/demo/.env.local");
const envTest = path.join(root, "apps/demo/.env.test");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

loadEnvFile(envLocal);
loadEnvFile(envTest);

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-1.5";

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY. Set it in apps/demo/.env.local or the environment.");
  process.exit(1);
}

const sessionConfig = {
  type: "realtime",
  model,
  output_modalities: ["text"],
  instructions: "You are Jude, a helpful home assistant. Reply briefly.",
  tool_choice: "auto",
  tools: [],
  audio: {
    input: {
      transcription: { model: "whisper-1" },
      turn_detection: { type: "server_vad" },
    },
  },
};

const sessionJson = JSON.stringify(sessionConfig);

const minimalSdp = [
  "v=0",
  "o=- 0 0 IN IP4 127.0.0.1",
  "s=-",
  "t=0 0",
  "a=group:BUNDLE 0",
  "a=extmap-allow-mixed",
  "m=audio 9 UDP/TLS/RTP/SAVPF 111",
  "c=IN IP4 0.0.0.0",
  "a=rtcp:9 IN IP4 0.0.0.0",
  "a=ice-ufrag:testufrag",
  "a=ice-pwd:testpasswordtestpassword",
  "a=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00",
  "a=setup:actpass",
  "a=mid:0",
  "a=sendrecv",
  "a=rtpmap:111 opus/48000/2",
].join("\r\n");

async function testClientSecrets() {
  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session: sessionConfig }),
  });
  const body = await response.text();
  console.log(`client_secrets: ${response.status}`);
  if (!response.ok) {
    console.error(body.slice(0, 500));
    return false;
  }
  console.log("client_secrets: ok");
  return true;
}

async function testCallsWithStringSession() {
  const form = new FormData();
  form.set("sdp", minimalSdp);
  form.set("session", sessionJson);

  const response = await fetch(
    `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(model)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    }
  );
  const body = await response.text();
  console.log(`realtime/calls (string session): ${response.status}`);
  if (response.ok) {
    console.log("realtime/calls: ok (received SDP answer)");
    return true;
  }
  console.error(body.slice(0, 500));
  return false;
}

async function testCallsWithBlobSession() {
  const form = new FormData();
  form.set("sdp", minimalSdp);
  form.set("session", new Blob([sessionJson], { type: "application/json" }));

  const response = await fetch(
    `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(model)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    }
  );
  const body = await response.text();
  console.log(`realtime/calls (blob session): ${response.status}`);
  if (response.ok) {
    console.log("realtime/calls blob: ok");
    return true;
  }
  console.error(body.slice(0, 500));
  return false;
}

console.log(`Testing model: ${model}\n`);

const secretsOk = await testClientSecrets();
const stringOk = await testCallsWithStringSession();
if (!stringOk) {
  await testCallsWithBlobSession();
}

if (secretsOk && stringOk) {
  console.log("\nAll Realtime session tests passed.");
  process.exit(0);
}

console.error("\nRealtime session tests failed.");
process.exit(1);
