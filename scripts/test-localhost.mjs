/**
 * Full localhost smoke test for Jude demo + marketing.
 * Usage: node scripts/test-localhost.mjs
 */

const DEMO = "http://localhost:3002";
const MARKETING = "http://localhost:3001";

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchOk(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: "manual" });
  return response;
}

function parseCookies(response) {
  const raw = response.headers.getSetCookie?.() || [];
  return raw.map((c) => c.split(";")[0]).join("; ");
}

async function testPort(name, baseUrl) {
  try {
    const home = await fetchOk(baseUrl);
    if (home.status >= 200 && home.status < 400) {
      pass(`${name} home`, `${baseUrl} → ${home.status}`);
    } else {
      fail(`${name} home`, `${baseUrl} → ${home.status}`);
      return null;
    }

    const login = await fetchOk(`${baseUrl}/login`);
    if (login.status === 200) pass(`${name} login page`, `${login.status}`);
    else fail(`${name} login page`, `${login.status}`);

    const register = await fetchOk(`${baseUrl}/register`);
    if (register.status === 200) pass(`${name} register page`, `${register.status}`);
    else fail(`${name} register page`, `${register.status}`);

    return baseUrl;
  } catch (error) {
    fail(`${name} unreachable`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function testAuthFlow(name, baseUrl) {
  const username = `local-${Date.now()}`;
  const password = "TestLocal123!";
  let cookie = "";

  try {
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, displayName: "Local Test" }),
    });
    cookie = parseCookies(reg);
    const regBody = await reg.json().catch(() => ({}));
    if (!reg.ok) {
      fail(`${name} register API`, regBody.error || reg.status);
      return;
    }
    pass(`${name} register API`, username);

    const sess = await fetch(`${baseUrl}/api/auth/session`, {
      headers: cookie ? { Cookie: cookie } : {},
    });
    const sessBody = await sess.json();
    if (sess.ok && sessBody.authenticated) {
      pass(`${name} session after register`, sessBody.user?.username);
    } else {
      fail(`${name} session after register`, JSON.stringify(sessBody));
    }

    const logoutCookie = cookie;
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: logoutCookie },
      body: JSON.stringify({ username, password }),
    });
    cookie = parseCookies(login) || cookie;
    if (!login.ok) {
      const err = await login.json().catch(() => ({}));
      fail(`${name} login API`, err.error || login.status);
      return;
    }
    pass(`${name} login API`);

    const sess2 = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Cookie: cookie },
    });
    const sess2Body = await sess2.json();
    if (sess2.ok && sess2Body.authenticated) pass(`${name} session after login`);
    else fail(`${name} session after login`, JSON.stringify(sess2Body));

    if (baseUrl === DEMO) {
      const dev = await fetch(`${baseUrl}/api/dev/status`);
      const devBody = await dev.json();
      if (dev.ok) pass(`${name} dev status`, `storage=${devBody.storage?.mode}`);
      else fail(`${name} dev status`, dev.status);
    }
  } catch (error) {
    fail(`${name} auth flow`, error instanceof Error ? error.message : String(error));
  }
}

console.log("Jude localhost smoke test\n");

const demoUp = await testPort("demo", DEMO);
const marketingUp = await testPort("marketing", MARKETING);

if (demoUp) await testAuthFlow("demo", demoUp);
if (marketingUp) await testAuthFlow("marketing", marketingUp);

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);

if (failed.length) {
  console.error("\nFailed checks:");
  for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`);
  console.error("\nIf servers are down, run: npm run 67  and  npm run dev:marketing");
  process.exit(1);
}

console.log("\nLocalhost is working. Use http://localhost:3002/register for the orb demo.");
process.exit(0);
