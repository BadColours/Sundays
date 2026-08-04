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
      <Link className="demo-app-back" href="/demo/explore">← demo gallery</Link>
      <div className={`demo-app-surface${project.thumbnail ? " image" : ""}`}>
        {project.thumbnail
          ? <img src={project.thumbnail} alt={`${project.title} application`} />
          : <ProjectPreview type={project.preview} title={project.title} />}
      </div>
    </main>
  );
}
