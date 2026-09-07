"use client";
import { useEffect, useRef, useState } from "react";

/** Keep entered fields on validation/network failure and prevent double submits. */
export function ProjectForm({ action, className, children }: { action: string; className: string; children: React.ReactNode }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const notice = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  useEffect(() => { if (error) notice.current?.focus(); }, [error]);
  return <form action={action} method="post" className={className} aria-busy={pending} onSubmit={async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    const form = new FormData(event.currentTarget);
    inFlight.current = true;
    setPending(true); setError("");
    try {
      const response = await fetch(action, { method:"POST", body:form, headers:{accept:"application/json"} });
      const result = await response.json() as { error?: string; location?: string };
      if (!response.ok || result.error) throw new Error(result.error ?? "Your changes couldn’t be saved. Please try again.");
      if (!result.location?.startsWith("/") || result.location.startsWith("//")) throw new Error("Please reload your dashboard to check whether the project was saved.");
      window.location.assign(result.location);
    } catch (cause) {
      setError(cause instanceof Error && !(cause instanceof SyntaxError) ? cause.message : "We couldn’t save your changes. Your entries are still here; please try again.");
      setPending(false); inFlight.current = false;
    }
  }}>
    {error && <div ref={notice} className="form-notice error" role="alert" tabIndex={-1}>{error}</div>}
    <fieldset disabled={pending}>{children}</fieldset>
    {pending && <p className="save-status" role="status">Saving your project…</p>}
  </form>;
}
