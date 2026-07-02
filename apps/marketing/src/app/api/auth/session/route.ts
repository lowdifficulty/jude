import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@jude/store";
import { getOrCreateProfile } from "@jude/store/profiles";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }
  const profile = getOrCreateProfile(user);
  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
    profile,
  });
}
