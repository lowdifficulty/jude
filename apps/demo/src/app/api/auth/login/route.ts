import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  USER_COOKIE,
  buildUserCookieValue,
  getAdminSessionToken,
  verifyAdminCredentials,
  verifyUserCredentials,
} from "@jude/store";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (verifyAdminCredentials(username, password)) {
    const response = NextResponse.json({ role: "admin" });
    response.cookies.set(ADMIN_COOKIE, getAdminSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  const user = await verifyUserCredentials(username, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const response = NextResponse.json({
    role: "user",
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
