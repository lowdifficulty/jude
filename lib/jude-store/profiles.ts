import { readStoreJson, writeStoreJson } from "./storage";
import type { AdminEntry, JudeMode, OnboardingGroup, UserProfile } from "./types";
import type { StoredUser } from "./types";

function profileStorePath(userId: string) {
  return `profiles/${userId}.json`;
}

function migrateProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    connectedAppIds: profile.connectedAppIds ?? [],
    appSettings: profile.appSettings ?? {},
    integrations: profile.integrations ?? {},
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const profile = await readStoreJson<UserProfile | null>(profileStorePath(userId), null);
  return profile ? migrateProfile(profile) : null;
}

export async function saveUserProfile(profile: UserProfile) {
  await writeStoreJson(profileStorePath(profile.userId), profile);
}

export async function getOrCreateProfile(user: StoredUser): Promise<UserProfile> {
  const existing = await getUserProfile(user.id);
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
  };
  await saveUserProfile(profile);
  return profile;
}

export async function updateOnboarding(
  user: StoredUser,
  input: {
    onboardingGroups: OnboardingGroup[];
    connectedDeviceIds: string[];
  }
) {
  const profile = await getOrCreateProfile(user);
  profile.onboardingGroups = input.onboardingGroups;
  profile.connectedDeviceIds = input.connectedDeviceIds;
  profile.updatedAt = new Date().toISOString();
  await saveUserProfile(profile);
  return profile;
}

export async function addPersonalTraining(
  user: StoredUser,
  input: { title: string; category: string; text: string }
) {
  const profile = await getOrCreateProfile(user);
  const entry: AdminEntry = {
    id: `user-${user.id}-${Date.now()}`,
    title: input.title.trim(),
    category: input.category.trim() || "personal",
    text: input.text.trim(),
    createdAt: new Date().toISOString(),
  };
  profile.personalTraining.unshift(entry);
  profile.updatedAt = new Date().toISOString();
  await saveUserProfile(profile);
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

export async function updateConnectedApps(user: StoredUser, connectedAppIds: string[]) {
  const profile = await getOrCreateProfile(user);
  profile.connectedAppIds = connectedAppIds;
  profile.updatedAt = new Date().toISOString();
  await saveUserProfile(profile);
  return profile;
}

export async function updateAppSettings(
  user: StoredUser,
  input: { weatherZip?: string; mode?: JudeMode; dockOrder?: string[] }
) {
  const profile = await getOrCreateProfile(user);
  profile.appSettings = {
    ...profile.appSettings,
    ...input,
  };
  profile.updatedAt = new Date().toISOString();
  await saveUserProfile(profile);
  return profile;
}

export async function setGmailIntegration(user: StoredUser, email: string) {
  const profile = await getOrCreateProfile(user);
  profile.integrations.gmail = {
    email,
    connectedAt: profile.integrations.gmail?.connectedAt || new Date().toISOString(),
  };
  if (!profile.connectedAppIds.includes("gmail")) {
    profile.connectedAppIds.push("gmail");
  }
  profile.updatedAt = new Date().toISOString();
  await saveUserProfile(profile);
  return profile;
}

export async function clearGmailIntegration(user: StoredUser) {
  const profile = await getOrCreateProfile(user);
  delete profile.integrations.gmail;
  profile.connectedAppIds = profile.connectedAppIds.filter((id) => id !== "gmail");
  profile.updatedAt = new Date().toISOString();
  await saveUserProfile(profile);
  return profile;
}

export function sanitizeProfileForClient(profile: UserProfile): UserProfile {
  return migrateProfile(profile);
}
