import Link from "next/link";
import { SiteNav } from "./SiteNav";

export default function NotFound() {
  return <main><SiteNav /><section id="content" tabIndex={-1} className="shell error-page"><span className="section-number">404 / NOT FOUND</span><h1>This page isn’t here.</h1><p>The link may have changed, or the project may no longer be public.</p><Link className="text-link" href="/explore">Back to the collection ↗</Link></section></main>;
}
