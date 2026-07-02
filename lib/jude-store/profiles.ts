import fs from "fs";
import path from "path";
import { ensureDataDirs, PROFILES_DIR } from "./paths";
import type { AdminEntry, JudeMode, OnboardingGroup, UserProfile } from "./types";
import type { StoredUser } from "./types";
function profilePath(userId: string) {
  return path.join(PROFILES_DIR, `${userId}.json`);
}

export function getUserProfile(userId: string): UserProfile | null {
  ensureDataDirs();
  const file = profilePath(userId);
  if (!fs.existsSync(file)) return null;
  return migrateProfile(JSON.parse(fs.readFileSync(file, "utf8")) as UserProfile);
}

function migrateProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    connectedAppIds: profile.connectedAppIds ?? [],
    appSettings: profile.appSettings ?? {},
    integrations: profile.integrations ?? {},
  };
}
export function saveUserProfile(profile: UserProfile) {
  ensureDataDirs();
  fs.writeFileSync(profilePath(profile.userId), JSON.stringify(profile, null, 2));
}

export function getOrCreateProfile(user: StoredUser): UserProfile {
  const existing = getUserProfile(user.id);
  if (existing) return existing;

  const profile: UserProfile = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    onboardingGroups: [],
    connectedDeviceIds: [],
    connectedAppIds: [],
    appSettings: {},
    integrations: {},
    personalTraining: [],
    preferences: {},
    updatedAt: new Date().toISOString(),
  };  saveUserProfile(profile);
  return profile;
}

export function updateOnboarding(
  user: StoredUser,
  input: {
    onboardingGroups: OnboardingGroup[];
    connectedDeviceIds: string[];
  }
) {
  const profile = getOrCreateProfile(user);
  profile.onboardingGroups = input.onboardingGroups;
  profile.connectedDeviceIds = input.connectedDeviceIds;
  profile.updatedAt = new Date().toISOString();
  saveUserProfile(profile);
  return profile;
}

export function addPersonalTraining(
  user: StoredUser,
  input: { title: string; category: string; text: string }
) {
  const profile = getOrCreateProfile(user);
  const entry: AdminEntry = {
    id: `user-${user.id}-${Date.now()}`,
    title: input.title.trim(),
    category: input.category.trim() || "personal",
    text: input.text.trim(),
    createdAt: new Date().toISOString(),
  };
  profile.personalTraining.unshift(entry);
  profile.updatedAt = new Date().toISOString();
  saveUserProfile(profile);
  return entry;
}

export function profileToKnowledgeChunks(profile: UserProfile) {
  const chunks: Array<{ id: string; title: string; text: string }> = [];

  if (profile.onboardingGroups.length) {
    chunks.push({
      id: `${profile.userId}-onboarding`,
      title: `${profile.displayName}'s Jude preferences`,
      text: `This household wants Jude to connect: ${profile.onboardingGroups.join(", ")}. Recommended devices: ${profile.connectedDeviceIds.join(", ") || "not specified yet"}.`,
    });
  }

  if (profile.preferences.notes?.trim()) {
    chunks.push({
      id: `${profile.userId}-notes`,
      title: `${profile.displayName}'s notes for Jude`,
      text: profile.preferences.notes.trim(),
    });
  }

  for (const entry of profile.personalTraining) {
    chunks.push({
      id: entry.id,
      title: entry.title,
      text: `[${entry.category}] ${entry.text}`,
    });
  }

  return chunks;
}

export function updateConnectedApps(user: StoredUser, connectedAppIds: string[]) {
  const profile = getOrCreateProfile(user);
  profile.connectedAppIds = connectedAppIds;
  profile.updatedAt = new Date().toISOString();
  saveUserProfile(profile);
  return profile;
}

export function updateAppSettings(
  user: StoredUser,
  input: { weatherZip?: string; mode?: JudeMode; dockOrder?: string[] }
) {
  const profile = getOrCreateProfile(user);
  profile.appSettings = {
    ...profile.appSettings,
    ...input,
  };
  profile.updatedAt = new Date().toISOString();
  saveUserProfile(profile);
  return profile;
}

export function setGmailIntegration(user: StoredUser, email: string) {
  const profile = getOrCreateProfile(user);
  profile.integrations.gmail = {
    email,
    connectedAt: profile.integrations.gmail?.connectedAt || new Date().toISOString(),
  };
  if (!profile.connectedAppIds.includes("gmail")) {
    profile.connectedAppIds.push("gmail");
  }
  profile.updatedAt = new Date().toISOString();
  saveUserProfile(profile);
  return profile;
}

export function clearGmailIntegration(user: StoredUser) {
  const profile = getOrCreateProfile(user);
  delete profile.integrations.gmail;
  profile.connectedAppIds = profile.connectedAppIds.filter((id) => id !== "gmail");
  profile.updatedAt = new Date().toISOString();
  saveUserProfile(profile);
  return profile;
}

export function sanitizeProfileForClient(profile: UserProfile): UserProfile {
  return migrateProfile(profile);
}
