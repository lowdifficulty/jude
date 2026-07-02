import { Suspense } from "react";
import { JudeInterface } from "@/components/JudeInterface";

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div className="jude-auth jude-auth--loading">Loading your Jude…</div>}>
        <JudeInterface />
      </Suspense>
    </main>
  );
}