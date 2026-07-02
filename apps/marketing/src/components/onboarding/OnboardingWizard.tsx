"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import {
  getDevicesForGroups,
  onboardingGroups,
  phase1Apis,
  phase2Apis,
  type OnboardingGroup,
} from "@/lib/integrations";
import { JUDE_DEMO_URL } from "@/lib/jude-urls";

const STEPS = ["welcome", "pick", "results"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>("welcome");
  const [selected, setSelected] = useState<OnboardingGroup[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const devices = useMemo(() => getDevicesForGroups(selected), [selected]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setAuthenticated(Boolean(d.authenticated)))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (step !== "results" || !authenticated || selected.length === 0) return;

    void fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "onboarding",
        onboardingGroups: selected,
        connectedDeviceIds: devices.map((d) => d.id),
      }),
    }).then(() => {
      setSaveMessage("Saved to your personal Jude.");
    });
  }, [step, authenticated, selected, devices]);

  const toggleGroup = (id: OnboardingGroup) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((g) => g !== id) : [...current, id]
    );
  };

  const goToResults = () => {
    if (!authenticated) {
      window.location.href = `/register?next=/onboarding`;
      return;
    }
    setStep("results");
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="landing onboarding">
      <SiteNav />

      <main className="onboarding-main">
        <div className="onboarding-progress" aria-hidden="true">
          {STEPS.map((name, index) => (
            <span
              key={name}
              className={`onboarding-progress-dot${index <= stepIndex ? " onboarding-progress-dot--active" : ""}`}
            />
          ))}
        </div>

        {step === "welcome" && (
          <section className="onboarding-panel">
            <p className="onboarding-kicker">Connect Jude</p>
            <h1>Let&apos;s connect your home</h1>
            <p className="onboarding-lead">
              Jude works best when he can see your calendar, talk through your phone, watch over your home,
              and support health routines. Create an account so your choices save to your personal Jude.
            </p>
            <ul className="onboarding-bullets">
              <li>Phase 1: email, calendar, voice, smart home hub, lights, health basics</li>
              <li>Phase 2: patient portals, streaming, groceries, rides, and more</li>
              <li>Your onboarding saves to My Jude — intelligence just for your household</li>
            </ul>
            {!authenticated && (
              <p className="onboarding-muted">
                <Link href="/register">Create an account</Link> or <Link href="/login">sign in</Link> to save preferences.
              </p>
            )}
            <button type="button" className="btn-primary" onClick={() => setStep("pick")}>
              Start connecting
            </button>
          </section>
        )}

        {step === "pick" && (
          <section className="onboarding-panel">
            <p className="onboarding-kicker">Step 2 of 3</p>
            <h1>What do you want Jude to connect?</h1>
            <p className="onboarding-lead">
              Choose the home and health hardware categories that fit your family. You can select more than one.
            </p>
            <div className="onboarding-grid">
              {onboardingGroups.map((group) => {
                const active = selected.includes(group.id);
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`onboarding-card${active ? " onboarding-card--active" : ""}`}
                    aria-pressed={active}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <h2>{group.title}</h2>
                    <p>{group.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="onboarding-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep("welcome")}>
                Back
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={selected.length === 0}
                onClick={goToResults}
              >
                See recommended products
              </button>
            </div>
          </section>
        )}

        {step === "results" && (
          <section className="onboarding-panel">
            <p className="onboarding-kicker">Your Jude stack</p>
            <h1>Recommended integrations</h1>
            <p className="onboarding-lead">
              Based on your choices, here are representative devices Jude can connect to — one per category,
              with mainstream APIs and family-friendly setup.
            </p>
            {saveMessage && <p className="auth-success">{saveMessage}</p>}

            {devices.length === 0 ? (
              <p className="onboarding-muted">Go back and pick at least one category.</p>
            ) : (
              <div className="onboarding-products">
                {devices.map((device) => (
                  <article key={device.id} className="onboarding-product">
                    <div>
                      <p className="onboarding-product-label">{device.categoryLabel}</p>
                      <h2>{device.name}</h2>
                      {device.priceHint && <p className="onboarding-muted">{device.priceHint}</p>}
                      <ul>
                        {device.judeBenefits.map((benefit) => (
                          <li key={benefit}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <a
                      href={device.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      View product
                    </a>
                  </article>
                ))}
              </div>
            )}

            <div className="onboarding-api-section">
              <h2>APIs Jude will need (Phase 1)</h2>
              <ul className="onboarding-api-list">
                {phase1Apis.slice(0, 10).map((api) => (
                  <li key={api.id}>
                    <strong>{api.name}</strong> — {api.why}
                  </li>
                ))}
              </ul>
              <p className="onboarding-muted">
                Plus {phase1Apis.length - 10} more high-impact APIs including {phase2Apis.length} Phase 2 expansions.
              </p>
            </div>

            <div className="onboarding-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep("pick")}>
                Change selections
              </button>
              <Link href="/my-jude" className="btn-secondary">
                My Jude
              </Link>
              <a href={JUDE_DEMO_URL} className="btn-primary" target="_blank" rel="noopener noreferrer">
                Open wall demo
              </a>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
