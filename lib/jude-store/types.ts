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

export type JudeMode = "good" | "evil";

export type GmailIntegration = {
  email: string;
  connectedAt: string;
};

export type UserIntegrations = {
  gmail?: GmailIntegration;
};

export type UserProfile = {
  userId: string;
  username: string;
  displayName: string;
  onboardingGroups: OnboardingGroup[];
  connectedDeviceIds: string[];
  /** Marketplace apps connected to this account (synced across devices). */
  connectedAppIds: string[];
  /** Per-app settings synced with the account. */
  appSettings: {
    weatherZip?: string;
    mode?: JudeMode;
    personalityId?: string;
    dockOrder?: string[];
  };
  integrations: UserIntegrations;
  personalTraining: AdminEntry[];
  preferences: {
    quietHours?: string;
    notes?: string;
  };
  updatedAt: string;
};

export type GmailTokenRecord = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
  connectedAt: string;
};

export type UserIntegrationsFile = {
  gmail?: GmailTokenRecord;
};
