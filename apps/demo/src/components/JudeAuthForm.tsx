"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function JudeAuthForm({ mode }: { mode: "login" | "register" }) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const errorParam = searchParams.get("error");
  const error =
    errorParam === "invalid"
      ? "Invalid username or password."
      : errorParam
        ? decodeURIComponent(errorParam)
        : null;
  const formAction = mode === "register" ? "/api/auth/sign-up" : "/api/auth/sign-in";

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

        <form className="jude-auth__form" action={formAction} method="POST">
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
            <input name="username" autoComplete="username" required defaultValue={mode === "login" ? "33" : undefined} />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              defaultValue={mode === "login" ? "33" : undefined}
            />
          </label>
          {error && <p className="jude-auth__error">{error}</p>}
          <button type="submit" className="jude-auth__submit">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {process.env.NODE_ENV === "development" && mode === "login" && (
          <p className="jude-auth__switch jude-auth__local-hint">
            <a href={`/api/dev/login?next=${encodeURIComponent(nextPath)}`}>Skip login (dev account 33)</a>
          </p>
        )}

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
