"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { getDevicesForGroups, type OnboardingGroup } from "@/lib/integrations";
import { JUDE_DEMO_URL } from "@/lib/jude-urls";

type Profile = {
  onboardingGroups: OnboardingGroup[];
  connectedDeviceIds: string[];
  personalTraining: Array<{ id: string; title: string; category: string; text: string }>;
  preferences: { notes?: string };
};

export default function MyJudePage() {
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notes, setNotes] = useState("");
  const [trainTitle, setTrainTitle] = useState("");
  const [trainText, setTrainText] = useState("");
  const [message, setMessage] = useState("");
  const [demoSsoUrl, setDemoSsoUrl] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/auth/session");
    const data = await response.json();
    if (!response.ok || !data.authenticated) {
      window.location.href = "/login";
      return;
    }
    setDisplayName(data.user.displayName);
    setProfile(data.profile);
    setDemoSsoUrl(data.demoSsoUrl || "");
    setNotes(data.profile.preferences?.notes || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveNotes = async (event: FormEvent) => {
    event.preventDefault();
    await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "notes", notes }),
    });
    setMessage("Preferences saved.");
    void load();
  };

  const addTraining = async (event: FormEvent) => {
    event.preventDefault();
    await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "training",
        title: trainTitle,
        category: "personal",
        text: trainText,
      }),
    });
    setTrainTitle("");
    setTrainText("");
    setMessage("Added to your personal Jude intelligence.");
    void load();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="landing onboarding">
        <SiteNav />
        <main className="onboarding-main">
          <p className="onboarding-muted">Loading your Jude…</p>
        </main>
      </div>
    );
  }

  const devices = profile ? getDevicesForGroups(profile.onboardingGroups) : [];

  return (
    <div className="landing onboarding">
      <SiteNav />
      <main className="onboarding-main">
        <section className="onboarding-panel">
          <p className="onboarding-kicker">My Jude</p>
          <h1>{displayName}&apos;s Jude</h1>
          <p className="onboarding-lead">
            Your saved preferences and personal intelligence. Jude uses this to tailor answers for your home.
          </p>
          {message && <p className="auth-success">{message}</p>}

          <div className="my-jude-grid">
            <article className="onboarding-product">
              <h2>Connected categories</h2>
              {profile?.onboardingGroups?.length ? (
                <ul>
                  {profile.onboardingGroups.map((group) => (
                    <li key={group}>{group}</li>
                  ))}
                </ul>
              ) : (
                <p className="onboarding-muted">
                  No onboarding saved yet.{" "}
                  <Link href="/onboarding">Complete setup</Link>
                </p>
              )}
            </article>

            <article className="onboarding-product">
              <h2>Your devices</h2>
              {devices.length ? (
                <ul>
                  {devices.map((device) => (
                    <li key={device.id}>
                      <a href={device.productUrl} target="_blank" rel="noopener noreferrer">
                        {device.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="onboarding-muted">Pick hardware in onboarding to see recommendations.</p>
              )}
            </article>
          </div>

          <form className="register-form auth-form" onSubmit={saveNotes}>
            <label>
              Notes for Jude
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Favorite music, medication schedule, family names…"
              />
            </label>
            <button type="submit" className="btn-secondary">
              Save preferences
            </button>
          </form>

          <form className="register-form auth-form" onSubmit={addTraining}>
            <h2>Add personal intelligence</h2>
            <label>
              Title
              <input value={trainTitle} onChange={(e) => setTrainTitle(e.target.value)} required />
            </label>
            <label>
              What should Jude know?
              <textarea
                rows={5}
                value={trainText}
                onChange={(e) => setTrainText(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary">
              Add to my Jude
            </button>
          </form>

          <div className="onboarding-actions">
            <Link href="/onboarding" className="btn-secondary">
              Update onboarding
            </Link>
            <a href={demoSsoUrl || JUDE_DEMO_URL} className="btn-primary">
              Open your Jude wall
            </a>
            <button type="button" className="btn-secondary" onClick={logout}>
              Sign out
            </button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
