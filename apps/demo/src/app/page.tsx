"use client";

import { useEffect, useState } from "react";
import { JudeInterface } from "@/components/JudeInterface";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main
        style={{
          width: "100vw",
          height: "100vh",
          background:
            "radial-gradient(ellipse at 70% 45%, #2a2218 0%, #1a1510 45%, #0f0d0a 100%)",
        }}
      />
    );
  }

  return (
    <main>
      <JudeInterface />
    </main>
  );
}
