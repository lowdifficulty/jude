import { signSession, verifySession } from "./crypto";
import { clearGmailTokens, getGmailTokens, saveGmailTokens } from "./integrations";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "openid",
  "email",
  "profile",
];

export function isGoogleOAuthConfigured() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

export function getGoogleRedirectUri(origin: string) {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/integrations/gmail/callback`;
}

export function buildOAuthState(userId: string, provider: string) {
  const payload = JSON.stringify({ userId, provider, ts: Date.now() });
  const sig = signSession(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function parseOAuthState(raw: string, provider: string, maxAgeMs = 10 * 60 * 1000) {
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot <= 0) return null;
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    if (!verifySession(payload, sig)) return null;
    const data = JSON.parse(payload) as { userId?: string; provider?: string; ts?: number };
    if (data.provider !== provider || !data.userId || !data.ts) return null;
    if (Date.now() - data.ts > maxAgeMs) return null;
    return data.userId;
  } catch {
    return null;
  }
}

export function buildGoogleAuthUrl(state: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token exchange failed: ${text.slice(0, 200)}`);
  }

  return (await response.json()) as GoogleTokenResponse;
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token refresh failed: ${text.slice(0, 200)}`);
  }

  return (await response.json()) as GoogleTokenResponse;
}

async function fetchGoogleEmail(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error("Could not fetch Google account email.");
  }
  const data = (await response.json()) as { email?: string };
  if (!data.email) throw new Error("Google account did not return an email.");
  return data.email;
}

export async function completeGmailOAuth(userId: string, code: string, redirectUri: string) {
  const tokens = await exchangeCodeForTokens(code, redirectUri);
  const email = await fetchGoogleEmail(tokens.access_token);
  const existing = getGmailTokens(userId);

  saveGmailTokens(userId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || existing?.refreshToken || "",
    expiresAt: Date.now() + tokens.expires_in * 1000 - 60_000,
    email,
    connectedAt: existing?.connectedAt || new Date().toISOString(),
  });

  return email;
}

export async function getValidGmailAccessToken(userId: string) {
  const record = getGmailTokens(userId);
  if (!record) return null;

  if (Date.now() < record.expiresAt) {
    return record.accessToken;
  }

  if (!record.refreshToken) return null;

  const refreshed = await refreshAccessToken(record.refreshToken);
  saveGmailTokens(userId, {
    ...record,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token || record.refreshToken,
    expiresAt: Date.now() + refreshed.expires_in * 1000 - 60_000,
  });

  return refreshed.access_token;
}

type GmailHeader = { name: string; value: string };

type GmailMessageList = {
  messages?: Array<{ id: string }>;
};

type GmailMessage = {
  snippet?: string;
  payload?: { headers?: GmailHeader[] };
};

function headerValue(headers: GmailHeader[] | undefined, name: string) {
  return headers?.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value || "";
}

export async function fetchGmailSummary(userId: string, maxMessages = 5) {
  const accessToken = await getValidGmailAccessToken(userId);
  if (!accessToken) {
    throw new Error("Gmail is not connected for this account.");
  }

  const listResponse = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=" +
      maxMessages +
      "&q=is:unread%20in:inbox",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!listResponse.ok) {
    const text = await listResponse.text();
    throw new Error(`Gmail list failed: ${text.slice(0, 200)}`);
  }

  const list = (await listResponse.json()) as GmailMessageList;
  const messages = list.messages || [];

  const summaries = await Promise.all(
    messages.map(async (item) => {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!response.ok) return null;
      const message = (await response.json()) as GmailMessage;
      const headers = message.payload?.headers;
      return {
        from: headerValue(headers, "From"),
        subject: headerValue(headers, "Subject"),
        date: headerValue(headers, "Date"),
        snippet: message.snippet || "",
      };
    })
  );

  const record = getGmailTokens(userId);
  return {
    email: record?.email || "",
    unreadCount: messages.length,
    messages: summaries.filter(Boolean),
  };
}

export async function revokeGmailAccess(userId: string) {
  const record = getGmailTokens(userId);
  if (record?.accessToken) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(record.accessToken)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).catch(() => {});
  }
  clearGmailTokens(userId);
}
