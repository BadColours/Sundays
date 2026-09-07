import Link from "next/link";

export function SiteFooter({ demo = false }: { demo?: boolean }) {
  return <footer className="footer minimal-footer shell"><Link className="wordmark" href={demo ? "/demo" : "/"}>sundays<span>.</span><small>offhours</small></Link><small>{demo ? "Demo" : "© 2026"}</small></footer>;
}
