export type OnboardingGroup =
  | "communication"
  | "home"
  | "health"
  | "entertainment"
  | "family";

export type AdminEntry = {
  id: string;
  title: string;
  category: string;
  text: string;
  createdAt: string;
};

export type TrainingSnapshot = {
  id: string;
  createdAt: string;
  label: string;
  action: "save" | "delete" | "clear" | "revert" | "relearn";
  entries: AdminEntry[];
};

export type StoredUser = {
  id: string;
  username: string;
  displayName: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
};

export type UserProfile = {
  userId: string;
  username: string;
  displayName: string;
  onboardingGroups: OnboardingGroup[];
  connectedDeviceIds: string[];
  personalTraining: AdminEntry[];
  preferences: {
    quietHours?: string;
    notes?: string;
  };
  updatedAt: string;
};
