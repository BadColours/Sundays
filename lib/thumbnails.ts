import { bindings, getProjectById, setProjectLinkHealth, setThumbnailState } from "../db/repository";
import { probePublicUrl } from "./url-safety";

const MAX_THUMBNAIL_BYTES = 5_000_000;

export async function captureProjectThumbnail(projectId: string) {
  const project = await getProjectById(projectId);
  if (!project) return;
  const runtime = bindings();
  if (!runtime.THUMBNAILS) {
    await setThumbnailState(projectId, "failed", null, "Thumbnail storage is not configured.");
    return;
  }
  if (!runtime.SCREENSHOT_API_URL) {
    await setThumbnailState(projectId, "failed", null, "Automatic capture is not configured yet.");
    return;
  }

  try {
    const safeUrl = await probePublicUrl(project.live_url);
    await setProjectLinkHealth(projectId, true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    let response: Response;
    try {
      response = await fetch(runtime.SCREENSHOT_API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "image/webp,image/png,image/jpeg",
          ...(runtime.SCREENSHOT_API_TOKEN ? { authorization: `Bearer ${runtime.SCREENSHOT_API_TOKEN}` } : {}),
        },
        body: JSON.stringify({
          url: safeUrl,
          viewport: { width: 1440, height: 1024 },
          output: { format: "webp", quality: 82, width: 1200, height: 850 },
          security: { blockPrivateNetworks: true, maxRedirects: 3 },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) throw new Error(`Capture service returned ${response.status}.`);
    const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
    if (!contentType.startsWith("image/")) throw new Error("Capture service did not return an image.");
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_THUMBNAIL_BYTES) throw new Error("Captured image is too large.");
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_THUMBNAIL_BYTES) throw new Error("Captured image is empty or too large.");
    const extension = contentType === "image/webp" ? "webp" : contentType === "image/png" ? "png" : "jpg";
    const key = `projects/${project.id}/${crypto.randomUUID()}.${extension}`;
    await runtime.THUMBNAILS.put(key, bytes, { httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" } });
    await setThumbnailState(projectId, "ready", key, null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thumbnail capture failed.";
    await setThumbnailState(projectId, "failed", null, message.slice(0, 180));
  }
}

export function thumbnailUrl(storageKey: string | null) {
  return storageKey ? `/thumbnail/${storageKey.split("/").map(encodeURIComponent).join("/")}` : null;
}
