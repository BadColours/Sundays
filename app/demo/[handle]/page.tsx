import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectPreview } from "../../ProjectPreview";
import { galleryProjects } from "../../fixtures/demoGallery";

export default async function DemoAppPage({ params }: { params: Promise<{ handle: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { handle } = await params;
  const project = galleryProjects.find((item) => item.handle === handle);
  if (!project) notFound();

  return (
    <main className="demo-app-stage">
      <Link className="demo-app-back" href="/explore">← sundays</Link>
      <div className={`demo-app-surface${project.thumbnail ? " image" : ""}`}>
        {project.thumbnail
          ? <img src={project.thumbnail} alt={`${project.title} application`} />
          : <ProjectPreview type={project.preview} title={project.title} />}
      </div>
    </main>
  );
}
