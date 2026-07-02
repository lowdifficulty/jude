import { NextResponse } from "next/server";
import {
  completeGmailOAuth,
  findUserById,
  getGoogleRedirectUri,
  parseOAuthState,
} from "@jude/store";
import { setGmailIntegration } from "@jude/store/profiles";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL(`/?marketplace=1&gmail=error`, url.origin));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?marketplace=1&gmail=error", url.origin));
  }

  const userId = parseOAuthState(state, "gmail");
  if (!userId || !(await findUserById(userId))) {
    return NextResponse.redirect(new URL("/login?next=/&gmail=error", url.origin));
  }

  try {
    const redirectUri = getGoogleRedirectUri(url.origin);
    const email = await completeGmailOAuth(userId, code, redirectUri);
    const user = (await findUserById(userId))!;
    await setGmailIntegration(user, email);
    return NextResponse.redirect(new URL("/?marketplace=1&gmail=connected", url.origin));
  } catch {
    return NextResponse.redirect(new URL("/?marketplace=1&gmail=error", url.origin));
  }
}
