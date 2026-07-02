import { NextResponse } from "next/server";
import { getAuthenticatedUser, hasGmailTokens, revokeGmailAccess } from "@jude/store";
import { clearGmailIntegration, getOrCreateProfile, sanitizeProfileForClient } from "@jude/store/profiles";

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  await revokeGmailAccess(user.id);
  const profile = sanitizeProfileForClient(await clearGmailIntegration(user));

  return NextResponse.json({ ok: true, profile });
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const profile = sanitizeProfileForClient(await getOrCreateProfile(user));
  return NextResponse.json({
    connected: await hasGmailTokens(user.id),
    email: profile.integrations.gmail?.email || null,
  });
}
