import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  USER_COOKIE,
  buildUserCookieValue,
  getAdminSessionToken,
  verifyAdminCredentials,
  verifyUserCredentials,
} from "@jude/store";

export const runtime = "nodejs";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function safeNextPath(raw: FormDataEntryValue | null) {
  const next = String(raw || "/");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const next = safeNextPath(formData.get("next"));
  const url = new URL(request.url);

  if (verifyAdminCredentials(username, password)) {
    const response = NextResponse.redirect(new URL("/admin", url), 303);
    response.cookies.set(ADMIN_COOKIE, getAdminSessionToken(), cookieOptions(60 * 60 * 24 * 7));
    return response;
  }

  const user = await verifyUserCredentials(username, password);
  if (!user) {
    const loginUrl = new URL("/login", url);
    loginUrl.searchParams.set("error", "invalid");
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(next, url), 303);
  response.cookies.set(USER_COOKIE, buildUserCookieValue(user.id), cookieOptions(60 * 60 * 24 * 30));
  response.cookies.set(ADMIN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  return response;
}
