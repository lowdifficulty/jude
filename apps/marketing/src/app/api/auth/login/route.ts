import { NextResponse } from "next/server";
import {
  USER_COOKIE,
  buildUserCookieValue,
  createSsoToken,
  verifyAdminCredentials,
  verifyUserCredentials,
} from "@jude/store";
import { JUDE_DEMO_URL } from "@/lib/jude-urls";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (verifyAdminCredentials(username, password)) {
    return NextResponse.json({
      role: "admin",
      redirectUrl: `${JUDE_DEMO_URL}/admin`,
      bridge: { username, password },
    });
  }

  const user = await verifyUserCredentials(username, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const ssoToken = createSsoToken(user.id);
  const demoSsoUrl = `${JUDE_DEMO_URL}/api/auth/sso?token=${encodeURIComponent(ssoToken)}`;

  const response = NextResponse.json({
    role: "user",
    redirectUrl: "/my-jude",
    demoSsoUrl,
    user: { id: user.id, username: user.username, displayName: user.displayName },
  });
  response.cookies.set(USER_COOKIE, buildUserCookieValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
