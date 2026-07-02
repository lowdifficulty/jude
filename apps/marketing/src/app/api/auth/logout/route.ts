import { NextResponse } from "next/server";
import { USER_COOKIE } from "@jude/store";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(USER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
