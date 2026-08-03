import { SiteNav } from "../SiteNav";

export default function AboutPage() {
  return (
    <main>
      <SiteNav active="about" />
      <section className="about-page route-page shell">
        <span className="about-index">ABOUT / SUNDAYS</span>
        <h1>For people who make things<br className="about-break" /> after they&apos;re done making things.</h1>
      </section>
    </main>
  );
}
