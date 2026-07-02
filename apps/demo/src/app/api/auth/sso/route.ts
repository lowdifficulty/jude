import { NextResponse } from "next/server";
import {
  USER_COOKIE,
  buildUserCookieValue,
  createSsoToken,
  findUserById,
  verifySsoToken,
} from "@jude/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const next = url.searchParams.get("next") || "/";

  if (!token) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const userId = verifySsoToken(token);
  if (!userId || !(await findUserById(userId))) {
    return NextResponse.redirect(new URL("/login?error=sso", url.origin));
  }

  const redirectUrl = new URL(next, url.origin);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(USER_COOKIE, buildUserCookieValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const userId = String(body.userId || "");

  if (!userId || !(await findUserById(userId))) {
    return NextResponse.json({ error: "Invalid user." }, { status: 400 });
  }

  return NextResponse.json({ token: createSsoToken(userId) });
}
