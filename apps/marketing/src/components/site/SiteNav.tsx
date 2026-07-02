"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import siteData from "@/data/site-data.json";

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <Link
          href="/"
          className="landing-nav-logo"
          onClick={() => setMenuOpen(false)}
        >
          Jude
        </Link>

        <button
          type="button"
          className="landing-nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="landing-nav-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="landing-nav-menu"
          className={`landing-nav-links${menuOpen ? " landing-nav-links--open" : ""}`}
        >
          {siteData.navigation.primary.map((item) => (
            <Link
              key={item.href}
              href={item.href.replace(/\/$/, "") || "/"}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://jude.one"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary landing-nav-cta"
            onClick={() => setMenuOpen(false)}
          >
            Talk to Jude
          </a>
        </div>
      </div>
    </nav>
  );
}
