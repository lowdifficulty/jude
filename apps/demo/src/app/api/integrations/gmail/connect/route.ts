import { NextResponse } from "next/server";
import {
  buildGoogleAuthUrl,
  buildOAuthState,
  getAuthenticatedUser,
  getGoogleRedirectUri,
  isGoogleOAuthConfigured,
} from "@jude/store";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the server.",
      },
      { status: 503 }
    );
  }

  const origin = new URL(request.url).origin;
  const redirectUri = getGoogleRedirectUri(origin);
  const state = buildOAuthState(user.id, "gmail");
  const authUrl = buildGoogleAuthUrl(state, redirectUri);

  return NextResponse.redirect(authUrl);
}
