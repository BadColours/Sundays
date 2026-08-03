import { SiteNav } from "../SiteNav";

export default function AboutPage() {
  return (
    <main>
      <SiteNav active="about" />
      <section className="about-page shell">
        <span className="about-index">ABOUT / SUNDAYS</span>
        <h1>For people who make things<br className="about-break" /> after they&apos;re done making things.</h1>
        <div className="about-mvp-copy"><p>Anyone can make a public creator profile on Sundays with GitHub—no invitation and no editorial approval.</p><p>Projects stay hosted and controlled by their makers. A basic review applies only to gallery placement; we never store repositories or application code.</p></div>
      </section>
    </main>
  );
}
