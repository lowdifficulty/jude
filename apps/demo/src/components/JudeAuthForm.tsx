"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthActionState } from "@/app/auth-actions";

export function JudeAuthForm({ mode }: { mode: "login" | "register" }) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const action = mode === "register" ? registerAction : loginAction;
  const [state, formAction, pending] = useActionState<AuthActionState | null, FormData>(
    action,
    null
  );

  return (
    <div className="jude-auth">
      <div className="jude-auth__panel">
        <p className="jude-auth__kicker">{mode === "login" ? "Welcome back" : "Your Jude account"}</p>
        <h1>{mode === "login" ? "Sign in to Jude" : "Create your Jude account"}</h1>
        <p className="jude-auth__lead">
          {mode === "login"
            ? "Sign in so Jude remembers your apps, preferences, and connected services on every device."
            : "Register once. Your Jude saves everything securely to your account — same experience on every wall."}
        </p>

        <form className="jude-auth__form" action={formAction}>
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
          {state?.error && <p className="jude-auth__error">{state.error}</p>}
          <button type="submit" className="jude-auth__submit" disabled={pending}>
            {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="jude-auth__switch">
          {mode === "login" ? (
            <>
              New to Jude?{" "}
              <Link href={`/register?next=${encodeURIComponent(nextPath)}`}>Create an account</Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
