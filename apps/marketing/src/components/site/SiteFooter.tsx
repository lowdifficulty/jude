import Link from "next/link";
import siteData from "@/data/site-data.json";

export function SiteFooter() {
  const groups = siteData.footerGroups as Record<
    string,
    { label: string; href: string }[]
  >;

  return (
    <footer className="site-footer section-cream">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          {Object.entries(groups).map(([group, links]) => (
            <div key={group}>
              <h4>{group}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="site-footer-bottom">
          <p>© {new Date().getFullYear()} Jude · urjude.com</p>
          <p>
            <a href="https://jude.one" target="_blank" rel="noopener noreferrer">
              jude.one
            </a>
            {" · "}
            Talk to the demo
          </p>
        </div>
      </div>
    </footer>
  );
}
