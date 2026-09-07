"use client";
import { useState } from "react";
export function CreatorAvatar({ src, name, className = "" }: { src: string | undefined; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <img className={className} src={src} alt="" ref={node => { if (node?.complete && node.naturalWidth === 0) setFailed(true); }} onError={() => setFailed(true)} /> : <span className={`avatar-fallback ${className}`} aria-hidden="true">{name.split(/\s+/).slice(0,2).map(part=>part[0]).join("").toUpperCase()}</span>;
}
