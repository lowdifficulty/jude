import { Suspense } from "react";
import { JudeAuthForm } from "@/components/JudeAuthForm";

export default function RegisterPage() {
  return (
    <main>
      <Suspense fallback={<div className="jude-auth">Loading…</div>}>
        <JudeAuthForm mode="register" />
      </Suspense>
    </main>
  );
}
