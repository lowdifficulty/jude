"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { loginAction, registerAction, type AuthActionState } from "@/app/auth-actions";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || (mode === "register" ? "/onboarding" : "/my-jude");
  const action = mode === "register" ? registerAction : loginAction;
  const [state, formAction, pending] = useActionState<AuthActionState | null, FormData>(
    action,
    null
  );

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

          <form className="register-form auth-form" action={formAction}>
            <input type="hidden" name="next" value={nextPath} />
            {mode === "register" && (
              <label>
                Display name
                <input
                  name="displayName"
                  placeholder="Mom, Dad, The Smiths…"
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Username
              <input name="username" autoComplete="username" required />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>
            {state?.error && <p className="auth-error">{state.error}</p>}
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
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
