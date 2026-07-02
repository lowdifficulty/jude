"use client";

import { FormEvent, useState } from "react";

const features = [
  {
    title: "Part of the family",
    description:
      "Jude lives on your wall and helps with everyday life — reminders, recipes, weather, and a friendly voice when you need one.",
  },
  {
    title: "Connected to what matters",
    description:
      "Friends, family, email, calendar, smart home, and your favorite AI tools — all in one place that anyone can use.",
  },
  {
    title: "Simple for everyone",
    description:
      "No menus to memorize. No tech degree required. Jude is like Jarvis, but warm enough that your grandmother or aunt will love him.",
  },
  {
    title: "Your home, your rules",
    description:
      "Lighting, climate, music, security — Jude keeps an eye on everything and stays out of the way until you need him.",
  },
];

export function LandingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Placeholder — wire to your auth provider later
    await new Promise((r) => setTimeout(r, 800));

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 2rem",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <span
          style={{
            fontSize: "1.5rem",
            fontWeight: 300,
            letterSpacing: "-0.02em",
          }}
        >
          Jude
        </span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a
            href="#features"
            style={{ color: "rgba(245,240,234,0.6)", fontSize: "0.95rem" }}
          >
            Features
          </a>
          <a
            href="#register"
            style={{ color: "rgba(245,240,234,0.6)", fontSize: "0.95rem" }}
          >
            Get started
          </a>
          <a
            href="https://jude.one"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: 999,
              border: "1px solid rgba(245,240,234,0.2)",
              fontSize: "0.9rem",
              color: "rgba(245,240,234,0.85)",
              transition: "background 0.2s",
            }}
          >
            Try the demo
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "4rem 2rem 6rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        <div style={{ animation: "fade-up 0.8s ease-out" }}>
          <p
            style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(245,240,234,0.4)",
              marginBottom: "1rem",
            }}
          >
            Home AI, reimagined
          </p>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "1.25rem",
            }}
          >
            Your home.
            <br />
            Your friend.
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              color: "rgba(245,240,234,0.65)",
              maxWidth: 440,
              marginBottom: "2rem",
              fontWeight: 300,
            }}
          >
            Jude is a wall-mounted AI that helps with everything around the
            house. Like Alexa, but not stupid. Like Jarvis, but someone your
            whole family actually wants to talk to.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="#register"
              style={{
                display: "inline-block",
                padding: "0.85rem 2rem",
                borderRadius: 999,
                background: "linear-gradient(135deg, #ffd080, #e8a040)",
                color: "#1a1510",
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              Create your account
            </a>
            <a
              href="https://jude.one"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "0.85rem 2rem",
                borderRadius: 999,
                border: "1px solid rgba(245,240,234,0.2)",
                color: "rgba(245,240,234,0.8)",
                fontSize: "0.95rem",
              }}
            >
              See the demo →
            </a>
          </div>
        </div>

        {/* Preview orb */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            animation: "fade-up 0.8s ease-out 0.2s both",
          }}
        >
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: 24,
              background:
                "radial-gradient(ellipse at 70% 45%, #2a2218 0%, #1a1510 45%, #0f0d0a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(245,240,234,0.08)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 28,
                fontSize: "1.25rem",
                fontWeight: 300,
                color: "rgba(245,240,234,0.7)",
              }}
            >
              Jude
            </div>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 40% 35%, #fff8e8 0%, #ffd080 30%, #e8a040 60%, #c07020 100%)",
                animation: "orb-glow 4s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: 28,
                right: 28,
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.65rem",
                color: "rgba(245,240,234,0.35)",
              }}
            >
              <span>Lighting · Warm</span>
              <span>72°</span>
              <span>All calm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{
          background: "rgba(0,0,0,0.2)",
          padding: "5rem 2rem",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 300,
              marginBottom: "3rem",
              textAlign: "center",
            }}
          >
            Everything your home needs
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "2rem",
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: "1.75rem",
                  borderRadius: 16,
                  background: "rgba(245,240,234,0.04)",
                  border: "1px solid rgba(245,240,234,0.06)",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 400,
                    marginBottom: "0.75rem",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "rgba(245,240,234,0.55)",
                    fontWeight: 300,
                    lineHeight: 1.65,
                  }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration */}
      <section
        id="register"
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "5rem 2rem 6rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 300,
            marginBottom: "0.75rem",
          }}
        >
          Get early access
        </h2>
        <p
          style={{
            color: "rgba(245,240,234,0.55)",
            marginBottom: "2rem",
            fontWeight: 300,
          }}
        >
          Create your account to play with the Jude demo and be first in line
          when we launch.
        </p>

        {submitted ? (
          <div
            style={{
              padding: "2rem",
              borderRadius: 16,
              background: "rgba(255,208,128,0.08)",
              border: "1px solid rgba(255,208,128,0.2)",
            }}
          >
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Welcome to the family, {name || "friend"}.
            </p>
            <p style={{ color: "rgba(245,240,234,0.55)", fontSize: "0.95rem" }}>
              Check your inbox at {email}. In the meantime,{" "}
              <a
                href="https://jude.one"
                style={{ color: "#ffd080", textDecoration: "underline" }}
              >
                try the demo
              </a>
              .
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              textAlign: "left",
            }}
          >
            <input
              type="text"
              placeholder="Your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: 10,
                border: "1px solid rgba(245,240,234,0.12)",
                background: "rgba(245,240,234,0.04)",
                color: "#f5f0ea",
                outline: "none",
              }}
            />
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: 10,
                border: "1px solid rgba(245,240,234,0.12)",
                background: "rgba(245,240,234,0.04)",
                color: "#f5f0ea",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.5rem",
                padding: "0.9rem",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #ffd080, #e8a040)",
                color: "#1a1510",
                fontWeight: 500,
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating account…" : "Create account & try demo"}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(245,240,234,0.06)",
          padding: "2rem",
          textAlign: "center",
          color: "rgba(245,240,234,0.3)",
          fontSize: "0.85rem",
        }}
      >
        <p>© {new Date().getFullYear()} Jude · urjude.com</p>
        <p style={{ marginTop: "0.35rem" }}>
          <a href="https://jude.one" style={{ color: "rgba(245,240,234,0.4)" }}>
            jude.one
          </a>
          {" · "}
          Demo interface
        </p>
      </footer>
    </div>
  );
}
