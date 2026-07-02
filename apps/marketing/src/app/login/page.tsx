import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

function AuthFormFallback() {
  return (
    <div className="landing onboarding">
      <main className="onboarding-main">
        <p className="onboarding-muted">Loading…</p>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFormFallback />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
