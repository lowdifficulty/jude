import { Suspense } from "react";
import { JudeAuthForm } from "@/components/JudeAuthForm";

export default function LoginPage() {
  return (
    <main>
      <Suspense fallback={<div className="jude-auth">Loading…</div>}>
        <JudeAuthForm mode="login" />
      </Suspense>
    </main>
  );
}
