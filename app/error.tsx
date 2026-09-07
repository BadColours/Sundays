"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="shell error-page"><Link className="wordmark" href="/">sundays<span>.</span></Link><section id="content"><span className="section-number">TEMPORARILY UNAVAILABLE</span><h1>We couldn’t load this page.</h1><p>Your saved projects haven’t changed. Please try again.</p><div className="form-actions"><button className="mvp-button" onClick={reset}>Try again</button><Link href="/demo">Browse the demo ↗</Link></div></section></main>;
}
