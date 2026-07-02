import { NextResponse } from "next/server";
import { createSsoToken, getAuthenticatedUser } from "@jude/store";
import { getOrCreateProfile, sanitizeProfileForClient } from "@jude/store/profiles";
import { JUDE_DEMO_URL } from "@/lib/jude-urls";
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }
  const profile = sanitizeProfileForClient(getOrCreateProfile(user));
  const ssoToken = createSsoToken(user.id);
  const demoSsoUrl = `${JUDE_DEMO_URL}/api/auth/sso?token=${encodeURIComponent(ssoToken)}`;
  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
    profile,
    demoSsoUrl,
  });
}
