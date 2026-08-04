import { bindings, getProjectById, setProjectLinkHealth, setThumbnailState } from "../db/repository";
import { validatePublicUrl } from "./url-safety";

const MAX_THUMBNAIL_BYTES = 5_000_000;
const DEFAULT_SCREENSHOT_API_URL = "https://webshot.site/api/capture";

export async function captureProjectThumbnail(projectId: string) {
  const project = await getProjectById(projectId);
  if (!project) return;
  const runtime = bindings();
  if (!runtime.THUMBNAILS) {
    await setThumbnailState(projectId, "failed", null, "Thumbnail storage is not configured.");
    return;
  }
  try {
    const safeUrl = validatePublicUrl(project.live_url).toString();
    const screenshotApiUrl = runtime.SCREENSHOT_API_URL ?? DEFAULT_SCREENSHOT_API_URL;
    const isWebshot = new URL(screenshotApiUrl).hostname === "webshot.site";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50_000);
    let response: Response;
    try {
      response = await fetch(screenshotApiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "image/webp,image/png,image/jpeg",
          ...(runtime.SCREENSHOT_API_TOKEN ? { authorization: `Bearer ${runtime.SCREENSHOT_API_TOKEN}` } : {}),
        },
        body: JSON.stringify(isWebshot ? {
          url: safeUrl,
          format: "webp",
          mode: "desktop_viewport",
        } : {
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
    await setProjectLinkHealth(projectId, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Thumbnail capture failed.";
    await setThumbnailState(projectId, "failed", null, message.slice(0, 180));
  }
}

export function thumbnailUrl(storageKey: string | null) {
  return storageKey ? `/thumbnail/${storageKey.split("/").map(encodeURIComponent).join("/")}` : null;
}
