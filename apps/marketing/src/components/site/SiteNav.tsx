import Link from "next/link";
import siteData from "@/data/site-data.json";

export function SiteNav() {
  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <Link
          href="/"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.5rem",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          Jude
        </Link>
        <div className="landing-nav-links">
          {siteData.navigation.primary.map((item) => (
            <Link key={item.href} href={item.href.replace(/\/$/, "") || "/"}>
              {item.label}
            </Link>
          ))}
          <a
            href="https://jude.one"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}
          >
            Talk to Jude
          </a>
        </div>
      </div>
    </nav>
  );
}
