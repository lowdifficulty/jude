import { NextResponse } from "next/server";
import { USER_COOKIE, buildUserCookieValue, createUser } from "@jude/store";
import { getOrCreateProfile } from "@jude/store/profiles";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/register", request.url));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const displayName = String(body.displayName || "").trim();

  try {
    const user = createUser({ username, password, displayName });
    getOrCreateProfile(user);

    const response = NextResponse.json({
      ok: true,
      role: "user",
      user: { id: user.id, username: user.username, displayName: user.displayName },
      redirectUrl: "/",
    });
    response.cookies.set(USER_COOKIE, buildUserCookieValue(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
