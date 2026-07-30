import Link from "next/link";
import { ProjectPreview } from "../ProjectPreview";

const projects = [
  { number: "06", title: "Hush", maker: "Jon Bell", stack: "Web Audio · React", handle: "jonbell", preview: "hush" },
  { number: "05", title: "Commonplace", maker: "Anika Bose", stack: "Svelte · SQLite", handle: "anikabose", preview: "index" },
  { number: "04", title: "Radio Silence", maker: "Eli Morgan", stack: "Web Audio · Vite", handle: "elimorgan", preview: "radio" },
  { number: "03", title: "Bearings", maker: "Noor Ahmed", stack: "MapLibre · GPS", handle: "noorahmed", preview: "navigation" },
  { number: "02", title: "Altitude", maker: "Maya Chen", stack: "Three.js · TypeScript", handle: "mayachen", preview: "flight" },
  { number: "01", title: "Touchline", maker: "Theo Hart", stack: "React · Canvas", handle: "theohart", preview: "soccer" },
];

export function ArchiveStream() {
  return (
    <div className="archive-list">
      {projects.map((project) => (
        <Link className="archive-row" href={`/maker/${project.handle}`} key={project.number}>
          <span className="archive-number">{project.number}</span>
          <div className="archive-thumb"><ProjectPreview type={project.preview} /></div>
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
