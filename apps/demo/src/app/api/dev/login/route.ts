import { NextResponse } from "next/server";
import { ADMIN_COOKIE, USER_COOKIE, buildUserCookieValue } from "@jude/store";
import { findUserByUsername } from "@jude/store/users";

export const runtime = "nodejs";

const DEV_USERNAME = "33";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const user = await findUserByUsername(DEV_USERNAME);
  if (!user) {
    return NextResponse.redirect(new URL("/register?error=Dev+user+missing.+Run+npm+run+seed%3Adev-user", request.url));
  }

  const next = new URL(request.url).searchParams.get("next") || "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const response = NextResponse.redirect(new URL(safeNext, request.url), 303);
  response.cookies.set(USER_COOKIE, buildUserCookieValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });
  return response;
}
