import { NextResponse } from "next/server";
import { getAuthenticatedUser, isAdminAuthenticated } from "@jude/store";
import { getOrCreateProfile, sanitizeProfileForClient } from "@jude/store/profiles";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (user) {
    return NextResponse.json({
      authenticated: true,
      role: "user",
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
      profile: sanitizeProfileForClient(await getOrCreateProfile(user)),
    });
  }

  if (await isAdminAuthenticated()) {
    return NextResponse.json({ authenticated: true, role: "admin" });
  }

  return NextResponse.json({ authenticated: false });
}
