"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, displayName }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Registration failed.");
          return;
        }
        router.push(data.redirectUrl || "/onboarding");
        return;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      if (data.role === "admin") {
        sessionStorage.setItem(
          "jude_admin_bridge",
          JSON.stringify({ username, password, ts: Date.now() })
        );
        window.location.href = data.redirectUrl;
        return;
      }

      router.push(data.redirectUrl || "/my-jude");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing onboarding">
      <SiteNav />
      <main className="onboarding-main">
        <section className="onboarding-panel">
          <p className="onboarding-kicker">{mode === "login" ? "Welcome back" : "Join Jude"}</p>
          <h1>{mode === "login" ? "Sign in" : "Create your Jude account"}</h1>
          <p className="onboarding-lead">
            {mode === "login"
              ? "Sign in to your personal Jude — saved preferences, onboarding, and intelligence just for your home."
              : "Register to get a savable Jude with your own preferences and connected devices."}
          </p>

          <form className="register-form auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <label>
                Display name
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Mom, Dad, The Smiths…"
                />
              </label>
            )}
            <label>
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="onboarding-muted auth-switch">
            {mode === "login" ? (
              <>
                New to Jude? <Link href="/register">Create an account</Link>
              </>
            ) : (
              <>
                Already have an account? <Link href="/login">Sign in</Link>
              </>
            )}
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
