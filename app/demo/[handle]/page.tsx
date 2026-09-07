import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectPreview } from "../../ProjectPreview";
import { galleryProjects, projectSlug } from "../../fixtures/demoGallery";

export default async function DemoAppPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const project = galleryProjects.find((item) => projectSlug(item) === handle);
  if (!project) notFound();

  return (
    <main className="demo-app-stage">
      <header className="demo-app-header"><Link href="/demo/explore">← Demo gallery</Link><h1>{project.title}</h1><Link href={`/demo/maker/${project.handle}`}>{project.maker} ↗</Link><p>Static concept preview · not a working application</p></header>
      <div id="content" className={`demo-app-surface${project.thumbnail ? " image" : ""}`}>
        {project.thumbnail
          ? <img className="demo-edge-bleed" src={project.thumbnail} alt={`${project.title} application`} />
          : <ProjectPreview type={project.preview} title={project.title} />}
      </div>
    </main>
  );
}
