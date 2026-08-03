import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorByHandle, listPublishedProjectsForCreator } from "../../../db/repository";
import { ProjectThumbnail } from "../../ProjectThumbnail";
import { SiteNav } from "../../SiteNav";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  try {
    const creator = await getCreatorByHandle(handle);
    if (!creator) return { title: "Maker not found — sundays" };
    return { title: `${creator.display_name} (@${creator.github_handle}) — sundays`, description: `Published projects by ${creator.display_name} on Sundays.` };
  } catch { return { title: "Maker — sundays" }; }
}

export default async function MakerPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  let creator;
  try { creator = await getCreatorByHandle(handle); } catch { creator = null; }
  if (!creator) notFound();
  const projects = await listPublishedProjectsForCreator(creator.id);
  return (
    <main className="profile">
      <SiteNav />
      <section className="profile-hero shell mvp-profile-hero">
        <div className="profile-index">MAKER / @{creator.github_handle}</div>
        <img className="github-avatar-large" src={creator.avatar_url} alt="" />
        <div className="profile-title"><h1>{creator.display_name}</h1><a className="text-link" href={creator.github_profile_url} target="_blank" rel="noopener noreferrer">GitHub profile ↗</a></div>
      </section>
      <section className="profile-work shell">
        <div className="profile-projects mvp-profile-projects">
          {projects.map((project) => (
            <article className="profile-project-card" key={project.id}>
              <a className="profile-thumb creator-image-frame" href={project.live_url} target="_blank" rel="noopener noreferrer"><ProjectThumbnail project={project} /></a>
              <div className="profile-project-caption"><strong><a href={project.live_url} target="_blank" rel="noopener noreferrer">{project.title}</a></strong><small>{project.short_description}</small><a href={project.live_url} target="_blank" rel="noopener noreferrer">Launch project ↗</a></div>
            </article>
          ))}
          {projects.length === 0 && <div className="profile-no-projects"><span>PUBLIC PROFILE</span><p>{creator.display_name} has not added a project to the gallery yet.</p></div>}
        </div>
      </section>
      <footer className="profile-footer shell"><Link href="/explore">← Explore more makers</Link><small>© 2026 sundays · offhours</small></footer>
    </main>
  );
}
