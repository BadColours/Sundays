import Link from "next/link";
import { ProjectPreview } from "../ProjectPreview";

const projects = [
  { number: "06", title: "Field Study", maker: "Bo Hart", stack: "MapLibre · GPS", handle: "bohart", preview: "mock-34", thumbnail: "/explore-thumbs/35.png" },
  { number: "05", title: "Hush", maker: "Jon Bell", stack: "Web Audio · React", handle: "jonbell", preview: "hush" },
  { number: "04", title: "Bearings", maker: "Noor Ahmed", stack: "MapLibre · GPS", handle: "noorahmed", preview: "navigation" },
  { number: "03", title: "Altitude", maker: "Maya Chen", stack: "Three.js · TypeScript", handle: "mayachen", preview: "flight" },
  { number: "02", title: "Shortcut", maker: "Noa Bloom", stack: "MapLibre · GPS", handle: "noabloom", preview: "mock-27", thumbnail: "/explore-thumbs/28.png" },
  { number: "01", title: "Touchline", maker: "Theo Hart", stack: "React · Canvas", handle: "theohart", preview: "soccer" },
];

export function ArchiveStream() {
  return (
    <div className="archive-list">
      {projects.map((project) => (
        <Link className="archive-row" href={`/maker/${project.handle}`} key={project.number}>
          <span className="archive-number">{project.number}</span>
          <div className="archive-thumb">
            {project.thumbnail
              ? <img src={project.thumbnail} alt={`Preview of ${project.title}`} />
              : <ProjectPreview type={project.preview} />}
          </div>
          <strong>{project.title}</strong>
          <span>{project.maker}</span>
          <span>{project.stack}</span>
          <span>2026</span>
          <b>↗</b>
        </Link>
      ))}
    </div>
  );
}
