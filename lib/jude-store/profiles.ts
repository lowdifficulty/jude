import fs from "fs";
import path from "path";
import { ensureDataDirs, PROFILES_DIR } from "./paths";
import type { AdminEntry, OnboardingGroup, UserProfile } from "./types";
import type { StoredUser } from "./types";

function profilePath(userId: string) {
  return path.join(PROFILES_DIR, `${userId}.json`);
}

export function getUserProfile(userId: string): UserProfile | null {
  ensureDataDirs();
  const file = profilePath(userId);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as UserProfile;
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
    personalTraining: [],
    preferences: {},
    updatedAt: new Date().toISOString(),
  };
  saveUserProfile(profile);
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
