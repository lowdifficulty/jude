import { NextResponse } from "next/server";
import { ADMIN_COOKIE, USER_COOKIE } from "@jude/store";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
