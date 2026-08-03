import { SiteNav } from "../SiteNav";

export default function AboutPage() {
  return (
    <main>
      <SiteNav active="about" />
      <section className="about-page shell">
        <span className="about-index">ABOUT / SUNDAYS</span>
        <h1>For people who make things<br className="about-break" /> after they&apos;re done making things.</h1>
        <div className="about-mvp-copy"><p>Sundays is a curated gallery of personal software made after hours. Creators keep hosting and control of every project.</p><p>We store a listing, public GitHub identity, and promotional thumbnail—never repositories or application code.</p></div>
      </section>
    </main>
  );
}
