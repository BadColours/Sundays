import { validatePublicUrl } from "./url-safety.ts";
import type { VerificationStatus } from "../db/repository";

export function readProjectFields(form: FormData) {
  try {
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const rawUrl = String(form.get("live_url") ?? "").trim();
  const rawRepositoryUrl = String(form.get("repository_url") ?? "").trim();
  if (title.length < 2 || title.length > 80) throw new Error("Project title must be between 2 and 80 characters.");
  if (description.length < 10 || description.length > 240) throw new Error("Description must be between 10 and 240 characters.");
  if (rawUrl.length > 2048 || rawRepositoryUrl.length > 500) throw new Error("That URL is too long.");
  const parsed = validatePublicUrl(rawUrl);
  let repositoryUrl: string | null = null;
  if (rawRepositoryUrl) {
    const repository = validatePublicUrl(rawRepositoryUrl);
    const parts = repository.pathname.split("/").filter(Boolean);
    if (repository.hostname.toLowerCase() !== "github.com" || parts.length !== 2) throw new Error("Enter a GitHub repository URL such as https://github.com/you/project.");
    repository.search = "";
    repository.hash = "";
    repository.pathname = `/${parts[0]}/${parts[1].replace(/\.git$/i, "")}`;
    repositoryUrl = repository.toString();
  }
  return { title, description, liveUrl: parsed.toString(), repositoryUrl };
  } catch (cause) {
    const error = new Error(cause instanceof Error ? cause.message : "Check the project fields."); error.name = "InputError"; throw error;
  }
}

export async function verifyProjectFields(form: FormData, githubHandle: string) {
  const fields = readProjectFields(form);
  const repositoryUrl = fields.repositoryUrl;
  let verificationStatus: VerificationStatus = "unverified";
  if (repositoryUrl) {
    const owner = new URL(repositoryUrl).pathname.split("/").filter(Boolean)[0] ?? "";
    if (owner.toLowerCase() === githubHandle.toLowerCase()) {
      try {
        const path = new URL(repositoryUrl).pathname;
        const response = await fetch(`https://api.github.com/repos${path}`, {
          headers: { accept: "application/vnd.github+json", "user-agent": "Sundays-Gallery" },
          signal: AbortSignal.timeout(5_000),
        });
        if (response.ok) {
          const repository = await response.json() as { owner?: { login?: string }; private?: boolean };
          if (repository.private === false && repository.owner?.login?.toLowerCase() === githubHandle.toLowerCase()) verificationStatus = "verified";
        }
      } catch { /* A GitHub outage must not prevent sharing an unverified project. */ }
    }
  }
  return { ...fields, repositoryUrl, verificationStatus };
}

export function formErrorUrl(path: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message.slice(0, 180))}`;
}
