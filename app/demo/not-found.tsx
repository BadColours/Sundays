import Link from "next/link";
import { SiteNav } from "../SiteNav";

export default function NotFound() {
  return <main><SiteNav demo /><section id="content" tabIndex={-1} className="shell error-page"><span className="section-number">DEMO / NOT FOUND</span><h1>This demo isn’t here.</h1><Link className="text-link" href="/demo/explore">Back to the demo collection ↗</Link></section></main>;
}
