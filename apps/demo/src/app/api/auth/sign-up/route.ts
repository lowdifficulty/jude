import { NextResponse } from "next/server";
import { ADMIN_COOKIE, USER_COOKIE, buildUserCookieValue, createUser } from "@jude/store";
import { getOrCreateProfile } from "@jude/store/profiles";

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
  const displayName = String(formData.get("displayName") || "").trim();
  const next = safeNextPath(formData.get("next"));
  const url = new URL(request.url);

  try {
    const user = await createUser({ username, password, displayName });
    await getOrCreateProfile(user);

    const response = NextResponse.redirect(new URL(next, url), 303);
    response.cookies.set(USER_COOKIE, buildUserCookieValue(user.id), cookieOptions(60 * 60 * 24 * 30));
    response.cookies.set(ADMIN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
    return response;
  } catch (error) {
    const registerUrl = new URL("/register", url);
    registerUrl.searchParams.set(
      "error",
      error instanceof Error ? error.message : "Registration failed."
    );
    registerUrl.searchParams.set("next", next);
    return NextResponse.redirect(registerUrl, 303);
  }
}
