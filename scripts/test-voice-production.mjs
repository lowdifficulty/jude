/**
 * End-to-end smoke test for voice connect on production.
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

console.log(`Testing voice connect at ${baseUrl}\n`);

const cookie = await register();
console.log(`Registered ${username}`);

const result = await connectVoice(cookie);
console.log(`voice/connect: ${result.status} (${result.contentType})`);

if (result.status === 200 && result.contentType.includes("application/sdp")) {
  console.log("Voice connect returned SDP answer — model parameter fix verified.");
  process.exit(0);
}

const modelError = /model parameter|gpt-realtime/i.test(result.body);
if (modelError) {
  console.error("Still failing with model parameter error:");
}

console.error(result.body.slice(0, 500));
process.exit(1);
