import { NextResponse } from "next/server";
import { getAuthenticatedUser, isAdminAuthenticated } from "@jude/store";
import { getOrCreateProfile } from "@jude/store/profiles";

export async function GET() {
  if (await isAdminAuthenticated()) {
    return NextResponse.json({ authenticated: true, role: "admin" });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    role: "user",
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
    profile: getOrCreateProfile(user),
  });
}
