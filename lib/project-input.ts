import { probePublicUrl, validatePublicUrl } from "./url-safety";

export function readProjectFields(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const rawUrl = String(form.get("live_url") ?? "").trim();
  if (title.length < 2 || title.length > 80) throw new Error("Project title must be between 2 and 80 characters.");
  if (description.length < 10 || description.length > 240) throw new Error("Description must be between 10 and 240 characters.");
  const parsed = validatePublicUrl(rawUrl);
  return { title, description, liveUrl: parsed.toString() };
}

export async function verifyProjectFields(form: FormData) {
  const fields = readProjectFields(form);
  const liveUrl = await probePublicUrl(fields.liveUrl);
  return { ...fields, liveUrl };
}

export function formErrorUrl(path: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message.slice(0, 180))}`;
}
