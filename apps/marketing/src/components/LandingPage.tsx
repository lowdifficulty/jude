"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

const pillars = [
  {
    title: "Home",
    description:
      "Smart home control, safety, routines, and a house that feels simpler — not smarter-than-you.",
    href: "/home-benefits",
  },
  {
    title: "Health",
    description:
      "Gentle medication reminders, check-ins, telehealth support, and daily care without the clinic feel.",
    href: "/health-benefits",
  },
  {
    title: "Happiness",
    description:
      "Music, memories, family connection, companionship, and the little moments that make a day brighter.",
    href: "/happiness-benefits",
  },
];

const features = [
  {
    title: "Part of the family",
    description:
      "Jude lives on your wall and helps with everyday life — reminders, recipes, weather, and a friendly voice when you need one.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21s-6-4.35-8-7.5C2.5 11 4.5 7 8 7c1.75 0 3 1 4 2 1-1 2.25-2 4-2 3.5 0 5.5 4 4 6.5-2 3.15-8 7.5-8 7.5z" />
      </svg>
    ),
  },
  {
    title: "Connected to what matters",
    description:
      "Friends, family, email, calendar, smart home, and your favorite AI tools — all in one place that anyone can use.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="5" cy="7" r="2" />
        <circle cx="19" cy="7" r="2" />
        <circle cx="5" cy="17" r="2" />
        <circle cx="19" cy="17" r="2" />
        <path d="M7 8.2l3.2 2.8M16.8 8.2L13.6 11M7 15.8l3.2-2.8M16.8 15.8l-3.2-2.8" />
      </svg>
    ),
  },
  {
    title: "Simple for everyone",
    description:
      "No menus to memorize. No tech degree required. Jude is like Jarvis, but warm enough that your grandmother or aunt will love him.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 14.5c.75 1.25 2 2 3.5 2s2.75-.75 3.5-2" />
        <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Your home, your rules",
    description:
      "Lighting, climate, music, security — Jude keeps an eye on everything and stays out of the way until you need him.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
        <path d="M12 8v4M10 10h4" />
      </svg>
    ),
  },
];

const plans = [
  {
    id: "standard",
    name: "Jude",
    badge: "Most popular",
    tagline: "For every home",
    hardware: 199,
    monthly: 99,
    featured: true,
    features: [
      "Wall-mounted display & speaker",
      "Smart home, calendar & email",
      "Family & friend connections",
      "Voice that anyone can use",
    ],
  },
  {
    id: "pro",
    name: "Jude Pro",
    tagline: "For advanced users",
    hardware: 999,
    monthly: 299,
    featured: false,
    features: [
      "Everything in Jude, plus",
      "Advanced AI integrations",
      "Multi-room & multi-user setup",
      "Priority support & updates",
    ],
  },
];

const offGrid = {
  name: "Jude Off-Grid",
  tagline: "Homestead & secure operations",
  features: [
    "Fully self-contained system",
    "On-premise database included",
    "No cloud dependency",
    "White-glove installation",
  ],
};

