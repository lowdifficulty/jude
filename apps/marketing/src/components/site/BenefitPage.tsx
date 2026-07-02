import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { JudePage } from "@/lib/content";
import { extractFaqs } from "@/lib/content";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

export function BenefitPage({ page }: { page: JudePage }) {
  const faqs = extractFaqs(page.body);
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="landing">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <SiteNav />

      <article className="benefit-page">
        <header className="benefit-hero section-green">
          <div className="section-inner benefit-hero-inner">
            <p className="section-label">Jude for {page.title}</p>
            <div className="benefit-markdown benefit-markdown-hero">
              <ReactMarkdown>{page.body.split("---")[0]}</ReactMarkdown>
            </div>
            <div className="benefit-hero-actions">
              <Link href="/#register" className="btn-primary">
                Join the Jude waitlist
              </Link>
              <a
                href="https://jude.one"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Talk to Jude
              </a>
            </div>
          </div>
        </header>

        <div className="benefit-body section-white">
          <div className="section-inner benefit-markdown">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => {
                  if (!href) return <span>{children}</span>;
                  if (href.startsWith("http")) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    );
                  }
                  return <Link href={href.replace(/\/$/, "")}>{children}</Link>;
                },
              }}
            >
              {page.body.split("---").slice(1).join("---")}
            </ReactMarkdown>
          </div>
        </div>

        <section className="section-cream">
          <div className="section-inner final-cta-block">
            <h2 className="section-title">Bring a little more peace into the house.</h2>
            <p className="section-lead" style={{ maxWidth: 560 }}>
              Jude helps older adults live safer, healthier, happier, and more
              independent lives at home.
            </p>
            <div className="benefit-hero-actions">
              <Link href="/#register" className="btn-primary">
                Join the Jude waitlist
              </Link>
              <Link href="/" className="btn-secondary">
                Explore the benefits
              </Link>
            </div>
          </div>
        </section>
      </article>

      <SiteFooter />
    </div>
  );
}
