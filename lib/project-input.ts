import { probePublicUrl, validatePublicUrl } from "./url-safety";
import type { VerificationStatus } from "../db/repository";

export function readProjectFields(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const rawUrl = String(form.get("live_url") ?? "").trim();
  const rawRepositoryUrl = String(form.get("repository_url") ?? "").trim();
  if (title.length < 2 || title.length > 80) throw new Error("Project title must be between 2 and 80 characters.");
  if (description.length < 10 || description.length > 240) throw new Error("Description must be between 10 and 240 characters.");
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
}

export async function verifyProjectFields(form: FormData, githubHandle: string) {
  const fields = readProjectFields(form);
  const liveUrl = await probePublicUrl(fields.liveUrl);
  let repositoryUrl = fields.repositoryUrl;
  let verificationStatus: VerificationStatus = "unverified";
  if (repositoryUrl) {
    repositoryUrl = await probePublicUrl(repositoryUrl);
    const owner = new URL(repositoryUrl).pathname.split("/").filter(Boolean)[0] ?? "";
    if (owner.toLowerCase() === githubHandle.toLowerCase()) verificationStatus = "verified";
  }
  return { ...fields, liveUrl, repositoryUrl, verificationStatus };
}

export function formErrorUrl(path: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message.slice(0, 180))}`;
}