function formatPrice(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function LandingPage() {
  return (
    <div className="landing">
      <SiteNav />

      {/* Hero — green */}
      <section className="section-green">
        <div className="section-inner">
          <div className="hero-grid">
            <div style={{ animation: "fade-up 0.8s ease-out" }}>
              <p className="section-label">Home, Health, and Happiness on the wall</p>
              <h1
                className="section-title"
                style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
              >
                Your home.
                <br />
                Your friend.
              </h1>
              <p className="section-lead" style={{ marginBottom: "2rem" }}>
                Jude is a warm, wall-mounted AI companion for older adults and the
                families who love them — daily routines, family connection, safety
                check-ins, and the little moments that make a house feel like home.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <a href="#pricing" className="btn-primary">
                  See pricing
                </a>
                <a
                  href="https://jude.one"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  See the demo →
                </a>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                animation: "fade-up 0.8s ease-out 0.2s both",
              }}
            >
              <div className="demo-preview">
                <div className="demo-preview-label">Jude</div>
                <div className="demo-preview-orb" />
                <div className="demo-preview-status">
                  <span>Lighting · Warm</span>
                  <span>72°</span>
                  <span>All calm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars — cream */}
      <section className="section-cream">
        <div className="section-inner">
          <p className="section-label">Three ways Jude helps</p>
          <h2 className="section-title">Home. Health. Happiness.</h2>
          <div className="pillar-grid">
            {pillars.map((pillar) => (
              <Link key={pillar.title} href={pillar.href} className="pillar-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
                <span className="pillar-link">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features — white */}
      <section id="features" className="section-white">
        <div className="section-inner">
          <p className="section-label">Why Jude</p>
          <h2 className="section-title">Everything your home needs</h2>
          <p className="section-lead">
            Pull up a chair. Jude handles the rest — quietly, warmly, and without
            making anyone feel left behind.
          </p>
          <div className="feature-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card-white">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story — cream */}
      <section className="section-cream">
        <div className="section-inner">
          <div className="story-block">
            <div>
              <p className="section-label">Built for real people</p>
              <blockquote className="story-quote">
                &ldquo;Technology should feel like a good neighbor — there when
                you need it, quiet when you don&apos;t.&rdquo;
              </blockquote>
              <p className="story-attribution">
                That&apos;s the whole idea behind Jude. Not cold. Not complicated.
                Just home.
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                  color: "var(--ink-muted)",
                  fontWeight: 300,
                }}
              >
                Mount Jude on the wall like a piece of art. He connects your
                friends, family, email, calendar, and every AI tool you already
                use — without making Aunt Betty feel like she needs a computer
                science degree.
              </p>
              <p
                style={{
                  marginTop: "1.25rem",
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                  color: "var(--ink-muted)",
                  fontWeight: 300,
                }}
              >
                Whether you&apos;re running a busy household or need something
                more, there&apos;s a Jude that fits the way you live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — white */}
      <section id="pricing" className="section-white">
        <div className="section-inner">
          <p className="section-label">Simple, honest pricing</p>
          <h2 className="section-title">Choose your Jude</h2>
          <p className="section-lead">
            One-time hardware. Monthly service. No surprises, no fine print
            written by lawyers.
          </p>

          <div className="pricing-grid pricing-grid-two">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card${plan.featured ? " pricing-card-featured" : ""}`}
              >
                {plan.badge && (
                  <span className="pricing-badge">{plan.badge}</span>
                )}
                <h3 className="pricing-name">{plan.name}</h3>
                <p className="pricing-tagline">{plan.tagline}</p>

                <div className="pricing-amount">
                  <div className="pricing-hardware">
                    {formatPrice(plan.hardware)}{" "}
                    <span>hardware</span>
                  </div>
                </div>
                <p className="pricing-monthly">
                  {formatPrice(plan.monthly)}/month
                </p>

                <ul className="pricing-features">
                  {plan.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <a href="#register" className="pricing-cta">
                  Get started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Off-Grid — cream */}
      <section id="offgrid" className="section-cream">
        <div className="section-inner">
          <div className="offgrid-block">
            <div className="offgrid-copy">
              <p className="section-label">Off the grid, on your terms</p>
              <h2 className="section-title">{offGrid.name}</h2>
              <p className="section-lead">
                A fully air-gapped Jude with its own on-premise database — no
                cloud, no outside connection required. Perfect for homesteads
                and secure business operations where privacy isn&apos;t optional.
              </p>
              <ul className="offgrid-features">
                {offGrid.features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="offgrid-card">
              <p className="offgrid-contact">Contact for pricing</p>
              <p className="offgrid-contact-note">
                Every Off-Grid install is custom — we&apos;ll walk through your
                setup and put together a quote.
              </p>
              <p className="offgrid-tagline">{offGrid.tagline}</p>
              <a href="#register" className="btn-primary offgrid-cta">
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Registration — green */}
      <section id="register" className="section-green">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <p className="section-label">Welcome home</p>
          <h2 className="section-title">Get early access</h2>
          <p
            className="section-lead"
            style={{ margin: "0 auto 2rem", textAlign: "center" }}
          >
            Create your account to play with the Jude demo and be first in line
            when we launch.
          </p>

          <div className="register-actions" style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-primary">
              Create your Jude account
            </Link>
            <Link href="/login" className="btn-secondary">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
