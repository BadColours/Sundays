import { ArchiveStream } from "./ArchiveStream";
import { SiteNav } from "../SiteNav";

export default function ArchivePage() {
  return (
    <main>
      <SiteNav active="archive" />
      <section className="shell"><ArchiveStream /></section>
    </main>
  );
}
