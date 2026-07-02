"use client";

import { useCallback, useEffect, useState } from "react";
import type { JudeMode } from "@jude/store";
import type { MarketplaceAppId } from "@/lib/marketplace-apps";

export type JudeAccountProfile = {
  connectedAppIds: string[];
  appSettings: {
    weatherZip?: string;
    mode?: JudeMode;
    dockOrder?: string[];
  };
  integrations: {
    gmail?: { email: string; connectedAt: string };
  };
};

export type JudeAccountUser = {
  id: string;
  username: string;
  displayName: string;
};

type AccountState = {
  loading: boolean;
  user: JudeAccountUser | null;
  profile: JudeAccountProfile | null;
};

export function useJudeAccount() {
  const [state, setState] = useState<AccountState>({
    loading: true,
    user: null,
    profile: null,
  });

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/session");
    const data = await response.json();
    if (!data.authenticated || data.role !== "user") {
      setState({ loading: false, user: null, profile: null });
      return null;
    }
    setState({
      loading: false,
      user: data.user,
      profile: data.profile,
    });
    return data.profile as JudeAccountProfile;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveConnectedApps = useCallback(async (connectedAppIds: MarketplaceAppId[]) => {
    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "connectedApps", connectedAppIds }),
    });
    const data = await response.json();
    if (response.ok) {
      setState((current) => ({
        ...current,
        profile: data.profile,
      }));
    }
    return response.ok;
  }, []);

  const saveAppSettings = useCallback(
    async (input: { weatherZip?: string; mode?: JudeMode; dockOrder?: string[] }) => {
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "appSettings", ...input }),
      });
      const data = await response.json();
      if (response.ok) {
        setState((current) => ({
          ...current,
          profile: data.profile,
        }));
      }
      return response.ok;
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }, []);

  return {
    ...state,
    refresh,
    saveConnectedApps,
    saveAppSettings,
    logout,
  };
}
