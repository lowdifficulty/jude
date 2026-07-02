/**
 * End-to-end smoke test for voice APIs on production.
 * Usage: node scripts/test-voice-production.mjs [baseUrl]
 */

const baseUrl = (process.argv[2] || "https://jude.one").replace(/\/$/, "");
const username = `voice-test-${Date.now()}`;
const password = `Test-${Math.random().toString(36).slice(2, 10)}!`;

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

function parseCookies(response) {
  const raw = response.headers.getSetCookie?.() || [];
  return raw.map((entry) => entry.split(";")[0]).join("; ");
}

async function register() {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      displayName: "Voice Test",
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Register failed (${response.status}): ${body.error || "unknown"}`);
  }
  return parseCookies(response);
}

async function connectVoice(cookie) {
  const response = await fetch(`${baseUrl}/api/voice/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/sdp",
      "X-Jude-Mode": "good",
      Cookie: cookie,
    },
    body: minimalSdp,
  });
  const body = await response.text();
  return { status: response.status, body, contentType: response.headers.get("content-type") || "" };
}

async function speakVoice(cookie) {
  const response = await fetch(`${baseUrl}/api/voice/speak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Jude-Mode": "good",
      Cookie: cookie,
    },
    body: JSON.stringify({ text: "Hello from Jude voice test.", mode: "good" }),
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("audio") ? `[audio ${response.headers.get("content-length") || "?"} bytes]` : await response.text();
  return { status: response.status, body, contentType };
}

console.log(`Testing voice at ${baseUrl}\n`);

const cookie = await register();
console.log(`Registered ${username}`);

const connectResult = await connectVoice(cookie);
console.log(`voice/connect: ${connectResult.status} (${connectResult.contentType})`);

const speakResult = await speakVoice(cookie);
console.log(`voice/speak: ${speakResult.status} (${speakResult.contentType})`);

let connectOk = false;
if (connectResult.status === 200 && connectResult.contentType.includes("application/sdp")) {
  connectOk = true;
  console.log("voice/connect: SDP answer received.");
} else if (/Failed to parse offer|unmarshal SDP/i.test(connectResult.body)) {
  connectOk = true;
  console.log("voice/connect: reached OpenAI (test SDP rejected as expected).");
} else if (/model parameter|must provide a model/i.test(connectResult.body)) {
  console.error("voice/connect: model parameter error:");
  console.error(connectResult.body.slice(0, 500));
  process.exit(1);
} else if (/Sign in required|OPENAI_API_KEY/i.test(connectResult.body)) {
  console.error("voice/connect:", connectResult.body.slice(0, 500));
  process.exit(1);
} else {
  console.error("voice/connect failed:", connectResult.body.slice(0, 500));
  process.exit(1);
}

const speakOk =
  speakResult.status === 200 && speakResult.contentType.includes("audio/mpeg");

if (speakOk) {
  console.log(`voice/speak: audio OK ${speakResult.body}`);
} else {
  console.error("voice/speak failed:", speakResult.body.slice(0, 500));
  process.exit(1);
}

if (connectOk && speakOk) {
  console.log("\nVoice connect + speak tests passed.");
  process.exit(0);
}

process.exit(1);
