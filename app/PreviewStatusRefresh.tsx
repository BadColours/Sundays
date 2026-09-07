"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PreviewStatusRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const started = Date.now();
    const interval = window.setInterval(() => {
      if (Date.now() - started > 90_000) { window.clearInterval(interval); return; }
      if (document.visibilityState === "visible" && !document.activeElement?.closest("form")) router.refresh();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [active, router]);

  return null;
}
