"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  USER_COOKIE,
  buildUserCookieValue,
  createUser,
  verifyUserCredentials,
} from "@jude/store";
import { getOrCreateProfile } from "@jude/store/profiles";

export type AuthActionState = {
  error?: string;
};

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
  const next = String(raw || "/my-jude");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/my-jude";
}

export async function registerAction(
  _prev: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState | null> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const displayName = String(formData.get("displayName") || "").trim();
  const next = safeNextPath(formData.get("next"));

  try {
    const user = await createUser({ username, password, displayName });
    await getOrCreateProfile(user);
    const cookieStore = await cookies();
    cookieStore.set(USER_COOKIE, buildUserCookieValue(user.id), cookieOptions(60 * 60 * 24 * 30));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Registration failed.",
    };
  }

  redirect(next);
}

export async function loginAction(
  _prev: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState | null> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const next = safeNextPath(formData.get("next"));

  const user = await verifyUserCredentials(username, password);
  if (!user) {
    return { error: "Invalid username or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, buildUserCookieValue(user.id), cookieOptions(60 * 60 * 24 * 30));
  redirect(next);
}
