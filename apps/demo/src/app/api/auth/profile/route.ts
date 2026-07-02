import { NextResponse } from "next/server";
import type { JudeMode } from "@jude/store";
import { getAuthenticatedUser } from "@jude/store";
import {
  getOrCreateProfile,
  sanitizeProfileForClient,
  updateAppSettings,
  updateConnectedApps,
} from "@jude/store/profiles";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const profile = sanitizeProfileForClient(await getOrCreateProfile(user));
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

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");

  if (action === "connectedApps") {
    const connectedAppIds = Array.isArray(body.connectedAppIds)
      ? body.connectedAppIds.map(String)
      : [];
    const profile = await updateConnectedApps(user, connectedAppIds);
    return NextResponse.json({ ok: true, profile: sanitizeProfileForClient(profile) });
  }

  if (action === "appSettings") {
    const profile = await updateAppSettings(user, {
      weatherZip: body.weatherZip ? String(body.weatherZip) : undefined,
      mode: body.mode === "good" || body.mode === "evil" ? (body.mode as JudeMode) : undefined,
      dockOrder: Array.isArray(body.dockOrder) ? body.dockOrder.map(String) : undefined,
    });
    return NextResponse.json({ ok: true, profile: sanitizeProfileForClient(profile) });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
