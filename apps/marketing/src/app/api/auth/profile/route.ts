import { NextResponse } from "next/server";
import type { OnboardingGroup } from "@jude/store";
import { getAuthenticatedUser } from "@jude/store";
import {
  addPersonalTraining,
  getOrCreateProfile,
  saveUserProfile,
  sanitizeProfileForClient,
  updateOnboarding,
} from "@jude/store/profiles";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ profile: sanitizeProfileForClient(getOrCreateProfile(user)) });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");

  if (action === "onboarding") {
    const onboardingGroups = (body.onboardingGroups || []) as OnboardingGroup[];
    const connectedDeviceIds = (body.connectedDeviceIds || []) as string[];
    const profile = updateOnboarding(user, { onboardingGroups, connectedDeviceIds });
    return NextResponse.json({ ok: true, profile: sanitizeProfileForClient(profile) });
  }

  if (action === "training") {
    const title = String(body.title || "").trim();
    const category = String(body.category || "personal").trim();
    const text = String(body.text || "").trim();
    if (!title || !text) {
      return NextResponse.json({ error: "Title and text are required." }, { status: 400 });
    }
    addPersonalTraining(user, { title, category, text });
    return NextResponse.json({
      ok: true,
      profile: sanitizeProfileForClient(getOrCreateProfile(user)),
    });
  }

  if (action === "notes") {
    const profile = getOrCreateProfile(user);
    profile.preferences.notes = String(body.notes || "");
    profile.updatedAt = new Date().toISOString();
    saveUserProfile(profile);
    return NextResponse.json({ ok: true, profile: sanitizeProfileForClient(profile) });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
